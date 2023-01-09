/**
 * Created by thimpat on 04/11/2015.
 */
const url = require("url");
const {startLogEngine, registerHit} = require("./lib/hits-manager.cjs");
const minimist = require("minimist");
const {joinPath, convertToUrl} = require("@thimpat/libutils");

const {setOptions} = require("./lib/utils/options.cjs");
const {setSession, getSessionProperty} = require("./lib/utils/session.cjs");
const {isPagePattern, isIgnorePattern} = require("./lib/utils/patterns.cjs");
const {setJwtSecretToken} = require("./auth/helpers/token-helpers.cjs");
const {getLoggable, setGenserveDir} = require("./auth/helpers/genserve-helpers.cjs");
const {DETECTION_METHOD} = require("./constants.cjs");

// ----------------------------------------------------------------
// Run from Genserve thread
// ----------------------------------------------------------------
/**
 * Returns whether the client has already contacted the server,
 * otherwise add a cookie to the client to be detected next time
 * @param req
 * @param res
 * @param loggable
 * @returns {{seen: boolean}}
 */
const processSeenStatus = function (req, res, {loggable = null} = {})
{
    try
    {
        const cookieString = req.headers.cookie;
        if (!cookieString)
        {
            const expiration = Date.now() + (60 * 60) * 1000 * 24;
            res.setHeader("Set-Cookie", [`web-analyst-token=485; HttpOnly`, `expires=${new Date(expiration)}`]);

            return {seen: false};
        }

        return {seen: true};
    }
    catch (e)
    {
        loggable.error({lid: "WA5427"}, e.message);
    }

    return {seen: false};
};

/**
 * Run in the same thread as the server.
 * The server will wait for onInit to complete
 * @note Called before launching the plugin engine in a separate thread (process)
 * @param pluginOptions
 * @param session
 * @param loggable
 * @returns {boolean}
 */
const onInit = async function ({options: pluginOptions, session, loggable})
{
    try
    {
        let dir = pluginOptions.staticDirs || pluginOptions.dir || ["./stats/"];
        if (!Array.isArray(dir))
        {
            dir = [dir];
        }

        const authDir = joinPath(__dirname, "auth/");
        const dynDir = authDir;

        if (!process.env.JWT_SECRET_TOKEN)
        {
            if (pluginOptions.token)
            {
                setJwtSecretToken(pluginOptions.token);
            }
            else
            {
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
        pluginOptions.url = serverUrl + "login-web-analyst.server.cjs";

        loggable.log({lid: 2002, color: "#4158b7"}, `Statistics plugin URL: ${pluginOptions.url}`);

        return true;
    }
    catch (e)
    {
        loggable.error({lid: 7547}, e.message);
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
 * @returns {{[seen]: boolean}}
 */
const onInformingPlugins = function (req, res, pluginProps = {detectionMethodUnique: DETECTION_METHOD.IP}, {loggable = null} = {})
{
    try
    {
        const {options} = pluginProps || {};
        if (options.detectionMethodUnique !== DETECTION_METHOD.COOKIE)
        {
            return {};
        }

        return processSeenStatus(req, res, {loggable});
    }
    catch (e)
    {
        loggable.error({lid: "WA6553"}, e.message);
    }

    return {};
};

// ----------------------------------------------------------------
// Run in forked process
// ----------------------------------------------------------------
/**
 * Harvest data
 * @returns {Function}
 */
function trackData(req, res, {headers = {}, ip, seen = false} = {}, {loggable = null} = {})
{
    try
    {
        const infoReq = url.parse(req.url, true);

        for (let k in headers)
        {
            headers[k] = headers[k] || "";
        }

        for (let k in infoReq)
        {
            infoReq[k] = infoReq[k] || "";
        }

        if (isIgnorePattern(infoReq.pathname))
        {
            return;
        }

        if (!isPagePattern(infoReq.pathname))
        {
            return;
        }

        registerHit({
            ip: ip,
            acceptLanguage: headers["accept-language"],
            userAgent: headers["user-agent"],
            pathname: infoReq.pathname,
            search: infoReq.search,
            seen
        });

        return true;
    }
    catch (e)
    {
        loggable.error({lid: 5441}, e.message);
    }

    return false;
}

/**
 * GenServe message handler
 * Entrypoint for requests
 * @param pagePattern
 * @param action
 * @param req
 * @param res
 * @param headers
 * @param connection
 * @param socket
 * @param data
 * @param extraData
 * @param ip
 * @returns {boolean}
 */
function onGenserveMessage({loggable}, {
    action,
    headers,
    req,
    res,
    data,
    extraData,
    ip,
    informingPluginsResult = {}
} = {})
{
    try
    {
        if (action === "request")
        {
            data = data || {};

            const {seen} = informingPluginsResult;

            trackData(req, res, {headers, ip, data, extraData, seen}, {loggable});
        }
    }
    catch (e)
    {
        loggable.error({lid: 2125}, e.message);
    }

}

/**
 * Set up the engine
 */
const setupEngine = function ({session, options}, {loggable = null} = {})
{
    try
    {
        setSession(session);

        const server = getSessionProperty("serverName");
        const namespace = getSessionProperty("namespace");

        // By default, we ignore the stats page
        const statDir = "/" + server + "." + namespace + "/";
        setOptions(options, {ignore: statDir});

        startLogEngine(server, namespace);

        // Set a listener on Genserve events
        process.on("message", onGenserveMessage.bind(null, {loggable}));

        return true;
    }
    catch (e)
    {
        loggable.error({lid: 2189}, e.message);
    }

    return false;
};

/**
 * This method is called when Genserve forks this plugin {@link startPlugin}
 * or when genserve invokes importScriptByType
 * @returns {boolean}
 */
function init()
{
    try
    {
        const argv = minimist(process.argv.slice(2));

        // Ignore all calls from genserve#importScriptByType
        if (!argv.session)
        {
            return true;
        }

        if (!argv.genserveDir)
        {
            console.error({lid: 2183}, `WebAnalyst does not support this Genserve version`);
            return false;
        }

        setGenserveDir(argv.genserveDir);

        const loggable = getLoggable();

        // Only the forked process processes this line
        setupEngine(argv, {loggable});

        process.send && process.send(`INITIALISED`);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2187}, e.message);
    }

    return false;
}

(async function ()
{
    try
    {
        init();
    }
    catch (e)
    {
        console.error({lid: 2315}, e.message);
    }

}());

module.exports.onInformingPlugins = onInformingPlugins;
module.exports.onInit = onInit;
module.exports.init = init;
