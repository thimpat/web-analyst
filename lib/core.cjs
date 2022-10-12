const {joinPath, isJson} = require("@thimpat/libutils");
const {mkdirSync, appendFileSync, existsSync, readFileSync, writeFileSync} = require("fs");
const {MEANINGFUL_LOG_FILES, MEANINGFUL_DATA_FILES} = require("../constants.cjs");
const {get24HoursLabels, getTodayDate} = require("./common.cjs");


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
// Build today json file
// -----------------------------------------------------------
const getTodayPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.TODAY_DATA_PATH);
};

const getTodayContent = () =>
{
    try
    {
        const jsonPath = getTodayPath();

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

        return JSON.parse(strJson);
    }
    catch (e)
    {
        console.error({lid: 2337}, e.message);
    }

    return null;
};

const setTodayContent = (currentData) =>
{
    try
    {
        const str = JSON.stringify(currentData, null, 2);

        const jsonPath = getTodayPath();
        writeFileSync(jsonPath, str, {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2339}, e.message);
    }

    return false;

};

/**
 * Build Today data for #today div
 * @returns {boolean|*[]}
 */
const buildTodayJsonFile = function ()
{
    try
    {
        const datatables = getSimplifiedHitData();

        const currentData = getTodayContent();
        currentData.labels = get24HoursLabels();

        currentData.dataVisitors = currentData.dataVisitors || new Array(currentData.labels.length).fill(0);
        currentData.dataUniqueVisitors = currentData.dataUniqueVisitors || new Array(currentData.labels.length).fill(0);

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

            // Only take into account log from today
            const moment = line.date.split(/\s+/);
            const logDate = moment[0];
            if (today !== logDate)
            {
                continue;
            }

            const time = moment[1];
            const hour = parseInt(time.split(":")[0]);
            ++currentData.dataVisitors[hour];

            modified = true;

            const ip = line.ip;
            if (!ips.has(ip))
            {
                ++currentData.dataUniqueVisitors[hour];
                addToIpFile(ip);
                ips.add(ip);
            }
        }

        if (!modified)
        {
            return true;
        }

        setTodayContent(currentData);

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
module.exports.buildTodayJsonFile = buildTodayJsonFile;
