const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors} = require("../../common/common-charts.cjs");

let currentData = null;

const saveTodayFile = () =>
{
    saveChartData(CHART_DATA_FILES.TODAY_DATA_FILENAME, currentData);
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
        currentData = generateVisitorsChartData(CHART_DATA_FILES.TODAY_DATA_FILENAME);
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

