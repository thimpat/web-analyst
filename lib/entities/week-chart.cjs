const {MEANINGFUL_DATA_FILES} = require("../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../core.cjs");
const {parseNow, parseDateString} = require("../line-manager.cjs");
const {reviewChartData, saveChartData, updateVisitors} = require("../common/common-charts.cjs");

let currentData = null;

const getWeekLabels = function ()
{
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
};

const getWeekPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.WEEK_DATA_FILENAME);
};

const saveWeekFile = () =>
{
    const jsonPath = getWeekPath();
    saveChartData(jsonPath, currentData);
};

/**
 * Update today json file
 * @param lineObj
 * @returns {boolean}
 */
const updateWeekContent = (lineObj) =>
{
    try
    {
        const today = parseNow();
        const logLine = parseDateString(lineObj.date);

        if (today.week !== logLine.week)
        {
            return false;
        }

        updateVisitors(currentData, lineObj.ip, logLine.day);

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
const registerWeekChart = function ()
{
    try
    {
        const jsonPath = getWeekPath();
        const labels = getWeekLabels();

        currentData = reviewChartData(jsonPath, labels);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};


module.exports.saveWeekFile = saveWeekFile;
module.exports.updateWeekContent = updateWeekContent;
module.exports.registerWeekChart = registerWeekChart;
