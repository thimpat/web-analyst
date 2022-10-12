/**
 * Created by thimpat on 04/11/2015.
 */
const path = require("path");
const url = require("url");
const http = require("http");

const {readFile} = require("fs");
const handlebars = require("handlebars");
const jsonEngine = require("jsonfile");
const {StatsEngine} = require("./stats-engine.cjs");


let jsonfile;
let firstRequest = true;

const all = [];

let statsEngine = new StatsEngine();

let
    reqOptions,
    indexPath,
    statsPage;

jsonEngine.spaces = 4;

indexPath = path.join(__dirname, "public");
statsPage = "stats.hbs";

reqOptions = {
    root    : indexPath,
    dotfiles: "allow",
    headers : {
        "x-timestamp": Date.now(),
        "x-sent"     : true
    }
};


/**
 * @todo Precompile
 * @param source
 * @param data
 * @returns {*}
 */
function renderToString(source, data)
{
    let template,
        outputString;

    template = handlebars.compile(source);
    outputString = template(data);

    return outputString;
}

function renderView(view, data, cb)
{
    let content;

    // read the file and use the callback to render the view
    readFile(__dirname + "/views/" + view, function (err, source)
    {
        if (!err)
        {
            source = source.toString();
            content = renderToString(source, data);
            cb(content);
        }
        else
        {
            //res.end('Internal error.');
            cb("Internal error");
        }
    });
}

/**
 * Display the page containing the stats
 * @returns {Function}
 */
function renderData(req, res)
{
    try
    {
        // Client is asking for data
        if (req.url === "/z1")
        {
            jsonfile = statsEngine.getDatafile();
            jsonEngine.readFile(jsonfile, function (err, data)
            {
                if (err)
                {
                    console.error(err);
                    res.end("Something went wrong");
                    return;
                }

                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
            });
            return;
        }

        // Client is asking for data
        if (req.url === "/z2")
        {
            jsonfile = statsEngine.getOtherDatafile();
            jsonEngine.readFile(jsonfile, function (err, data)
            {
                if (err)
                {
                    console.error(err);
                    res.end("Something went wrong");
                    return;
                }

                data.referers = data.referers || {};

                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data.referers));
            });
            return;
        }

        // Client is asking for data
        if (req.url === "/z3")
        {
            jsonfile = statsEngine.getOtherDatafile();
            jsonEngine.readFile(jsonfile, function (err, data)
            {
                if (err)
                {
                    console.error(err);
                    res.end("Something went wrong");
                    return;
                }

                data.keywords = data.keywords || {};
                
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data.keywords));
            });
            return;
        }

        // Show stats page
        renderView(statsPage, {}, function (content)
        {
            res.write(content);
            res.end();
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 5453}, e.message);
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

        if (firstRequest)
        {
            firstRequest = false;
        }

        const infoReq = url.parse(req.url, true);

        stats = {
            headers       : headers,
            host          : headers.host,
            referer       : headers.referer,
            useragent     : headers["user-agent"],
            acceptlanguage: headers["accept-language"],
            cookie        : headers.cookie,
            url           : req.url,
            method        : req.method,
            ip,
            hostname      : headers.host,
            params        : {
                query : infoReq.query,
                search: infoReq.search
            },
            path          : infoReq.pathname,
            query         : infoReq.query,
            // search        : infoReq.search,
            // route         : req.route,
        };

        statsEngine.parseData(stats);

        // @todo: Remove stats from memory :/
        all.push(stats);

        return true;
    }
    catch (e)
    {
        console.error({lid: 5441}, e.message);
    }

    return false;
}


/**
 * Set up the engine
 * @param params
 */
function init(params = {
    ignoreIPs       : ["192.168.x.x"],
    ignoreRoutes    : ["/stats", "favicon"],
    ignoreExtensions: [".map"],
    dataDir         : "./"
})
{
    params = params || {};
    statsEngine.setOptions(params);
}

process.on("message",
    ({action, req, res, headers, connection, socket, data, extraData, ip}) =>
    {
        if (action === "request")
        {
            data = data || {};

            trackData(req, res, {headers, connection, socket, ip, data, extraData});
        }
    });


module.exports.init = init;

