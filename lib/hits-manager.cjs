const {getHitLogsPath, buildServerLogDir, getLineStats,
    getServerLogDir,
    getHeaders, TABLE_SEPARATOR,
} = require("./utils/core.cjs");

const {createWriteStream, writeFileSync, readFileSync, existsSync} = require("fs");
const {joinPath} = require("@thimpat/libutils");
const {CHART_DATA_FILES} = require("../constants.cjs");
const {addToIpFile, initialiseIpMapFile, updateIPFile} = require("./builders/indexers/map-ips.cjs");

const {generateTodayChartData, saveTodayFile, updateTodayContent} = require("./builders/bars/today-chart.cjs");
const {generateWeekChartData, saveWeekFile, updateWeekContent} = require("./builders/bars/week-chart.cjs");
const {generateYearChartData, saveYearFile, updateYearContent} = require("./builders/bars/year-chart.cjs");
const {generateBrowserPopularityDataFromIndexer, saveBrowserIndexer} = require("./builders/pies/browsers-charts.cjs");
const {buildBrowserIndexer, addToBrowserIndexer, updateBrowserIndexer} = require("./builders/indexers/map-browsers.cjs");
const {buildOSIndexer, updateOSIndexer, addToOSIndexer} = require("./builders/indexers/map-oses.cjs");
const {buildLanguageIndexer, updateLanguageIndexer, addToLanguageIndexer} = require("./builders/indexers/map-languages.cjs");
const {saveOsesIndexer, generateOsesPopularityDataFromIndexer} = require("./builders/pies/oses-charts.cjs");
const {saveLanguagesIndexer, generateLanguagesPopularityDataFromIndexer} = require("./builders/pies/languages-charts.cjs");


let hitsLogStream = null;

/**
 *
 * @type {string[]}
 */
let hits = [];

/**
 * Log file containing data for datatables
 * @returns {*}
 */
const getJsonHitsPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, CHART_DATA_FILES.HITS_DATA_FILENAME);
};

/**
 *
 * @param ip
 * @param acceptLanguage
 * @param acceptLanguage
 * @param userAgent
 * @param pathname
 * @param search
 * @returns {string|null}
 */
const convertHitToString = function ({ip, acceptLanguage, userAgent, pathname, search})
{
    try
    {
        return getLineStats({
            ip,
            acceptLanguage,
            userAgent,
            search,
            pathname,
        });
    }
    catch (e)
    {
        console.error({lid: 2117}, e.message);
    }

    return null;
};

/**
 * Returns lines from log file
 * @returns {string[]}
 */
const getHitLines = () =>
{
    try
    {
        const filepath = getHitLogsPath();
        const content = readFileSync(filepath, {encoding: "utf8"});
        return content.split("\n");
    }
    catch (e)
    {
        console.error({lid: 2263}, e.message);
    }

    return [];
};


const getHitColumnNames = () =>
{
    const lines = getHitLines();
    const line = lines[0];
    const columnNames = line.split(TABLE_SEPARATOR);
    for (let i = 0; i < columnNames.length; ++i)
    {
        columnNames[i] = columnNames[i].trim();
    }
    return columnNames;
};

/**
 *
 * @param {*[]} hitList
 * @returns {boolean}
 */
function addHitsToLogFile(hitList)
{
    try
    {
        if (!hitList)
        {
            return false;
        }

        const data = hitList.join("\n").trim();
        if (!data)
        {
            return true;
        }

        hitsLogStream.write(data + "\n");

        // Reinitialise list
        hits.length = 0;

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

/**
 * Convert the log file of hits to an array of objects
 * @returns {HIT_TYPE[]|null}
 */
const getHitList = () =>
{
    try
    {
        const titles = getHitColumnNames();
        const lines = getHitLines().slice(1);
        const newLines = [];

        for (let i = 0; i < lines.length; ++i)
        {
            const obj = {};
            const line = lines[i];
            if (!line)
            {
                continue;
            }

            const columns = line.split(TABLE_SEPARATOR);
            for (let ii = 0; ii < titles.length; ++ii)
            {
                const columnName = titles[ii];
                const columnValue = columns[ii] || "";
                obj[columnName] = columnValue.trim();
            }

            newLines.push(obj);
        }

        return newLines;
    }
    catch (e)
    {
        console.error({lid: 2845}, e.message);
    }

    return null;

};

const buildHitLogFile = function( )
{
    try
    {
        // Create hits.log
        const hitsLogPath = getHitLogsPath();
        if (!existsSync(hitsLogPath))
        {
            writeFileSync(hitsLogPath, "", {encoding: "utf8"});
        }

        let content = readFileSync(hitsLogPath, {encoding: "utf8"}) || "";
        const strCurrentTitles = content.split("\n")[0];

        const strTitles = getHeaders();

        if (strCurrentTitles !== strTitles)
        {
            if (content)
            {
                content = strTitles + "\n" + content + "\n";
            }
            else
            {
                content = strTitles + "\n";
            }
            writeFileSync(hitsLogPath, content, {encoding: "utf8"});
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2445}, e.message);
    }

    return false;
};

/**
 * Build Today data for #today div
 * @returns {boolean|*[]}
 */
const updateChartFiles = function ()
{
    try
    {
        const hitList = getHitList();

        for (let i = 0; i < hitList.length; ++i)
        {
            const lineObj = hitList[i];
            const pathname = lineObj.pathname;
            if (!(pathname === "/" || /server\./.test(pathname)))
            {
                continue;
            }

            updateTodayContent(lineObj);
            updateWeekContent(lineObj);
            updateYearContent(lineObj);

            addToIpFile(lineObj.ip);
        }

        saveTodayFile();
        saveWeekFile();
        saveYearFile();

        updateIPFile();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2411}, e.message);
    }

    return false;
};

/**
 * Build indexer files
 * @returns {boolean|*[]}
 */
const updateIndexers = function ()
{
    try
    {
        // Create empty indexers if necessary
        buildBrowserIndexer();
        buildOSIndexer();
        buildLanguageIndexer();

        const hitList = getHitList();

        for (let i = 0; i < hitList.length; ++i)
        {
            const lineObj = hitList[i];
            addToBrowserIndexer(lineObj.userAgent);
            addToOSIndexer(lineObj.userAgent);
            addToLanguageIndexer(lineObj.acceptLanguage);
        }

        updateBrowserIndexer();
        updateOSIndexer();
        updateLanguageIndexer();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2411}, e.message);
    }

    return false;
};

/**
 * Add hit data to the hit list and the log file
 * @param ip
 * @param acceptLanguage
 * @param userAgent
 * @param pathname
 * @param search
 * @returns {boolean}
 */
const registerHit = function ({ip, acceptLanguage, userAgent, pathname, search})
{
    try
    {
        const lineStats = convertHitToString({
            ip,
            acceptLanguage,
            userAgent,
            pathname,
            search,
        });

        // Register hit in array
        hits.push(lineStats);

        // Register hit in log file
        addHitsToLogFile(hits);

        updatePieChartsType();
        updateBarChartsType();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2545}, e.message);
    }

    return false;
};

function updatePieChartsType()
{
    try
    {
        // Parse log entries to populate browser, os and language map files
        updateIndexers();

        generateBrowserPopularityDataFromIndexer();
        generateOsesPopularityDataFromIndexer();
        generateLanguagesPopularityDataFromIndexer();

        saveBrowserIndexer();
        saveOsesIndexer();
        saveLanguagesIndexer();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2975}, e.message);
    }

    return false;

}

function updateBarChartsType()
{
    try
    {
        // Create the file to reference ips
        initialiseIpMapFile();

        // Parse log entries to populate chart files
        generateTodayChartData();
        generateWeekChartData();
        generateYearChartData();

        // Update all json files
        updateChartFiles();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2271}, e.message);
    }

    return false;

}

const startLogEngine = function (server, namespace)
{
    try
    {
        // Create directory for server
        buildServerLogDir(server, namespace);

        // Create the hit log file
        buildHitLogFile();

        updatePieChartsType();

        updateBarChartsType();

        const hitsLogPath = getHitLogsPath();
        hitsLogStream = createWriteStream(hitsLogPath, {flags: "a"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2113}, e.message);
    }
    return false;

};

module.exports.convertToHitObject = convertHitToString;

module.exports.registerHit = registerHit;
module.exports.startLogEngine = startLogEngine;
