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
const {DETECTION_METHOD, PAGES} = require("./constants.cjs");
const {ltr} = require("semver");
const crypto = require("crypto");

// ----------------------------------------------------------------
// Run from Genserve thread
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
        const tokenCookie = cookies.find(c => c.startsWith("web-analyst-token="));
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
 * This function is run from inside GenServe thread and is called before Genserve reaches out
 * the plugin within its own thread.
 * The value returned by this function will be sent to the plugin process via onGenserveMessage
 * @see onGenserveMessage
 * @param req
 * @param res
 * @param {*} pluginProps
 * @param loggable
 * @returns {{visitorIp: (*|(function(): AddressInfo)|string), token: string, expiration: string, createdAt: number}|null}
 */
const onInformingPlugins = function (req, res, pluginProps = {detectionMethodUnique: DETECTION_METHOD.IP}, {loggable = null} = {}) {
    try {
        const {options} = pluginProps || {};

        // The function was called from a non-request call (GenServe Initialisation time)
        if (!req) {
            return null;
        }

        if (options.detectionMethodUnique !== DETECTION_METHOD.COOKIE) {
            return null;
        }

        const result = setCookieVisitor(req, res, {loggable});
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
function trackData(req, res, {headers = {}, ip, cookieData = null, options} = {}, {loggable = null} = {}) {
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
            cookieData
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
const setupEngine = function ({session, options}, {loggable = null} = {}) {
    try {
        // Save session information in plugin progress
        setSession(session);

        const server = getSessionProperty("serverName");
        const namespace = getSessionProperty("namespace");

        // By default, we ignore the stats page
        const statDir = "/" + server + "." + namespace + "/";
        setOptions(options, {ignore: statDir});

        startLogEngine(server, namespace);

        return true;
    } catch (e) {
        loggable.error({lid: "WA2189"}, e.message);
    }

    return false;
};

/**
 * GenServe message handler
 * Entrypoint for requests
 * @param pagePattern
 * @param action
 * @param req
 * @param res
 * @param headers
 * @param data
 * @param extraData
 * @param ip
 * @returns {boolean}
 */
function onGenserveMessage({
                               action,
                               headers,
                               req,
                               res,
                               data,
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
        data = data || {};

        if (action === "initialisation") {
            setGenserveDir(genserveDir);

            // Only the forked process processes this line
            setupEngine({session, options}, {loggable});

            process.send && process.send("initialised");
        } else if (action === "request") {
            let cookieData;
            if (options.detectionMethodUnique === "cookie") {
                cookieData = informingPluginsResult;
                if (!cookieData) {
                    getCookieVisitor(req, {loggable});
                }
            }

            trackData(req, res, {headers, ip, data, extraData, cookieData, genserveVersion, genserveName, options}, {loggable});
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
