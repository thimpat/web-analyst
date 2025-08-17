(async function () {
    // Clicks
    const MAX_EVENTS = 200;

    // Scrolls
    let lastScrollY = 0;
    let lastScrollTime = 0;
    const SCROLL_THRESHOLD = 100; // px
    const SCROLL_INTERVAL = 500;  // ms


    let totalDuration = 0;
    let activeStart = null;
    const clickAnalytics = [];

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
            console.error?.({lid: "WA5435"}, e.message);
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
            console.error?.({lid: "WA5432"}, e.message);
            return null;
        }
    }

    // -------------------------------------------------
    // Analytics
    // -------------------------------------------------
    function getDeviceType() {
        const ua = navigator.userAgent;

        if (/CrOS/i.test(ua)) {
            return "chromebook";
        }
        if (/iPad|Tablet/i.test(ua)) {
            return "tablet";
        }
        if (/Mobi|Android/i.test(ua)) {
            return "mobile";
        }
        return "desktop";
    }

    async function updateDuration() {
        const now = Date.now();
        if (activeStart) {
            totalDuration += now - activeStart;
        }
    }

    /**
     * Calculate the duration the app was opened
     * @returns {Promise<void>}
     */
    async function initialiseDurations() {
        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                activeStart = Date.now();
            } else {
                // Tab is not opened
                updateDuration();
                activeStart = null;
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange);
        if (document.visibilityState === "visible") {
            activeStart = Date.now();
        }
    }

    /**
     * Keep full navigational context
     */
    function getVisitedPage() {
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
            visitedPage: getVisitedPage(),
            events: getRecordedEvents()
        };
    }

    // -------------------------------------------------
    // advanced-analytics (to detect bots)
    // -------------------------------------------------
    function filterAnalytics() {
        // Maintain max size by removing oldest
        if (clickAnalytics.length >= MAX_EVENTS) {
            clickAnalytics.shift();
        }
    }

    function getLeanSelector(el) {
        if (el.id) {
            return `#${el.id}`;
        }

        const path = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
            const tag = el.tagName.toLowerCase();

            // Count siblings of same type
            const siblings = Array.from(el.parentNode.children).filter(
                sibling => sibling.tagName === el.tagName
            );
            const index = siblings.indexOf(el) + 1;

            const selector = `${tag}:nth-of-type(${index})`;
            path.unshift(selector);

            // Stop early if selector is unique enough
            const testSelector = path.join(" > ");
            if (document.querySelectorAll(testSelector).length === 1) break;

            el = el.parentNode;
        }

        return path.join(" > ");
    }

    function recordClick(event) {
        const el = event.target;

        const entry = {
            type: "click",
            target: event.target.tagName,              // Element type (e.g., BUTTON, DIV)
            timestamp: new Date().toISOString(),       // ISO format for consistency
            selector: getLeanSelector(el),
            coordinates: {
                x: event.clientX,                        // X position relative to viewport
                y: event.clientY                         // Y position relative to viewport
            }
        };

        filterAnalytics();

        clickAnalytics.push(entry);
    }

    function recordScroll() {
        const now = Date.now();
        const currentY = window.scrollY || this.scrollTop;

        if (
            Math.abs(currentY - lastScrollY) >= SCROLL_THRESHOLD &&
            now - lastScrollTime >= SCROLL_INTERVAL
        ) {
            filterAnalytics();

            const entry = {
                type: "scroll",
                selector: getLeanSelector(this),
                timestamp: new Date().toISOString(),
                scrollY: currentY
            };

            clickAnalytics.push(entry);
            lastScrollY = currentY;
            lastScrollTime = now;
        }
    }

    function getRecordedEvents() {
        return clickAnalytics;
    }

    function fetchRecordedEvents() {
        return clickAnalytics;
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
            const str = JSON.stringify({visitor, data});
            const payload = lzwEncode(str);

            // The data for sendBeacon needs to be a Blob or a simple string
            const beaconData = JSON.stringify({"wa-stats": payload});
            const blob = new Blob([beaconData], {type: "application/json"});

            // Use navigator.sendBeacon() for reliable data transmission on page unload
            navigator.sendBeacon(serverUrl, blob);

        } catch (error) {
            console.error("Error uploading analytics:", error);
        }
    }


    // -------------------------------------------------
    // Replay
    // -------------------------------------------------
    function blockUserInteraction() {
        const blocker = document.createElement("div");
        blocker.id = "replay-blocker";
        Object.assign(blocker.style, {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "auto",
            background: "transparent",
            cursor: "not-allowed"
        });
        document.body.appendChild(blocker);
    }

    function unblockUserInteraction() {
        const blocker = document.getElementById("replay-blocker");
        if (blocker) blocker.remove();
    }

    function simulateClick(el) {
        ["mousedown", "mouseup", "click"].forEach(type => {
            const evt = new MouseEvent(type, {bubbles: true, cancelable: true});
            el.dispatchEvent(evt);
        });
    }

    function replayEvents() {
        const events = getRecordedEvents();
        if (!events || events.length === 0) {
            return;
        }

        try {
            blockUserInteraction();

            const sortedEvents = [...events].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
            const startTime = new Date(sortedEvents[0].timestamp).getTime();

            sortedEvents.forEach((event, index) => {
                const delay = new Date(event.timestamp).getTime() - startTime;

                setTimeout(() => {
                    const el = document.querySelector(event.selector);
                    if (!el) return;

                    if (event.type === "scroll") {
                        console.log("Replay scroll event:", event);
                        el.scrollTo({ top: event.scrollY, behavior: "smooth" });
                    } else if (event.type === "click") {
                        console.log("Replay click event:", event);
                        simulateClick(el);
                    }

                    // 🏁 Detect last event
                    if (index === sortedEvents.length - 1) {
                        console.log("✅ Replay complete");
                        unblockUserInteraction();
                    }
                }, delay);
            });

        } catch (e) {
            console.error("Replay failed:", e);
            unblockUserInteraction();
        }
    }


    async function init() {

        await initialiseDurations();

        window.addEventListener("beforeunload", () => {
            updateDuration();
            uploadAnalyticsEnd();
        });

        document.addEventListener("DOMContentLoaded", () => {
            document.addEventListener("click", recordClick);
            document.body.addEventListener("scroll", recordScroll);
        });

        document.addEventListener("keydown", function (event) {
            const isCtrlR = event.ctrlKey && event.key.toLowerCase() === "p";

            if (isCtrlR) {
                event.preventDefault(); // Prevent browser refresh
                console.log("🔁 CTRL + R pressed — starting replay");
                replayEvents();
            }
        });

    }

    await init();

})();