const {existsSync, mkdirSync} = require("fs");
const {clone} = require("clonefile");

const {joinPath} = require("@thimpat/libutils");
const {MEANINGFUL_LOG_FILES, SUB_DATA_DIR} = require("../../hybrid/cjs/constants.cjs");
const {getOptions, setOptionProperty, getOptionProperty} = require("./options.cjs");
const TABLE_SEPARATOR = "  |  ";

const getServerLogDir = () =>
{
    return getOptionProperty("dataDir");
};

const buildDataDir = (outputDir, subDir = SUB_DATA_DIR) =>
{
    try
    {
        const dataDir = joinPath(outputDir, subDir);
        setOptionProperty("dataDir", dataDir);

        mkdirSync(dataDir, {recursive: true});
        return dataDir;
    }
    catch (e)
    {
        console.error({lid: 2145}, e.message);
    }

    return null;
};

const buildStatsDirectory = (server, namespace) =>
{
    try
    {
        const options = getOptions();

        const sourceDir = joinPath(__dirname, "../../web/");
        const outputDir = joinPath(options.outputDir, `${server}.${namespace}/`);

        if (!existsSync(outputDir))
        {
            clone(sourceDir, outputDir, {
                silent: false,
                force : true
            });
        }

        buildDataDir(outputDir);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2663}, e.message);
    }

    return false;

};

/**
 * https://stackoverflow.com/questions/49330139/date-toisostring-but-local-time-instead-of-utc
 * @param {Date} d
 * @returns
 */
function toISOLocal(d)
{
    var z = n => ("0" + n).slice(-2);
    var zz = n => ("00" + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off > 0 ? "-" : "+";
    off = Math.abs(off);

    return d.getFullYear() + "-"
        + z(d.getMonth() + 1) + "-" +
        z(d.getDate()) + "T" +
        z(d.getHours()) + ":" +
        z(d.getMinutes()) + ":" +
        z(d.getSeconds()) + "." +
        zz(d.getMilliseconds()) +
        sign + z(off / 60 | 0) + ":" + z(off % 60);
}

/**
 * Returns stat line or headers
 * @note The column order is important for later split a line. pathname or any other non-empty
 * column should be at the end (not search as it can be empty)
 * @param ip
 * @param acceptLanguage
 * @param userAgent
 * @param pathname
 * @param search
 * @returns {{}}
 */
const getStructuredLine = function ({
                                        ip = "",
                                        acceptLanguage = "",
                                        userAgent = "",
                                        pathname = "",
                                        search = ""
                                    } = {})
{
    const obj = {};

    let now = new Date();
    // let today = now.toISOString().slice(0, 10);

    let nowISO = toISOLocal(now);
    let today = nowISO.slice(0, 10);

    let time = now.toLocaleTimeString();

    if (ip)
    {
        // Formatted line
        obj.date = today.padEnd(12) + time.padEnd(10);
        obj.ip = ip.padEnd(32);
        obj.acceptLanguage = acceptLanguage.padEnd(60);
        obj.userAgent = userAgent.padEnd(120);
        obj.search = search.padEnd(80);
        obj.pathname = pathname.padEnd(60);
    }
    else
    {
        // Headers
        obj.date = "date".padEnd(22);
        obj.ip = "ip".padEnd(32);
        obj.acceptLanguage = "acceptLanguage".padEnd(60);
        obj.userAgent = "userAgent".padEnd(120);
        obj.search = "search".padEnd(80);
        obj.pathname = "pathname".padEnd(60);
    }

    return obj;
};


/**
 * Returns stat line
 * @param ip
 * @param acceptLanguage
 * @param userAgent
 * @param pathname
 * @param search
 * @returns {string}
 */
const getLineStats = function ({ip, acceptLanguage, userAgent, pathname, search})
{
    let strLine;
    try
    {
        const obj = getStructuredLine({
            ip            : ip || "",
            acceptLanguage: acceptLanguage || "",
            userAgent     : userAgent || "",
            search        : search || "",
            pathname      : pathname || "",
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
 * Returns headers to use in the hit file
 * @returns {string}
 */
const getHeaders = function ()
{
    let strTitles;
    try
    {
        const structure = getStructuredLine();
        const obj = Object.values(structure);

        strTitles = obj.join(TABLE_SEPARATOR);
    }
    catch (e)
    {
        console.error({lid: 2555}, e.message);
    }

    return strTitles;
};

/**
 * Returns path to log file
 * @returns {string}
 */
const getHitLogsPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.HITS_LOG_FILENAME);
};

// -----------------------------------------------------------
// Build json file
// -----------------------------------------------------------

module.exports.TABLE_SEPARATOR = TABLE_SEPARATOR;

module.exports.getServerLogDir = getServerLogDir;
module.exports.buildStatsLogDir = buildDataDir;
module.exports.buildStatsDir = buildStatsDirectory;

module.exports.getHeaders = getHeaders;

module.exports.getHitLogsPath = getHitLogsPath;

module.exports.getLineStats = getLineStats;

module.exports.toISOLocal = toISOLocal;

