const {joinPath, isJson} = require("@thimpat/libutils");
const {mkdirSync, existsSync, readFileSync, writeFileSync} = require("fs");
const {MEANINGFUL_LOG_FILES, MEANINGFUL_DATA_FILES} = require("../constants.cjs");
const {getWeekLabel, getYearLabels, getYearFilename} = require("./common.cjs");

const TABLE_SEPARATOR = "  |  ";

let dataDir = null;

const getServerLogDir = () =>
{
    return dataDir;
};

const buildServerLogDir = (server, namespace) =>
{
    // return joinPath(process.cwd(), `${server}.${namespace}`);
    dataDir = joinPath(__dirname, "..", `${server}.${namespace}`);
    mkdirSync(dataDir, {recursive: true});
    return dataDir;
};

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
    let today = now.toISOString().slice(0, 10);
    let time = now.toLocaleTimeString();

    if (ip)
    {
        // Formatted line
        obj.date = today.padEnd(12) + time.padEnd(10);
        obj.ip = ip.padEnd(22);
        obj.acceptLanguage = acceptLanguage.padEnd(60);
        obj.userAgent = userAgent.padEnd(120);
        obj.search = search.padEnd(80);
        obj.pathname = pathname.padEnd(60);
    }
    else
    {
        // Headers
        obj.date = "date".padEnd(22);
        obj.ip = "ip".padEnd(22);
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
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.HITS_LOG_FILENAME);
};

// -----------------------------------------------------------
// Build json file
// -----------------------------------------------------------

const getWeekPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.WEEK_DATA_FILENAME);
};

const getYearPath = () =>
{
    const year = getYearFilename();
    return joinPath(dataDir, year);
};

const getStatFileContent = (jsonPath, labels) =>
{
    try
    {
        // Read today file
        let strJson = "{}";

        if (existsSync(jsonPath))
        {
            strJson = readFileSync(jsonPath, {encoding: "utf8"});
            if (!isJson(strJson))
            {
                console.error({lid: 2411}, `Invalid json file: ${jsonPath}. The content will be updated.`);
                strJson = "{}";
                writeFileSync(jsonPath, strJson, {encoding: "utf8"});
            }
        }
        else
        {
            writeFileSync(jsonPath, strJson, {encoding: "utf8"});
        }

        const json = JSON.parse(strJson);
        json.labels = labels;
        json.dataVisitors = json.dataVisitors || new Array(labels.length).fill(0);
        json.dataUniqueVisitors = json.dataUniqueVisitors || new Array(json.labels.length).fill(0);

        return json;
    }
    catch (e)
    {
        console.error({lid: 2337}, e.message);
    }

    return null;

};

const setStatFileContent = (jsonPath, currentData) =>
{
    try
    {
        if (!currentData)
        {
            return false;
        }

        const str = JSON.stringify(currentData, null, 2);
        writeFileSync(jsonPath, str, {encoding: "utf8"});
        return true;
    }
    catch (e)
    {
        console.error({lid: 2339}, e.message);
    }

    return false;
};

const getWeekContent = () =>
{
    const jsonPath = getWeekPath();
    const labels = getWeekLabel();
    return getStatFileContent(jsonPath, labels);
};

const setWeekContent = (currentData) =>
{
    const jsonPath = getWeekPath();
    setStatFileContent(jsonPath, currentData);
};

const getYearContent = () =>
{
    const jsonPath = getYearPath();
    const labels = getYearLabels();
    return getStatFileContent(jsonPath, labels);
};

const setYearContent = (currentData) =>
{
    const jsonPath = getYearPath();
    setStatFileContent(jsonPath, currentData);
};

module.exports.TABLE_SEPARATOR = TABLE_SEPARATOR;

module.exports.getStatFileContent = getStatFileContent;
module.exports.setStatFileContent = setStatFileContent;

module.exports.getServerLogDir = getServerLogDir;

module.exports.buildServerLogDir = buildServerLogDir;

module.exports.getHeaders = getHeaders;

module.exports.getHitLogsPath = getHitLogsPath;
module.exports.getYearPath = getYearPath;

module.exports.getLineStats = getLineStats;

module.exports.getWeekContent = getWeekContent;
module.exports.getYearContent = getYearContent;

module.exports.setWeekContent = setWeekContent;
module.exports.setYearContent = setYearContent;
