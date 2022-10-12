/**
 * Created by thimpat on 04/11/2015.
 */
const url = require("url");
const http = require("http");

const {readFileSync, writeFileSync, createWriteStream, mkdirSync} = require("fs");
const {joinPath} = require("@thimpat/libutils");


const TABLE_SEPARATOR = "  |  ";

const hits = [];
let ips = new Set();

let hitsLogStream = null;
let ipsLogStream = null;

function addToHitFile(all)
{
    try
    {
        const data = all.join("\n");
        hitsLogStream.write(data + "\n");
        all.length = 0;

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

function addToIpFile(ip)
{
    try
    {
        if (ips.has(ip))
        {
            return false;
        }

        ips.add(ip);
        ipsLogStream.write(ip + "\n");

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

const getStructure = function ({
    ip = "",
    acceptLanguage = "",
    userAgent = "",
    pathname = "",
    search = ""
} = {})
{
    const obj = {};

    let now = new Date();
    let today = now.toISOString().slice(0, 10);
    let time = now.toLocaleTimeString();

    if (ip)
    {
        // Formatted line
        obj.date = today.padEnd(12) + time.padEnd(10);
        obj.ip = ip.padEnd(20);
        obj.acceptLanguage = acceptLanguage.padEnd(60);
        obj.userAgent = userAgent.padEnd(120);
        obj.pathname = pathname.padEnd(60);
        obj.search = search.padEnd(80);
    }
    else
    {
        // Headers
        obj.date = "date".padEnd(22);
        obj.ip = "ip".padEnd(20);
        obj.acceptLanguage = "acceptLanguage".padEnd(60);
        obj.userAgent = "userAgent".padEnd(120);
        obj.pathname = "pathname".padEnd(60);
        obj.search = "search".padEnd(80);
    }

    return obj;
};


const getHeaders = function ()
{
    let strTitles;
    try
    {
        const structure = getStructure();
        const obj = Object.values(structure);

        strTitles = obj.join(TABLE_SEPARATOR);
    }
    catch (e)
    {
        console.error({lid: 2555}, e.message);
    }

    return strTitles;
};


const getLineStats = function ({ip, acceptLanguage, userAgent, pathname, search})
{
    let strLine;
    try
    {
        const obj = getStructure({
            ip            : ip || "",
            acceptLanguage: acceptLanguage || "",
            userAgent     : userAgent || "",
            pathname      : pathname || "",
            search        : search || "",
        });

        const line = Object.values(obj);
        strLine = line.join(TABLE_SEPARATOR);
    }
    catch (e)
    {
        console.error({lid: 2445}, e.message);
    }

    return strLine;
};


/**
 * Harvest data
 * @returns {Function}
 */
function trackData(req, res, {headers = {}, connection = {}, socket = {}, data = {}, extraData = {}, ip} = {})
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

        const lineStats = getLineStats({
            ip            : ip,
            acceptLanguage: headers["accept-language"],
            userAgent     : headers["user-agent"],
            pathname      : infoReq.pathname,
            search        : infoReq.search,
        });

        hits.push(lineStats);

        // If not busy
        addToHitFile(hits);

        addToIpFile(ip);

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
        // Create directory for server
        const dataDir = joinPath(process.cwd(), `${server}.${classname}`);
        mkdirSync(dataDir, {recursive: true});

        // Create hits.log
        const hitsLogPath = joinPath(dataDir, "hits.log");

        let content = readFileSync(hitsLogPath, {encoding: "utf8"}) || "";
        const strCurrentTitles = content.split("\n")[0];

        const strTitles = getHeaders();

        hitsLogStream = createWriteStream(hitsLogPath, {flags: "a"});
        if (strCurrentTitles !== strTitles)
        {
            content = strTitles + content;
            writeFileSync(hitsLogPath, content, {encoding: "utf8"});
            hitsLogStream.write(strTitles + "\n");
        }

        // Create ips.log
        const ipsLogPath = joinPath(dataDir, "ips.log");
        ips.add(...content.split("\n"));
        ipsLogStream = createWriteStream(ipsLogPath, {flags: "a"});


        // Set a listener on Genserve
        process.on("message", onGenserveMessage);


        // startServer();

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