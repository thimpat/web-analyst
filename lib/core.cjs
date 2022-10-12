const {joinPath, isJson} = require("@thimpat/libutils");
const {mkdirSync, appendFileSync, existsSync, readFileSync, writeFileSync} = require("fs");
const {MEANINGFUL_LOG_FILES, MEANINGFUL_DATA_FILES} = require("../constants.cjs");
const {get24HoursLabels, getTodayDate, getWeekLabel, getYearLabels} = require("./common.cjs");


const TABLE_SEPARATOR = "  |  ";


let dataDir = null;

const getServerLogDir = (server, namespace) =>
{
    return joinPath(process.cwd(), `${server}.${namespace}`);
};

const buildServerLogDir = (server, namespace) =>
{
    dataDir = getServerLogDir(server, namespace);
    mkdirSync(dataDir, {recursive: true});
    return dataDir;
};

/**
 * Create ip log file
 * @returns {boolean}
 */
const buildIpFile = () =>
{
    try
    {
        // Create ips.log
        const ipsLogPath = getIpLogsPath();
        if (existsSync(ipsLogPath))
        {
            return true;
        }

        writeFileSync(ipsLogPath, "", {encoding: "utf8"});
        return true;
    }
    catch (e)
    {
        console.error({lid: 2113}, e.message);
    }

    return false;

};

const getHitLogsPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.HITS_LOG_PATH);
};

/**
 * Log file containing data for datatables
 * @returns {*}
 */
const getHitsPath = () =>
{
    return joinPath(dataDir, "hits.json");
};

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getIpLogsPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.IPS_LOG_PATH);
};

/**
 * Returns hits from hit log file
 * @returns {string[]}
 */
const getHitLines = () =>
{
    const filepath = getHitLogsPath();
    const content = readFileSync(filepath, {encoding: "utf8"});
    const lines = content.split("\n");
    return lines;
};

/**
 * List of registered ips
 * Returns non-empty and already seen ips from ip log file
 * @returns {Set<string>}
 */
const getRegisteredIps = () =>
{
    const filepath = getIpLogsPath();
    const content = readFileSync(filepath, {encoding: "utf8"});
    const lines = content.split(/\s+/).filter((item) => item);
    return new Set(lines);
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


// -----------------------------------------------------------
//
// -----------------------------------------------------------
function addToIpFile(ip)
{
    try
    {
        const ipsLogPath = getIpLogsPath();
        appendFileSync(ipsLogPath, ip + "\n", {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

/**
 * Convert hit log file to an array
 * @returns {*[]}
 */
const getSimplifiedHitData = () =>
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
            obj[columnName] = columns[ii].trim();
        }

        newLines.push(obj);
    }

    return newLines;
};


// -----------------------------------------------------------
// Build json file
// -----------------------------------------------------------
const getTodayPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.TODAY_DATA_PATH);
};

const getWeekPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.WEEK_DATA_PATH);
};

const getYearPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.YEAR_DATA_PATH);
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

const getTodayContent = () =>
{
    const jsonPath = getTodayPath();
    const labels = get24HoursLabels();
    const json = getStatFileContent(jsonPath, labels);
    return json;
};

const setTodayContent = (currentData) =>
{
    const jsonPath = getTodayPath();
    setStatFileContent(jsonPath, currentData);
};

const getWeekContent = () =>
{
    const jsonPath = getWeekPath();
    const labels = getWeekLabel();
    const json = getStatFileContent(jsonPath, labels);
    return json;
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
    const json = getStatFileContent(jsonPath, labels);
    return json;
};

const setYearContent = (currentData) =>
{
    const jsonPath = getYearPath();
    setStatFileContent(jsonPath, currentData);
};

/**
 * Build Today data for #today div
 * @returns {boolean|*[]}
 */
const updateVisitorsJsonFile = function ()
{
    try
    {
        const datatables = getSimplifiedHitData();

        const currentDayData = getTodayContent();
        const currentWeekData = getWeekContent();
        const currentYearData = getYearContent();

        const ips = getRegisteredIps();

        const today = getTodayDate();

        let modified = false;
        for (let i = 0; i < datatables.length; ++i)
        {
            const line = datatables[i];
            const pathname = line.pathname;
            if (!(pathname === "/" || /server\./.test(pathname)))
            {
                continue;
            }

            const ip = line.ip;

            modified = true;

            // Only take into account log from today
            const moment = line.date.split(/\s+/);
            const logDate = moment[0];

            const time = moment[1];
            const hour = parseInt(time.split(":")[0]);

            if (today === logDate)
            {
                ++currentDayData.dataVisitors[hour];

                if (!ips.has(ip))
                {
                    ++currentDayData.dataUniqueVisitors[hour];
                }
            }

            let date = new Date(logDate);
            let indexDay = date.getDay();
            let indexMonth = date.getMonth();

            ++currentWeekData.dataVisitors[indexDay];
            ++currentYearData.dataVisitors[indexMonth];

            if (!ips.has(ip))
            {
                ++currentWeekData.dataUniqueVisitors[indexDay];
                ++currentYearData.dataUniqueVisitors[indexMonth];

                addToIpFile(ip);
                ips.add(ip);
            }
        }

        if (!modified)
        {
            return true;
        }

        setTodayContent(currentDayData);
        setWeekContent(currentWeekData);
        setYearContent(currentYearData);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2411}, e.message);
    }

    return false;
};

const buildHitsData = function ()
{
    try
    {
        const datatables = getSimplifiedHitData();
        const hitsPath = getHitsPath();
        const str = JSON.stringify(datatables, null, 2);
        writeFileSync(hitsPath, str, {encoding: "utf8"});
        return true;
    }
    catch (e)
    {
        console.error({lid: 2413}, e.message);
    }

    return false;
};


module.exports.TABLE_SEPARATOR = TABLE_SEPARATOR;

module.exports.getServerLogDir = getServerLogDir;

module.exports.buildServerLogDir = buildServerLogDir;
module.exports.buildIpFile = buildIpFile;

module.exports.getRegisteredIps = getRegisteredIps;

module.exports.getHitLogsPath = getHitLogsPath;
module.exports.getIpLogsPath = getIpLogsPath;

module.exports.buildHitsData = buildHitsData;
module.exports.updateVisitorsJsonFile = updateVisitorsJsonFile;
