(async function () {
    // Clicks
    const MAX_EVENTS = 200;

    const clickAnalytics = [];
    let serverUrl = "/wa-replay";
    let forcePort = document.location.port === "8010" ? "8092" : document.location.port;
    const protocol = document.location.protocol;
    const baseUrl = document.location.hostname;
    if (forcePort) {
        const urlObj = new URL(`${serverUrl}`, `${protocol}//${baseUrl}:${forcePort}`);
        serverUrl = urlObj.toString();
    }
    console.log("web-analyst replayer v1.0");

    // -------------------------------------------------
    // Utility
    // -------------------------------------------------
    /**
     * Creates and inserts an iframe into the document body with a specified URL.
     * * @param {string} url The URL to load in the iframe.
     * @returns {HTMLIFrameElement} The created iframe element.
     */
    function createIframe(url) {
        const iframe = document.createElement("iframe");
        iframe.id = "replay-iframe";
        iframe.classList.add("replay-iframe");
        iframe.src = url;

        // Append the iframe to the document body
        document.body.appendChild(iframe);

        return iframe;
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

    function getRecordedEvents() {
        return clickAnalytics;
    }

    // -------------------------------------------------
    // Replay
    // -------------------------------------------------
    function generateLinks(arr, { targetDiv = "body", maxLinks = 20 } = {}) {
        if (!Array.isArray(arr)) {
            console.error("First argument must be an array");
            return;
        }

        let cleanBaseUrl = document.location.origin + "/wa-replay";
        // Ensure proper URL formatting (remove trailing slash if present)
        cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "");

        const limitedArr = arr.slice(0, maxLinks);
        const container = document.createElement("div");
        container.id="wa-replay-list-container";
        container.classList.add("wa-replay-list-container");

        limitedArr.forEach(id => {
            const link = document.createElement("a");
            link.href = `${cleanBaseUrl}?tokenStatID=${id}`;
            link.textContent = id;
            link.className = "generated-link";

            container.appendChild(link);
            container.appendChild(document.createElement("br"));
        });

        const targetElement = targetDiv === "body"
            ? document.body
            : typeof targetDiv === "string"
                ? document.getElementById(targetDiv)
                : targetDiv;

        if (!targetElement) {
            console.error("Target element not found");
            return;
        }

        targetElement.appendChild(container);
    }
    
    async function fetchRecordedEvents() {
        const response = await fetch(serverUrl + "?" + new URLSearchParams({
        }).toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const list = result.content;
        console.log(result);
        generateLinks(list);
    }

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
                        el.scrollTo({top: event.scrollY, behavior: "smooth"});
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

        document.addEventListener("keydown", function (event) {
            const isCtrlR = event.altKey && event.key.toLowerCase() === "p";

            if (isCtrlR) {
                event.preventDefault();
                console.log("🔁 CTRL + R pressed — starting replay");
                replayEvents();
            }
        });

        await fetchRecordedEvents();
        createIframe(document.location.origin);

    }

    await init();

})();