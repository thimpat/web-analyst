(async function ()
{
    function lzwEncode(s) {
        let dict = {};
        let data = (s + "").split("");
        let out = [];
        let currChar;
        let phrase = data[0];
        let code = 256;
        for (let i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

        // Manually convert the LZW codes into a binary string
        let encoded = "";
        for (let i = 0; i < out.length; i++) {
            // Each code is a 12-bit value
            encoded += String.fromCharCode(out[i] & 0xFF, out[i] >> 8);
        }
        // Remove any padding if necessary
        encoded = encoded.substr(0, encoded.length - 1);

        return btoa(encoded);
    }

    function lzwDecode(s) {
        const data = atob(s);
        let dict = {};
        let out = [];
        let i = 0;

        // Read the first code (12 bits)
        let oldCode = data.charCodeAt(i) | (data.charCodeAt(i + 1) << 8);
        i += 2;
        let oldPhrase = String.fromCharCode(oldCode);
        out.push(oldPhrase);

        let code = 256;
        let newCode;
        let newPhrase;
        let currChar;

        while (i < data.length) {
            // Read the next code (12 bits)
            newCode = data.charCodeAt(i) | (data.charCodeAt(i + 1) << 8);
            i += 2;

            if (newCode < 256) {
                newPhrase = String.fromCharCode(newCode);
            } else {
                newPhrase = dict[newCode] ? dict[newCode] : (oldPhrase + oldPhrase.charAt(0));
            }

            out.push(newPhrase);
            currChar = newPhrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = newPhrase;
        }

        return out.join("");
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
            const decompressed = lzwDecode(match[1]);
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
            const str = JSON.stringify(merged);
            const compressed = lzwEncode(str);
            document.cookie = `wa-plus=${compressed}; path=/; max-age=86400`;
        }
        catch(e)
        {
            console.warn("Failed to compress analytics cookie", e);
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