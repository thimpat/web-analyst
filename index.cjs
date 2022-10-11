/**
 * Created by thimpat on 04/11/2015.
 */
const path = require("path");
const url = require("url");
const http = require("http");

const {createWriteStream, mkdirSync} = require("fs");
const {StatsEngine} = require("./stats-engine.cjs");
const {joinPath} = require("@thimpat/libutils");

const all = [];

let statsEngine = new StatsEngine();

let stream = null;


function addToFile(all)
{
    try
    {
        const data = all.join("\n");
        stream.write(data + "\n");
        all.length = 0;

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;

}

/**
 * Harvest data
 * @returns {Function}
 */
function trackData(req, res, {headers = {}, connection = {}, socket = {}, data = {}, extraData = {}, ip} = {})
{
    try
    {
        let stats;

        const infoReq = url.parse(req.url, true);

        for (let k in headers)
        {
            headers[k] = headers[k] || "";
        }

        for (let k in infoReq)
        {
            infoReq[k] = infoReq[k] || "";
        }

        let now = new Date();
        let today = now.toISOString().slice(0, 10);
        let time = now.toLocaleTimeString();
        stats = {
            date: today.padEnd(12) + time.padEnd(10),
            ip  : ("" + ip).padEnd(16),
            acceptLanguage: ("" + headers["accept-language"]).padEnd(60),
            // accept        : ("" + headers.accept).padEnd(80),
            // acceptEncoding: ("" + headers["accept-encoding"]).padEnd(16),
            // hostname      : ("" + headers.host).padEnd(20),
            // cacheControl  : ("" + headers["cache-control"]).padEnd(20),
            // url           : req.url.padEnd(20),
            userAgent: ("" + headers["user-agent"]).padEnd(120),
            // host          : ("" + headers.host).padEnd(20),
            path: infoReq.pathname.padEnd(40),
            search   : ("" + infoReq.search).padEnd(20),
            // method        : req.method.padEnd(5),
        };

        const line = Object.values(stats);
        const str = line.join("  |  ");

        all.push(str);

        // If not busy
        addToFile(all);

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
        return true;
    }
    catch (e)
    {
        console.error({lid: 2125}, e.message);
    }

    return false;
}

function startServer()
{
    http.createServer(function (req, res)
    {

        res.write("Hello World!");
        res.end();

    }).listen(8080);
}

/**
 * Set up the engine
 */
function init(server = "my-server", classname = "web")
{
    try
    {
        const dataDir = joinPath(process.cwd(), `${server}.${classname}`);

        mkdirSync(dataDir, {recursive: true});
        const dataPath = joinPath(dataDir, "my-server.log");
        stream = createWriteStream(dataPath, {flags: "a"});

        // Intercept message sent by GenServe
        process.on("message", onGenserveMessage);


        startServer();

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
        return true;
    }
    catch (e)
    {
        console.error({lid: 2315}, e.message);
    }

    return false;
}());