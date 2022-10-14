const {MEANINGFUL_DATA_FILES} = require("../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../core.cjs");
const {parseNow, parseDateString} = require("../line-manager.cjs");
const {reviewChartData, saveChartData, updateVisitors} = require("../common/common-charts.cjs");

let currentData = null;

const get24HoursLabels = function ()
{
    // Build labels
    const labels = [];
    for (let i = 0; i < 24; ++i)
    {
        labels.push(i + "h");
    }

    return labels;
};

const getTodayPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.TODAY_DATA_FILENAME);
};

const saveTodayFile = () =>
{
    const jsonPath = getTodayPath();
    saveChartData(jsonPath, currentData);
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
        const today = parseNow();
        const logLine = parseDateString(lineObj.date);

        if (today.date !== logLine.date)
        {
            return false;
        }

        updateVisitors(currentData, lineObj.ip, logLine.hour);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2667}, e.message);
    }

    return false;
};

const registerTodayChart = function ()
{
    try
    {
        const jsonPath = getTodayPath();
        const labels = get24HoursLabels();

        currentData = reviewChartData(jsonPath, labels);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.registerTodayChart = registerTodayChart;
module.exports.saveTodayFile = saveTodayFile;
module.exports.updateTodayContent = updateTodayContent;

