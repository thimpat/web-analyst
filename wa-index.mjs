(async function ()
{
    /**
     * Converts an ArrayBuffer to Base64 string
     * @param {ArrayBuffer} buffer
     * @returns {string}
     */
    function arrayBufferToBase64(buffer)
    {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++)
        {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Converts a Base64 string to ArrayBuffer
     * @param {string} base64
     * @returns {ArrayBuffer}
     */
    function base64ToArrayBuffer(base64)
    {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++)
        {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Simple text compression using Base64 encoding
     * @param {string} text - Text to compress
     * @returns {string} - Compressed text
     */
    function simpleCompress(text)
    {
        // Convert text to Base64
        const compressed = btoa(encodeURIComponent(text));
        return compressed;
    }

    /**
     * Simple text decompression
     * @param {string} compressed - Compressed text
     * @returns {string} - Original text
     */
    function simpleDecompress(compressed)
    {
        // Convert from Base64 back to original
        return decodeURIComponent(atob(compressed));
    }

    /**
     * Decompresses text that was compressed with compressText()
     * @param {string} compressedBase64 - Base64-encoded compressed data
     * @param {string} [encoding='gzip'] - Compression format used ('gzip', 'deflate', or 'deflate-raw')
     * @returns {Promise<string>} - The decompressed original text
     */
    async function decompressText(compressedBase64, encoding = "gzip")
    {
        try
        {
            // Convert Base64 back to ArrayBuffer
            const compressedData = base64ToArrayBuffer(compressedBase64);

            // Convert ArrayBuffer to a stream
            const compressedStream = new Blob([compressedData]).stream();

            // Create decompression stream
            const decompressionStream = new DecompressionStream(encoding);

            // Pipe through decompression
            const decompressedStream = compressedStream.pipeThrough(decompressionStream);

            // Read the decompressed stream as text
            return await new Response(decompressedStream).text();
        }
        catch (e)
        {
            return simpleDecompress(compressedBase64);
        }
    }

    /**
     * Compresses text using the Compression Streams API
     * @param {string} text - The text to compress
     * @param {string} [encoding='gzip'] - Compression format ('gzip', 'deflate', or 'deflate-raw')
     * @returns {Promise<string>} - Compressed data as a Uint8Array
     */
    async function compressText(text, encoding = "gzip")
    {
        try
        {
            // Convert text to a stream of bytes
            const textStream = new Blob([text]).stream();

            // Create compression stream
            const compressionStream = new CompressionStream(encoding);

            // Pipe the text stream through the compression stream
            const compressedStream = textStream.pipeThrough(compressionStream);

            // Read the compressed stream into a Uint8Array
            const compressedBlob = await new Response(compressedStream).arrayBuffer();

            return arrayBufferToBase64(compressedBlob);
        }
        catch (e)
        {
            return simpleCompress(text);
        }
    }

    function generateId()
    {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function getDeviceType()
    {
        const ua = navigator.userAgent;

        if (/CrOS/i.test(ua))
        {
            return "chromebook";
        }
        if (/iPad|Tablet/i.test(ua))
        {
            return "tablet";
        }
        if (/Mobi|Android/i.test(ua))
        {
            return "mobile";
        }
        return "desktop";
    }

    async function getClientWACookie()
    {
        const match = document.cookie.match(/(?:^|;\s*)wa-plus=([^;]*)/);
        if (!match || !match[1])
        {
            return {};
        }
        try
        {
            const decompressed = await decompressText(match[1]);
            return JSON.parse(decompressed);
        }
        catch (err)
        {
            console.warn("Failed to decompress wa-plus cookie:", err);
            return {};
        }
    }

    async function setClientWACookie(newData)
    {
        try
        {
            const existing = await getClientWACookie();
            const merged = {...existing, ...newData};
            const compressed = await compressText(JSON.stringify(merged));
            document.cookie = `wa-plus=${compressed}; path=/; max-age=86400`;
        }
        catch
        {
            console.warn("Failed to compress analytics cookie");
        }
    }

    async function updateWACookie()
    {
        const existing = await getClientWACookie();

        const baseData = {
            tokenClientId: existing.tokenClientId || generateId(),
            resolution   : `${window.screen.width}x${window.screen.height}`,
            viewport     : `${window.innerWidth}x${window.innerHeight}`,
            deviceType   : getDeviceType(),
            pixelRatio   : window.devicePixelRatio,
            language     : navigator.language,
            timezone     : Intl.DateTimeFormat().resolvedOptions().timeZone,
            durationMs   : existing.durationMs || 0
        };

        await setClientWACookie({...existing, ...baseData});
    }

    async function addActiveDuration()
    {
        let activeStart = null;
        let totalDuration = 0;

        async function updateDuration()
        {
            const now = Date.now();
            if (activeStart)
            {
                totalDuration += now - activeStart;
                activeStart = null;

                const analytics = await getClientWACookie();
                const hasOtherFields = Object.keys(analytics).some(k => k !== "durationMs");

                analytics.durationMs = (analytics.durationMs || 0) + totalDuration;

                if (hasOtherFields)
                {
                    await setClientWACookie(analytics);
                }
                else
                {
                    console.warn("Skipping cookie update: analytics object is incomplete");
                }

                totalDuration = 0;
            }
        }

        function handleVisibilityChange()
        {
            if (document.visibilityState === "visible")
            {
                activeStart = Date.now();
            }
            else
            {
                updateDuration();
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", updateDuration);

        if (document.visibilityState === "visible")
        {
            activeStart = Date.now();
        }
    }

    /**
     * Keep full navigational context
     * @param maxEntries
     */
    async function addVisitedPage(maxEntries = 2)
    {
        const analytics = await getClientWACookie();
        const visited = analytics.visitedPages || [];

        const currentPage = window.location.pathname + window.location.search + window.location.hash;
        const timestamp = Date.now();
        const visitId = generateId();

        visited.push({page: currentPage, time: timestamp, visitId});

        analytics.visitedPages = visited.slice(-maxEntries);
        await setClientWACookie(analytics);
    }

    await updateWACookie();
    await addActiveDuration();
    await addVisitedPage();
})();