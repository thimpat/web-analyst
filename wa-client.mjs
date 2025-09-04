(async function () {
    // Clicks
    const MAX_EVENTS = 200;

    // Scrolls
    let lastScrollY = 0;
    let lastScrollTime = 0;
    const SCROLL_THRESHOLD = 100;
    const SCROLL_INTERVAL = 500;

    let totalDuration = 0;
    let activeStart = null;
    const evList = [];

    let forcePort = document.location.port === "8010" ? "8092" : document.location.port;
    const protocol = document.location.protocol;
    const baseUrl = document.location.hostname;
    let serverPath = "/wa-plus";
    let serverUrl = serverPath;
    if (forcePort) {
        const urlObj = new URL(`${serverPath}`, `${protocol}//${baseUrl}:${forcePort}`);
        serverUrl = urlObj.toString();
    }

    console.log("wa-client version 1.08");

    // -------------------------------------------------
    // Utility
    // -------------------------------------------------
    function lzwEncode(str) {
        if (!str) {
            return str;
        }
        const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
        const d = new Map();
        str=unescape(encodeURIComponent(str)).split("");
        let word = str[0];
        let num = 256;
        let key;
        const o = [];

        function out(word) {
            key=word.length>1 ? d.get(word) : word.charCodeAt(0);
            o.push(b64[key&0x3f]);
            o.push(b64[(key>>6)&0x3f]);
            o.push(b64[(key>>12)&0x3f]);
        }
        for (let i=1; i<str.length; i++) {
            const c = str[i];
            if (d.has(word+c)) {
                word+=c;
            } else {
                d.set(word+c,num++);
                out(word);
                word=c;
                if(num==(1<<18)-1) {
                    d.clear();
                    num=256;
                }
            }
        }
        out(word);
        return o.join("");
    }

    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            // This can throw a SecurityError if the parent is on a different origin.
            // In this case, we know for sure we are in an iframe.
            return true;
        }
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
        if (evList.length >= MAX_EVENTS) {
            evList.shift();
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

        const page = document.location.pathname + document.location.search + document.location.hash;
        const entry = {
            type: "click",
            target: event.target.tagName,              // Element type (e.g., BUTTON, DIV)
            timestamp: new Date().toISOString(),       // ISO format for consistency
            selector: getLeanSelector(el),
            page,
            coordinates: {
                x: event.clientX,                        // X position relative to viewport
                y: event.clientY                         // Y position relative to viewport
            }
        };

        filterAnalytics();

        evList.push(entry);
    }

    function recordScroll() {
        const now = Date.now();
        const currentY = window.scrollY || this.scrollTop;

        if (
            Math.abs(currentY - lastScrollY) >= SCROLL_THRESHOLD &&
            now - lastScrollTime >= SCROLL_INTERVAL
        ) {
            filterAnalytics();

            const page = document.location.pathname + document.location.search + document.location.hash;
            const entry = {
                type: "scroll",
                selector: getLeanSelector(this),
                container: getLeanSelector(this),
                timestamp: new Date().toISOString(),
                page,
                scrollY: currentY
            };

            evList.push(entry);
            lastScrollY = currentY;
            lastScrollTime = now;
        }
    }

    function getRecordedEvents() {
        return evList;
    }

     // -------------------------------------------------
    // endpoint-related
    // -------------------------------------------------
    /**
     * @obsolete
     * @returns {Promise<void>}
     */
    async function uploadAnalytics(usedTechnics) {
        let visitor = getLocalVisitor();
        if (!visitor) {
            setLocalVisitor();
            visitor = getLocalVisitor();
        }

        const data = generateDataAnalytics();
        if (!data) {
            return;
        }

        try {

            const str = JSON.stringify({visitor, data});
            const payload = lzwEncode(str);

            if (usedTechnics === "beacon") {
                // The data for sendBeacon needs to be a Blob or a simple string
                // const beaconData = JSON.stringify({"wa-stats": payload});
                // const blob = new Blob([beaconData], {type: "application/plain"});

                const data = new URLSearchParams({"wa-stats": payload});
                navigator.sendBeacon(serverUrl, data);
            }
            else {
                const response = await fetch(serverUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({"wa-stats": payload}),
                });

                if (!response.ok) {
                    console.error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    console.error("Error processing data");
                    return ;
                }
                data.events = [data.events];
            }

        } catch (error) {
            console.error("Error uploading data:", error);
        }
    }

    async function init() {

        await initialiseDurations();

        document.addEventListener("DOMContentLoaded", () => {
            document.addEventListener("click", function (event) {
                recordClick(event);
            });
            document.body.addEventListener("scroll", recordScroll);

            updateDuration();
            uploadAnalytics("fetch");
        });

        // --------------------
        // Monitor changes
        // --------------------
        window.addEventListener("visibilitychange", () => {
            updateDuration();
            uploadAnalytics("fetch");
        });

        window.addEventListener("beforeunload", () => {
            updateDuration();
            uploadAnalytics("beacon");
        });

        window.addEventListener("popstate", () => {
            updateDuration();
            uploadAnalytics("fetch");
        });

        window.addEventListener("hashchange", () => {
            updateDuration();
            uploadAnalytics("fetch");
        });

        document.addEventListener("dblclick", () => {
            uploadAnalytics("fetch");
        });
    }

    if (isInIframe()) {
        console.log("wa iframe Mode");
        return ;
    }

    console.log("wa standard Mode");
    await init();

})();