const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors} = require("../../common/common-charts.cjs");

let currentData = null;

const saveWeekFile = () =>
{
    saveChartData(CHART_DATA_FILES.WEEK_DATA_FILENAME, currentData);
};

/**
 * Initialise data for year chart by reading or creating chart file
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
const generateWeekChartData = function ()
{
    try
    {
        currentData = generateVisitorsChartData(CHART_DATA_FILES.WEEK_DATA_FILENAME);
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
module.exports.generateWeekChartData = generateWeekChartData;
