(async function () {

    const clickAnalytics = [];
    let serverUrl = "/wa-replay";
    let forcePort = document.location.port === "8010" ? "8092" : document.location.port;
    const protocol = document.location.protocol;
    const baseUrl = document.location.hostname;
    if (forcePort) {
        const urlObj = new URL(`${serverUrl}`, `${protocol}//${baseUrl}:${forcePort}`);
        serverUrl = urlObj.toString();
    }
    console.log("wa-replay v1.01");

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
    function getRecordedEvents() {
        return clickAnalytics;
    }

    // -------------------------------------------------
    // Replay
    // -------------------------------------------------
    // A global object to manage the state of the replay
    let eventState = {
        behaviors: [],
        currentBehaviorIndex: 0,
        currentEventIndex: -1,
        iframeContentWindow: null,
    };

// Helper function to create a promise that resolves on iframe load
    function waitForIframeLoad(iframe) {
        return new Promise(resolve => {
            iframe.onload = () => {
                console.log("Iframe finished loading.");
                resolve();
            };
        });
    }

    /**
     * Play a single event from the event pool
     * @param event
     */
    function playSingleEvent(event) {
        console.log("playSingleEvent", event);

        const iframe = document.getElementById("replay-iframe");
        if (!iframe || !iframe.contentWindow) {
            console.error("Iframe is not ready or content window is unavailable.");
            return;
        }

        const contentWindow = iframe.contentWindow;

        console.log("Playing event:", event.type);

        if (event.type === "click") {
            console.log(event);

            // Try to find the element using the selector first
            if (event.selector) {
                try {
                    targetElement = contentWindow.document.querySelector(event.selector);
                } catch (e) {
                    console.error(`Invalid selector: ${event.selector}`, e);
                }
            }

            // If an element is found, dispatch the event on it
            if (targetElement) {
            const clickEvent = new contentWindow.MouseEvent("click", { bubbles: true });
                targetElement.dispatchEvent(clickEvent);
                console.log("Clicked on element using selector:", event.selector);
            } else if (event.coordinates) {
                // Fallback to coordinates if no selector is available or found
                const clickEvent = new contentWindow.MouseEvent("click", {
                    bubbles: true,
                    clientX: event.coordinates.x,
                    clientY: event.coordinates.y,
                });
                contentWindow.document.body.dispatchEvent(clickEvent);
                console.log("Clicked on document body using coordinates.");
            } else {
                console.warn("Click event ignored: no selector or coordinates provided.");
            }
        } else if (event.type === "scroll") {
            const selector = event.selector ? event.selector.toLowerCase() : "";
            let targetElement = null;

            // Check if the scroll is on the body or another specific element
            if (selector === "body" || selector === "html") {
                targetElement = contentWindow.document.documentElement;
            } else {
                targetElement = contentWindow.document.querySelector(selector);
            }

            if (targetElement) {
                targetElement.scrollTo({
                    top: event.scrollY,
                    behavior: "smooth"
                });
            } else {
                console.warn(`Scroll target element not found for selector: ${event.selector}`);
            }
        }
    }

// UI and control functions for manual playback
    function createPlaybackControls() {
        // Check if controls already exist to avoid creating duplicates
        if (document.getElementById("playback-controls")) {
            return;
        }

        const controlsContainer = document.createElement("div");
        controlsContainer.id = "playback-controls";
        controlsContainer.style.position = "fixed";
        controlsContainer.style.bottom = "20px";
        controlsContainer.style.left = "50%";
        controlsContainer.style.transform = "translateX(-50%)";
        controlsContainer.style.background = "rgba(0,0,0,0.7)";
        controlsContainer.style.color = "white";
        controlsContainer.style.padding = "10px";
        controlsContainer.style.borderRadius = "10px";
        controlsContainer.style.zIndex = "10001";
        controlsContainer.style.display = "flex";
        controlsContainer.style.alignItems = "center";
        controlsContainer.style.gap = "10px";

        const prevPageBtn = document.createElement("button");
        prevPageBtn.id = "prev-page-btn";
        prevPageBtn.textContent = "<<";
        prevPageBtn.style.background = "none";
        prevPageBtn.style.border = "1px solid white";
        prevPageBtn.style.color = "white";
        prevPageBtn.style.borderRadius = "5px";
        prevPageBtn.style.cursor = "pointer";

        const prevBtn = document.createElement("button");
        prevBtn.id = "prev-btn";
        prevBtn.textContent = "<";
        prevBtn.style.background = "none";
        prevBtn.style.border = "1px solid white";
        prevBtn.style.color = "white";
        prevBtn.style.borderRadius = "5px";
        prevBtn.style.cursor = "pointer";

        const nextBtn = document.createElement("button");
        nextBtn.id = "next-btn";
        nextBtn.textContent = ">";
        nextBtn.style.background = "none";
        nextBtn.style.border = "1px solid white";
        nextBtn.style.color = "white";
        nextBtn.style.borderRadius = "5px";
        nextBtn.style.cursor = "pointer";

        const nextPageBtn = document.createElement("button");
        nextPageBtn.id = "next-page-btn";
        nextPageBtn.textContent = ">>";
        nextPageBtn.style.background = "none";
        nextPageBtn.style.border = "1px solid white";
        nextPageBtn.style.color = "white";
        nextPageBtn.style.borderRadius = "5px";
        nextPageBtn.style.cursor = "pointer";

        const statusSpan = document.createElement("span");
        statusSpan.id = "status-display";
        statusSpan.textContent = "Click > to begin";
        statusSpan.style.width = "150px";
        statusSpan.style.textAlign = "center";

        controlsContainer.appendChild(prevPageBtn);
        controlsContainer.appendChild(prevBtn);
        controlsContainer.appendChild(statusSpan);
        controlsContainer.appendChild(nextBtn);
        controlsContainer.appendChild(nextPageBtn);
        document.body.appendChild(controlsContainer);

        prevPageBtn.onclick = prevBehavior;
        prevBtn.onclick = playPrev;
        nextBtn.onclick = playNext;
        nextPageBtn.onclick = nextBehavior;
    }

    function nextBehavior() {
        eventState.currentBehaviorIndex++;
        if (eventState.currentBehaviorIndex >= eventState.behaviors.length) {
            eventState.currentBehaviorIndex = eventState.behaviors.length - 1;
            console.log("End of replay behaviors.");
            return;
        }
        loadBehavior(eventState.behaviors[eventState.currentBehaviorIndex]);
    }

    function prevBehavior() {
        eventState.currentBehaviorIndex--;
        if (eventState.currentBehaviorIndex < 0) {
            eventState.currentBehaviorIndex = 0;
            console.log("Beginning of replay behaviors.");
            return;
        }
        loadBehavior(eventState.behaviors[eventState.currentBehaviorIndex]);
    }

    function playNext() {
        const currentBehavior = eventState.behaviors[eventState.currentBehaviorIndex];
        if (!currentBehavior || !currentBehavior.events) return;

        eventState.currentEventIndex++;
        if (eventState.currentEventIndex >= currentBehavior.events.length) {
            console.log("End of events for this page.");
            eventState.currentEventIndex = currentBehavior.events.length;
            updateControls();
            return;
        }

        const event = currentBehavior.events[eventState.currentEventIndex];
        playSingleEvent(event);
        updateControls();
    }

    function playPrev() {
        const currentBehavior = eventState.behaviors[eventState.currentBehaviorIndex];
        if (!currentBehavior || !currentBehavior.events) return;

        eventState.currentEventIndex--;
        if (eventState.currentEventIndex < -1) {
            eventState.currentEventIndex = -1;
            console.log("Beginning of events for this page.");
            updateControls();
            return;
        }

        const event = currentBehavior.events[eventState.currentEventIndex];
        playSingleEvent(event);
        updateControls();
    }

    function updateControls() {
        const statusDiv = document.getElementById("status-display");
        if (statusDiv) {
            const currentBehavior = eventState.behaviors[eventState.currentBehaviorIndex];
            const eventCount = currentBehavior ? currentBehavior.events.length : 0;
            statusDiv.textContent = `Page ${eventState.currentBehaviorIndex + 1}/${eventState.behaviors.length} | Event ${eventState.currentEventIndex + 1}/${eventCount}`;
        }
    }

    async function loadBehavior(behavior) {
        const iframe = document.getElementById("replay-iframe");
        iframe.src = behavior.visitedPage;
        const [width, height] = behavior.viewport.split("x");
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;

        await new Promise(resolve => iframe.onload = resolve);

        // Update the content window reference
        eventState.iframeContentWindow = iframe.contentWindow;

        const replayTitle = document.getElementById("replay-title");
        replayTitle.textContent = behavior.visitedPage;

        eventState.currentEventIndex = -1; // Reset event index for the new page
        updateControls();
    }

    async function manualPlay(behaviors) {
        if (!behaviors || !behaviors.length) {
            console.warn("No behaviors to replay.");
            return;
        }

        eventState.behaviors = behaviors;
        eventState.currentBehaviorIndex = 0;
        eventState.currentEventIndex = -1;

        createPlaybackControls();

        // Load the first behavior and wait for it
        await loadBehavior(eventState.behaviors[eventState.currentBehaviorIndex]);
    }

    async function autoPlay(events, contentWindow) {
        if (!events || !events.length) {
            console.warn("No events to replay.");
            return Promise.resolve();
        }
        return new Promise(resolve => {
            let lastEventTime = new Date(events[0].timestamp).getTime();
            events.forEach((event, index) => {
                const timeDelta = new Date(event.timestamp).getTime() - lastEventTime;
                lastEventTime = new Date(event.timestamp).getTime();
                setTimeout(() => {
                    // playSingleEvent is not meant to be called here in auto mode. This is the issue.
                    if (event.type === "click") {
                        const clickEvent = new contentWindow.MouseEvent("click", {
                            bubbles: true,
                            clientX: event.coordinates.x,
                            clientY: event.coordinates.y,
                        });
                        contentWindow.document.body.dispatchEvent(clickEvent);
                    } else if (event.type === "scroll") {
                        contentWindow.scrollTo({
                            top: event.scrollY,
                            left: 0,
                            behavior: "smooth",
                        });
                    }
                    if (index === events.length - 1) {
                        setTimeout(resolve, 500);
                    }
                }, timeDelta);
            });
        });
    }


    async function playEvents(token, mode = "manual") {
        try {
            const url = `/wa-replay?tokenStatID=${token}`;
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }

            const data = await response.json();
            const behaviors = data.content.behaviors;
            const iframe = document.getElementById("replay-iframe");

            if (!behaviors || !behaviors.length) {
                console.warn("No behaviors to replay.");
                return;
            }

            if (mode === "auto") {
                for (const behavior of behaviors) {
                    iframe.src = behavior.visitedPage;
                    const [width, height] = behavior.viewport.split("x");
                    iframe.style.width = `${width}px`;
                    iframe.style.height = `${height}px`;
                    await new Promise(resolve => iframe.onload = resolve);
                    const events = behavior.events;
                    await autoPlay(events, iframe.contentWindow);
                }
            } else {
                const contentWindow = iframe.contentWindow;
                await manualPlay(behaviors, contentWindow);
            }
        } catch (err) {
            console.error("Error during event playback:", err);
        }
    }

// Function to handle automatic playback
    function autoPlay(events, contentWindow) {
        if (!events.length) {
            console.warn("No events to replay.");
            return Promise.resolve();
        }

        return new Promise(resolve => {
            let lastEventTime = new Date(events[0].timestamp).getTime();

            events.forEach((event, index) => {
                const timeDelta = new Date(event.timestamp).getTime() - lastEventTime;
                lastEventTime = new Date(event.timestamp).getTime();

                setTimeout(() => {
                    playSingleEvent(event, contentWindow);

                    if (index === events.length - 1) {
                        setTimeout(resolve, 500);
                    }
                }, timeDelta);
            });
        });
    }

    /**
     * Generates a list of clickable links against the list of tokens
     * @param arr
     * @param targetDiv
     * @param maxLinks
     */
    function generateLinks(arr, {targetDiv = "body", maxLinks = 20} = {}) {
        if (!Array.isArray(arr)) {
            console.error("First argument must be an array");
            return;
        }

        let cleanBaseUrl = document.location.origin + "/wa-replay";
        cleanBaseUrl = cleanBaseUrl.replace(/\/$/, "");

        const limitedArr = arr.slice(0, maxLinks);

        // Create main container
        const mainContainer = document.createElement("div");
        mainContainer.id = "wa-replay-main-container";
        mainContainer.classList.add("wa-replay-main-container");

        // Create header with title and minimize button
        const header = document.createElement("div");
        header.classList.add("wa-replay-header");

        const title = document.createElement("span");
        title.textContent = "Replay Sessions";
        title.classList.add("wa-replay-title");

        const minimizeBtn = document.createElement("button");
        minimizeBtn.innerHTML = "+";
        minimizeBtn.classList.add("wa-replay-minimize-btn");
        minimizeBtn.title = "Minimize";

        header.appendChild(title);
        header.appendChild(minimizeBtn);

        // Create content container
        const contentContainer = document.createElement("div");
        contentContainer.id = "wa-replay-list-container";
        contentContainer.classList.add("wa-replay-list-container");

        // Create minimized icon (initially hidden)
        const minimizedIcon = document.createElement("div");
        minimizedIcon.classList.add("wa-replay-minimized-icon");
        minimizedIcon.innerHTML = " ";
        minimizedIcon.title = "Restore Replay List";
        minimizedIcon.style.display = "none";

        // Populate content
        for (let k in limitedArr) {
            const item = limitedArr[k];
            const time = item.time;
            const dateObject = new Date(time);
            const friendlyString = dateObject.toLocaleString();

            // Create a span to act as the clickable link
            const link = document.createElement("span");
            link.textContent = `${friendlyString} - ${item.resolution}`;
            link.title = item.id;
            link.className = "wa-replay-link";

            // Add a click event listener to the span
            link.addEventListener("click", () => {
                // Call the playEvents function with the correct token
                playEvents(item.id, "manual");
            });

            contentContainer.appendChild(link);
            contentContainer.appendChild(document.createElement("br"));
        }

        // Add elements to main container
        mainContainer.appendChild(header);
        mainContainer.appendChild(contentContainer);
        mainContainer.appendChild(minimizedIcon);

        // Drag functionality
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            dragOffsetX = e.clientX - mainContainer.getBoundingClientRect().left;
            dragOffsetY = e.clientY - mainContainer.getBoundingClientRect().top;
            mainContainer.style.cursor = "grabbing";
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;

            const x = e.clientX - dragOffsetX;
            const y = e.clientY - dragOffsetY;

            // Keep within viewport boundaries
            const maxX = window.innerWidth - mainContainer.offsetWidth;
            const maxY = window.innerHeight - mainContainer.offsetHeight;

            mainContainer.style.left = Math.max(0, Math.min(x, maxX)) + "px";
            mainContainer.style.top = Math.max(0, Math.min(y, maxY)) + "px";
            mainContainer.style.right = "auto"; // Reset right positioning
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            mainContainer.style.cursor = "grab";
        });

        // Also make minimized icon draggable
        let isIconDragging = false;
        let iconDragOffsetX = 0;
        let iconDragOffsetY = 0;

        minimizedIcon.addEventListener("mousedown", (e) => {
            isIconDragging = true;
            iconDragOffsetX = e.clientX - minimizedIcon.getBoundingClientRect().left;
            iconDragOffsetY = e.clientY - minimizedIcon.getBoundingClientRect().top;
            minimizedIcon.style.cursor = "grabbing";
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isIconDragging) return;

            const x = e.clientX - iconDragOffsetX;
            const y = e.clientY - iconDragOffsetY;

            // Keep within viewport boundaries
            const maxX = window.innerWidth - minimizedIcon.offsetWidth;
            const maxY = window.innerHeight - minimizedIcon.offsetHeight;

            minimizedIcon.style.left = Math.max(0, Math.min(x, maxX)) + "px";
            minimizedIcon.style.top = Math.max(0, Math.min(y, maxY)) + "px";
            minimizedIcon.style.right = "auto"; // Reset right positioning
        });

        document.addEventListener("mouseup", () => {
            isIconDragging = false;
            minimizedIcon.style.cursor = "grab";
        });

        // Toggle functionality
        let isMinimized = false;

        minimizeBtn.addEventListener("click", () => {
            isMinimized = true;
            contentContainer.style.display = "none";
            minimizedIcon.style.display = "block";
            minimizeBtn.innerHTML = "+";
            minimizeBtn.title = "Restore";

            // Position icon where the container was
            const rect = mainContainer.getBoundingClientRect();
            minimizedIcon.style.left = rect.left + "px";
            minimizedIcon.style.top = rect.top + "px";
        });

        minimizedIcon.addEventListener("click", () => {
            isMinimized = false;
            contentContainer.style.display = "block";
            minimizedIcon.style.display = "none";
            minimizeBtn.innerHTML = "+";
            minimizeBtn.title = "Minimize";

            // Position container where the icon was
            const rect = minimizedIcon.getBoundingClientRect();
            mainContainer.style.left = rect.left + "px";
            mainContainer.style.top = rect.top + "px";
        });

        // Find target element
        const targetElement = targetDiv === "body"
            ? document.body
            : typeof targetDiv === "string"
                ? document.getElementById(targetDiv)
                : targetDiv;

        if (!targetElement) {
            console.error("Target element not found");
            return;
        }

        targetElement.appendChild(mainContainer);
    }

    async function fetchRecordedEvents() {
        const response = await fetch(serverUrl + "?" + new URLSearchParams({}).toString(), {
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
        return list;
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

        // document.addEventListener("keydown", function (event) {
        //     const isCtrlR = event.altKey && event.key.toLowerCase() === "p";
        //
        //     if (isCtrlR) {
        //         event.preventDefault();
        //         console.log("🔁 CTRL + R pressed — starting replay");
        //         replayEvents();
        //     }
        // });

        const list = await fetchRecordedEvents();
        generateLinks(list);

        createIframe(document.location.origin);

    }

    await init();

})();