const {joinPath} = require("@thimpat/libutils");
const {mkdirSync} = require("fs");
const {readFileSync, writeFileSync} = require("fs");
const {MEANINGFUL_LOG_FILES, MEANINGFUL_DATA_FILES} = require("../constants.cjs");


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

const getHitLogsPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.HITS_LOG_PATH);
};

const getIpLogsPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.IPS_LOG_PATH);
};

const getTodayPath = () =>
{
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.TODAY_DATA_PATH);
};

/**
 * Path file containing data for datatables
 * @returns {*}
 */
const getHitsPath = () =>
{
    return joinPath(dataDir, "hits.json");
};

const getHitLines = () =>
{
    const filepath = getHitLogsPath();
    const content = readFileSync(filepath, {encoding: "utf8"});
    const lines = content.split("\n");
    return lines;
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

const getHitDataTables = () =>
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

const buildTodayData = function ()
{
    try
    {
        const datatables = getHitDataTables();
        return datatables;
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
        const datatables = getHitDataTables();
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

module.exports.getHitLogsPath = getHitLogsPath;
module.exports.getIpLogsPath = getIpLogsPath;

module.exports.buildTodayData = buildTodayData;
module.exports.buildHitsData = buildHitsData;
