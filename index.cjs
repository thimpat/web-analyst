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

/**
 * Harvest data
 * @returns {Function}
 */
function trackData(req, res, {headers = {}, ip} = {})
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
            ip            : ip,
            acceptLanguage: headers["accept-language"],
            userAgent     : headers["user-agent"],
            pathname      : infoReq.pathname,
            search        : infoReq.search,
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 5441}, e.message);
    }

    return false;
}

/**
 * GenServe message handler
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
function onGenserveMessage({action, req, res, headers, connection, socket, data, extraData, ip})
{
    try
    {
        if (action === "request")
        {
            data = data || {};

            trackData(req, res, {headers, connection, socket, ip, data, extraData});
        }
    }
    catch (e)
    {
        console.error({lid: 2125}, e.message);
    }

}

/**
 * Set up the engine
 */
function setupEngine({session, options})
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
        process.on("message", onGenserveMessage);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2189}, e.message);
    }

    return false;
}

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
        // const dynDir = joinPath(authDir, "wanalyst");
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
        pluginOptions.errors["401"] = pluginOptions.errors["401"] || {};
        pluginOptions.errors["401"] = {
            "message" : "Not logged in",
            "pathname": "/login-wwb-analyst.server.cjs"
        };

        const serverUrl = convertToUrl(session);
        // const statDir = session.serverName + "." + session.namespace;
        // pluginOptions.url = serverUrl + statDir + "/index.html";
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
 * This method is called when genserve forks this plugin
 * or when genserve invokes importScriptByType
 * @returns {boolean}
 */
function init()
{
    try
    {
        const argv = minimist(process.argv.slice(2));

        // Ignore operations from genserve#importScriptByType
        if (!argv.session)
        {
            return true;
        }

        setupEngine(argv);

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

module.exports.onInit = onInit;
