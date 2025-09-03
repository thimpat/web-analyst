/**
 * Created by thimpat on 04/11/2015.
 */
const url = require("url");
const {startLogEngine, registerHit} = require("./lib/hits-manager.cjs");
const minimist = require("minimist");
const {joinPath, convertToUrl, sleep} = require("@thimpat/libutils");

const {setOptions} = require("./lib/utils/options.cjs");
const {setSession, getSessionProperty} = require("./lib/utils/session.cjs");
const {isPagePattern, isIgnorePattern} = require("./lib/utils/patterns.cjs");
const {setJwtSecretToken} = require("./auth/helpers/token-helpers.cjs");
const {setGenserveDir} = require("./auth/helpers/genserve-helpers.cjs");
const {DETECTION_METHOD, PAGES, DATA_GATHERING_METHOD} = require("./constants.cjs");
const {ltr} = require("semver");
const crypto = require("crypto");
const {getRegisteredTokens} = require("./lib/builders/indexers/map-ips.cjs");

// ----------------------------------------------------------------
// Utility functions
// ----------------------------------------------------------------
function lzwDecode(s) {
    let i;
    const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const b64d = {};
    for (i = 0; i < 64; i++) {
        b64d[b64.charAt(i)] = i;
    }
    const d = new Map();
    let num = 256;
    let word = String.fromCharCode(b64d[s[0]] + (b64d[s[1]] << 6) + (b64d[s[2]] << 12));
    let prev = word;
    const o = [word];
    for (i = 3; i < s.length; i += 3) {
        const key = b64d[s[i]] + (b64d[s[i + 1]] << 6) + (b64d[s[i + 2]] << 12);
        word = key < 256 ? String.fromCharCode(key) : d.has(key) ? d.get(key) : word + word.charAt(0);
        o.push(word);
        d.set(num++, prev + word.charAt(0));
        prev = word;
        if (num == (1 << 18) - 1) {
            d.clear();
            num = 256;
        }
    }
    return decodeURIComponent(escape(o.join("")));
}

// ----------------------------------------------------------------
// Run from GenServe thread
// ----------------------------------------------------------------
/**
 * Sets a cookie with a unique token if the visitor is new, and returns token + IP
 * @param req
 * @param res
 * @param loggable
 * @returns {{visitorIp: (*|(() => AddressInfo)|string), token: string, expiration: string, createdAt: number}|null}
 */
const setCookieVisitor = function (req, res, {loggable = null} = {}) {
    try {
        const cookieString = req.headers.cookie || "";
        const visitorIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        const cookies = cookieString.split(";").map(c => c.trim());
        const tokenCookie = cookies.find(c => c.startsWith("wa-token="));
        let token = tokenCookie ? tokenCookie.split("=")[1] : null;

        const now = new Date();
        const createdAt = now.getTime();
        const expiration = new Date(createdAt + 24 * 60 * 60 * 1000 * 31).toUTCString();

        if (!token) {
            token = crypto.randomUUID();

            res.setHeader("Set-Cookie", [
                `wa-token=${token}; HttpOnly; Path=/; Expires=${expiration}`,
                `wa-created-at=${createdAt}; Path=/; Expires=${expiration}`
            ]);

            loggable?.info?.({lid: "WA5433"}, `New visitor IP: ${visitorIp}, Token: ${token}, CreatedAt: ${createdAt}`);
        } else {
            loggable?.info?.({lid: "WA5434"}, `Returning visitor IP: ${visitorIp}, Token: ${token}`);
        }

        return {visitorIp, token, expiration, createdAt};
    } catch (e) {
        loggable?.error?.({lid: "WA5435"}, e.message);
    }

    return null;
};

/**
 * Retrieves the visitor's token and IP address
 * @param req
 * @param loggable
 * @returns {{token: string|null, ip: string|null}}
 */
const getCookieVisitor = function (req, {loggable = null} = {}) {
    try {
        const cookieString = req.headers.cookie || "";
        const visitorIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        const cookies = cookieString.split(";").map(c => c.trim());
        const tokenCookie = cookies.find(c => c.startsWith("wa-token="));
        const token = tokenCookie ? tokenCookie.split("=")[1] : null;

        const createdAtCookie = cookies.find(c => c.startsWith("wa-created-at="));
        const createdAt = createdAtCookie ? parseInt(createdAtCookie.split("=")[1], 10) : null;

        return {token, ip: visitorIp, createdAt};
    } catch (e) {
        loggable?.error?.({lid: "WA5432"}, e.message);
    }

    return null;
};

/**
 * Parse the analytics cookie that keeps screen resolution and other data related device
 * @param req
 * @param loggable
 */
const getCookieAnalytics = function (req, {loggable = null} = {}) {
    try {
        const cookieString = req.headers.cookie || "";
        const cookies = cookieString.split(";").map(c => c.trim());

        const analyticsCookie = cookies.find(c => c.startsWith("wa-plus="));
        if (!analyticsCookie) {
            return;
        }

        const rawValue = analyticsCookie.split("=")[1];
        if (!rawValue) {
            return;
        }

        try {
            const originalText = lzwDecode(rawValue);
            const json = JSON.parse(originalText);

            return json;
        } catch (err) {
            loggable?.warn?.({lid: "WA5434"}, "Failed to decompress or parse client Analytics cookie");
        }
    } catch (e) {
        loggable?.error?.({lid: "WA5435"}, e.message);
    }
};

/**
 * Decode the json sent by the beacon.
 * @note Max size for a beacon is 64k
 * @param postedData
 * @param loggable
 * @returns {any|null}
 */
const decodeFetchedData = function (postedData, {loggable = null} = {}) {
    try {
        try {
            if (!postedData) {
                return null;
            }

            let encodedData = postedData["wa-stats"];
            if (!encodedData) {
                if (!postedData.startsWith("wa-stats=")) {
                    return null;
                }

                encodedData = postedData.split("=")[1];
            }
            const originalText = lzwDecode(encodedData);
            const json = JSON.parse(originalText);

            // FIXME: Check if json.visitor is too big or even valid

            return json;
        } catch (err) {
            loggable?.warn?.({lid: "WA5434"}, "Failed to decompress or parse client Analytics cookie");
        }
    } catch (e) {
        loggable?.error?.({lid: "WA5435"}, e.message);
    }

    return null;
};

/**
 * Add extra information to the plugin options.
 * Populate staticDirs, dynDirs and validators for GenServe to be able to find the stats web folder.
 * These directories will be extracted and used later by GenServe (@see updateSessionForPlugin)
 * @note Run in the same thread as the server.
 * @note The server will wait for onInit to complete
 * @note Called before onGenserveMessage() receives its first message
 * @param pluginOptions
 * @param session
 * @param loggable
 * @returns {boolean}
 */
const onInit = async function ({options: pluginOptions, session, loggable}) {
    try {
        let dir = pluginOptions.staticDirs || pluginOptions.dir || ["./stats/"];
        if (!Array.isArray(dir)) {
            dir = [dir];
        }

        const authDir = joinPath(__dirname, "auth/");
        const dynDir = authDir;

        if (!process.env.JWT_SECRET_TOKEN) {
            if (pluginOptions.token) {
                setJwtSecretToken(pluginOptions.token);
            } else {
                setJwtSecretToken(Math.random() * 99999999 + "");
            }
        }

        // Update staticDirs to add web/ folder
        pluginOptions.staticDirs = dir;

        // Update dynamicDirs to add auth/ folder
        pluginOptions.dynamicDirs = [authDir];

        // Add validator to allow the server restricting the added static directory
        pluginOptions.validators = pluginOptions.validators || [joinPath(dynDir, "validate.cjs")];

        // File (json or js) containing allowed user map
        pluginOptions.credentials = pluginOptions.credentials || joinPath(dynDir, "creds.cjs");

        // Errors
        pluginOptions.errors = pluginOptions.errors || {};

        const serverUrl = convertToUrl(session);
        pluginOptions.url = serverUrl + PAGES.LOGIN_PAGE_NAME;

        loggable.log({lid: "WA2002", color: "#4158b7"}, `Statistics plugin URL: ${pluginOptions.url}`);

        return true;
    } catch (e) {
        loggable.error({lid: "GS7547"}, e.message);
    }

    return false;
};

/**
 * Each time a request is done, this function is called.
 * This function is run from inside GenServe thread and is called before GenServe reaches out
 * the plugin within its own thread.
 * The value returned by this function will be sent to the plugin process via onGenserveMessage.
 * ---
 * @note This call should be done as quick as possible as it would block GenServe main thread.
 * Only put here light operations (i.e. setting a cookie) where the client needs to handle a specific response from the plugin.
 * Web-Analyst main-thread doesn't communicate with GenServe, so GenServe is unaware of what the plugin is doing apart from here.
 * @see onGenserveMessage
 * @param req
 * @param res
 * @param {*} pluginProps
 * @param details
 * @param loggable
 * @returns {{visitorIp: (*|(function(): AddressInfo)|string), token: string, expiration: string, createdAt: number}|null}
 * When null, it means GenServe can handle the endpoint
 */
const onInformingPlugins = function (req, res, pluginProps = {detectionMethodUnique: DETECTION_METHOD.IP}, {
    details,
    loggable = null
} = {}) {
    try {
        const {options} = pluginProps || {};

        // The function was called from a non-request call (GenServe Initialisation time)
        if (!req) {
            return null;
        }

        let result;
        if (options.detectionMethodUnique === DETECTION_METHOD.COOKIE) {
            result = setCookieVisitor(req, res, {loggable});
        }

        // wa-plus is the endpoint that will receive users' hits.
        // We acknowledge GenServe that we handle this endpoint
        // so we answer as quick as possible as we don't want to block GenServe main thread.
        // To register the analytics, we will use onGenServe message which run in Web-Analyst own thread
        if (req.url === "/wa-plus") {

            if (req.method === "POST") {
                let payload = decodeFetchedData(details.postedData, {loggable}) || {};
                return {
                    statusCode: 200,
                    contentType: "application/json; charset=utf-8",
                    response: {
                        success: !!payload,
                        message: "Data processed successfully.",
                    },
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Content-Security-Policy": "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' *; connect-src *;",
                    processed: true,
                    result

                };
            } else if (req.method === "OPTIONS") {
                return {
                    statusCode: 204,
                    processed: true,
                    allow: "GET, POST, OPTIONS",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Content-Security-Policy": "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' *; connect-src *;",
                    result
                };
            }
        }

        // wa-replay is the endpoint that will return the way the user navigated the website.
        // wa-replay cannot be handle in onGenserveMessage as the function doesn't send back any feedback to GenServe.
        if (req.url === "/wa-replay" && req.method === "GET") {
            const tokens = getRegisteredTokens();
            return {
                statusCode: 200,
                contentType: "application/json; charset=utf-8",
                response: {
                    success: true,
                    message: "All good now",
                    content: tokens
                },
                processed: true,
                result
            };
        }

        return result || null;
    } catch (e) {
        loggable.error({lid: "WA6553"}, e.message);
    }

    return null;
};

// ----------------------------------------------------------------
// Run in forked process
// ----------------------------------------------------------------
/**
 * Harvest data
 * @returns {Function}
 */
function trackData(req, res, {
    headers = {},
    ip,
    cookieData = null,
    options = {},
    clientSideData = {}
} = {}, {loggable = null} = {}) {
    try {
        const infoReq = url.parse(req.url, true);
        headers = req.headers || headers || {};

        for (let k in headers) {
            headers[k] = headers[k] || "";
        }

        for (let k in infoReq) {
            infoReq[k] = infoReq[k] || "";
        }

        if (isIgnorePattern(infoReq.pathname)) {
            return;
        }

        if (!isPagePattern(infoReq.pathname)) {
            return;
        }

        registerHit({
            ip: ip,
            acceptLanguage: headers["accept-language"],
            userAgent: headers["user-agent"],
            pathname: infoReq.pathname,
            search: infoReq.search,
            referer: headers["referer"],
            clientSideData,
            cookieData,
            options
        });

        return true;
    } catch (e) {
        loggable.error({lid: "WA5441"}, e.message);
    }

    return false;
}


/**
 * - Generate HTML web pages for statistic pages
 * - Build data directory if non-existent
 * - Save session data (in the plugin memory space process)
 * - Review and update stats plugin options
 */
const setupEngine = function ({session, options, action}, {loggable = null} = {}) {
    try {
        // Save session information in plugin progress
        setSession(session);

        const server = getSessionProperty("serverName");
        const namespace = getSessionProperty("namespace");

        // By default, we ignore the stats page
        const statDir = "/" + server + "." + namespace + "/";
        setOptions(options, {ignore: statDir});

        startLogEngine(server, namespace, action);

        return true;
    } catch (e) {
        loggable.error({lid: "WA2189"}, e.message);
    }

    return false;
};

/**
 * GenServe message handler meant to handle heavy operations.
 * This is an event handler that intercepts GenServe messages.
 * If you need something that runs in the same Thread as GenServe use onInformingPlugin.
 * @note
 * Entrypoint for requests
 * @param pagePattern
 * @param action
 * @param req
 * @param res
 * @param headers
 * @param data
 * @param extraData
 * @param ip
 * @param {*} options
 */
async function onGenserveMessage({
                                     action,
                                     headers,
                                     req,
                                     res,
                                     data,
                                     postedData,
                                     extraData,
                                     ip,
                                     informingPluginsResult = {},
                                     session,
                                     genserveDir,
                                     genserveVersion,
                                     genserveName,
                                     options,
                                     loggable
                                 } = {}) {
    try {
        if (action === "initialisation") {
            setGenserveDir(genserveDir);

            // Only the forked process processes this line
            setupEngine({action, session, options}, {loggable});

            process.send && process.send("initialised");
            return;
        }

        if (req.method === "OPTIONS") {
            return;
        }

        data = data || {};

        // Holds the user unique token ID
        let cookieData;
        // Holds various information about devices
        let clientSideData;

        if (action === "request") {
            // Filter urls
            if (options.pages) {
                const pages = options.pages || [];
                let allowed = false;
                for (const allowedUrl of pages) {
                    const regex = new RegExp(allowedUrl, "i");
                    if (regex.test(req.url)) {
                        allowed = true;
                    }
                }

                if (!allowed) {
                    return;
                }
            }

            // -----------------------------------------------
            // POST: Fetch /wa-plus
            // -----------------------------------------------
            if (options.detectionMethodUnique === DETECTION_METHOD.COOKIE || options.gatheringMethod === DATA_GATHERING_METHOD.FETCH) {
                cookieData = informingPluginsResult;
                if (!cookieData) {
                    getCookieVisitor(req, {loggable});
                }
            }

            // Check whether the request is an endpoint handled by web-analyst
            let isEndpoint = (options.gatheringMethod === DATA_GATHERING_METHOD.FETCH &&
                (options.endpoints && options.endpoints[req.url]) &&
                (!options.endpoints[req.url].method || options.endpoints[req.url].method === req.method));

            if (options.gatheringMethod === "cookie") {
                clientSideData = getCookieAnalytics(req, {loggable});
            } else if (options.gatheringMethod === "fetch") {
                if (isEndpoint && postedData) {
                    if (postedData && postedData.beacon) {
                        postedData = JSON.parse(postedData);
                    }
                    const payload = decodeFetchedData(postedData, {loggable}) || {};
                    clientSideData = payload.data;
                    // Rename this as now visitor token can be stored in cookie or browser storage
                    cookieData = payload.visitor;
                }
            }

            // @note: Not implemented. For future use
            const swDetectString = options["service-worker-headers"];
            let isFromServiceWorker = false;
            if (swDetectString) {
                isFromServiceWorker = !!req.headers[swDetectString];
            }

            trackData(req, res, {
                headers,
                ip,
                data,
                extraData,
                cookieData,
                genserveVersion,
                genserveName,
                options,
                clientSideData,
                isFromServiceWorker
            }, {loggable});
        }
    } catch (e) {
        loggable.error({lid: "WA2125"}, e.message);
    }

}

// Do not use console.log
(async function () {
    try {
        const argv = minimist(process.argv.slice(2));
        if (argv.genserveDir) {
            // Set a listener on Genserve events
            if (argv.genserveVersion && ltr(argv.genserveVersion, "5.6.0")) {
                process.send && process.send("incompatible");
                await sleep(200);
                return;
            }

            if (argv.genserveDir) {
                process.send && process.send("loaded");
                process.on("message", onGenserveMessage);
                await sleep(200);
            }
        }
    } catch (e) {
        console.error(e);
    }

}());


module.exports.onGenserveMessage = onGenserveMessage;
module.exports.onInformingPlugins = onInformingPlugins;
module.exports.onInit = onInit;
