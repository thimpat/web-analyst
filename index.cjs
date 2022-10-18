/**
 * Created by thimpat on 04/11/2015.
 */
const url = require("url");
const {fakeIp} = require("./lib/utils/common.cjs");
const {startLogEngine, registerHit} = require("./lib/hits-manager.cjs");
const minimist = require("minimist");
const {setOptions} = require("./lib/utils/options.cjs");
const {setSession, getSessionProperty} = require("./lib/utils/session.cjs");
const {isPagePattern} = require("./lib/utils/pattern.cjs");

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

         if (!isPagePattern(infoReq.pathname))
        {
            return;
        }

        if (!Math.floor(Math.random() * 3))
        {
            ip = fakeIp();
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
function init()
{
    try
    {
        const argv = minimist(process.argv.slice(2));

        setSession(argv.session);
        setOptions(argv.options);

        const server = getSessionProperty("serverName");
        const namespace = getSessionProperty("namespace");

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