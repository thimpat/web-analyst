const {writeFileSync} = require("fs");
const {MEANINGFUL_DATA_FILES} = require("../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {get24HoursLabels, getTodayDate} = require("../common.cjs");
const {getServerLogDir, getStatFileContent, setStatFileContent} = require("../core.cjs");
const {parseNow, parseLineObj} = require("../line-manager.cjs");
const {getRegisteredIps} = require("../ip.cjs");

let currentDayData = null;

const getTodayPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.TODAY_DATA_FILENAME);
};

const getTodayContent = () =>
 {
    const jsonPath = getTodayPath();
    return getStatFileContent(jsonPath, get24HoursLabels());
};

const saveTodayFile = () =>
{
    const jsonPath = getTodayPath();
    setStatFileContent(jsonPath, currentDayData);
};

/**
 * Update today json file
 * @param lineObj
 * @returns {boolean}
 */
const updateTodayContent = (lineObj) =>
{
    try
    {
        if (!currentDayData)
        {
            currentDayData = getTodayContent();
        }

        const ips = getRegisteredIps();

        const ip = lineObj.ip;

        const today = parseNow();
        const logLine = parseLineObj(lineObj);

        if (today.date !== logLine.date)
        {
            return false;
        }

        ++currentDayData.dataVisitors[logLine.hour];

        if (!ips.has(ip))
        {
            ++currentDayData.dataUniqueVisitors[logLine.hour];
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2667}, e.message);
    }

    return false;
};

/**
 * Create json file for today chart
 * @returns {null|any}
 */
const initTodayChart = () =>
{
    try
    {
        const jsonPath = getTodayPath();
        const labels = get24HoursLabels();
        const json = getStatFileContent(jsonPath, labels);

        const todayDate = getTodayDate();
        if (json.date !== todayDate)
        {
            json.date = todayDate;
            json.dataVisitors = new Array(labels.length).fill(0);
            json.dataUniqueVisitors = new Array(labels.length).fill(0);
            writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: "utf8"});
        }

        currentDayData = json;

        return json;
    }
    catch (e)
    {
        console.error({lid: 2353}, e.message);
    }

    return null;

};

module.exports.initTodayChart = initTodayChart;

module.exports.getTodayContent = getTodayContent;
module.exports.saveTodayFile = saveTodayFile;

module.exports.updateTodayContent = updateTodayContent;

