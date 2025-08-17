(async function ()
{
    let totalDuration = 0;
    let activeStart = null;

    // -------------------------------------------------
    // Utility
    // -------------------------------------------------
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

    // -------------------------------------------------
    // ID
    // -------------------------------------------------
    function setLocalVisitor() {
        try {
            let token = localStorage.getItem("wa-token");
            let createdAt = localStorage.getItem("wa-created-at");

            const now = new Date();
            const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000 * 31).toUTCString();

            if (!token) {
                token = crypto.randomUUID();
                createdAt = now.getTime().toString();

                localStorage.setItem("wa-token", token);
                localStorage.setItem("wa-created-at", createdAt);
                localStorage.setItem("wa-expiration", expiration);
            }

            return {
                token,
                expiration,
                createdAt: parseInt(createdAt, 10)
            };
        } catch (e) {
            console.error?.({ lid: "WA5435" }, e.message);
            return null;
        }
    }

    function getLocalVisitor() {
        try {
            const token = localStorage.getItem("wa-token");
            if (!token) {
                return null;
            }

            const createdAt = localStorage.getItem("wa-created-at");

            return {
                token,
                createdAt: createdAt ? parseInt(createdAt, 10) : null
            };
        } catch (e) {
            console.error?.({ lid: "WA5432" }, e.message);
            return null;
        }
    }

    // -------------------------------------------------
    // Analytics
    // -------------------------------------------------
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

    async function updateDuration()
    {
        const now = Date.now();
        if (activeStart)
        {
            totalDuration += now - activeStart;
        }
    }

    /**
     * Calculate the duration the app was opened
     * @returns {Promise<void>}
     */
    async function initialiseDurations()
    {
        function handleVisibilityChange()
        {
            if (document.visibilityState === "visible")
            {
                activeStart = Date.now();
            }
            else
            {
                // Tab is not opened
                updateDuration();
                activeStart = null;
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        if (document.visibilityState === "visible")
        {
            activeStart = Date.now();
        }
    }

    /**
     * Keep full navigational context
     */
    function getVisitedPage()
    {
        return window.location.pathname + window.location.search + window.location.hash;
    }

    function generateDataAnalytics() {
        return {
            resolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            deviceType: getDeviceType(),
            pixelRatio: window.devicePixelRatio,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            durationMs: totalDuration,
            visitedPage: getVisitedPage()
        };
    }

    // -------------------------------------------------
    // endpoint-related
    // -------------------------------------------------
    async function uploadAnalytics() {

        let visitor = getLocalVisitor();
        if (!visitor) {
            setLocalVisitor();
            visitor = getLocalVisitor();
        }
        
        const data = generateDataAnalytics();
        if (!data) {
            return;
        }

        const serverUrl = "/wa-plus";

        try {

            const str = JSON.stringify({visitor, data});
            const payload = lzwEncode(str);

            const response = await fetch(serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({"wa-stats": payload}),
            });

            if (!response.ok) {
                // Check for a successful response (status code 200-299)
                console.error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            console.log("Success:", result);
        } catch (error) {
            console.error("Error uploading analytics:", error);
        }
    }

    function uploadAnalyticsEnd() {
        let visitor = getLocalVisitor();
        if (!visitor) {
            setLocalVisitor();
            visitor = getLocalVisitor();
        }

        const data = generateDataAnalytics();
        if (!data) {
            return;
        }

        const serverUrl = "/wa-plus";

        try {
            const str = JSON.stringify({ visitor, data });
            const payload = lzwEncode(str);

            // The data for sendBeacon needs to be a Blob or a simple string
            const beaconData = JSON.stringify({ "wa-stats": payload });
            const blob = new Blob([beaconData], { type: "application/json" });

            // Use navigator.sendBeacon() for reliable data transmission on page unload
            const isQueued = navigator.sendBeacon(serverUrl, blob);

            if (isQueued) {
                console.log("Analytics data successfully queued with sendBeacon.");
            } else {
                console.error("Failed to queue analytics data with sendBeacon.");
            }

        } catch (error) {
            console.error("Error uploading analytics:", error);
        }
    }

    await initialiseDurations();

    window.addEventListener("beforeunload", () => {
        updateDuration();
        uploadAnalyticsEnd();
    });

})();