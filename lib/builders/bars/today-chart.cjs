const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../../utils/core.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {loadVisitorsChartData, saveChartData, updateVisitors} = require("../../common/common-charts.cjs");

let currentData = null;

const getTodayPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, CHART_DATA_FILES.TODAY_DATA_FILENAME);
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

/**
 * Initialise data for today chart by reading or creating chart file
 * @returns {boolean}
 */
const generateTodayChartData = function ()
{
    try
    {
        const jsonPath = getTodayPath();
        currentData = loadVisitorsChartData(jsonPath);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.generateTodayChartData = generateTodayChartData;
module.exports.saveTodayFile = saveTodayFile;
module.exports.updateTodayContent = updateTodayContent;

