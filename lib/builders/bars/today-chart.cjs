const {CHART_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors, resetDataChart} = require("../../common/common-charts.cjs");
const {getTodayDate, getWeekNumber, getYear} = require("../../utils/common.cjs");
const {TIME_UNIT} = require("../../utils/options.cjs");


let currentDailyData = null;

const saveTodayFile = () =>
{
    saveChartData(CHART_DATA_FILES.TODAY_DATA_FILENAME, currentDailyData);
};

/**
 * Update today json file
 * TODO: Use toLocaleString with new Date() to uniformize times
 * @param lineObj
 * @param cookieData
 * @param info
 * @returns {boolean}
 */
const updateTodayContent = (lineObj, cookieData, info) =>
{
    try
    {
        const today = parseNow();
        const logLine = parseDateString(lineObj.date);

        // If the date we want to reference is not as the same as the data file we are to update
        // Than means there is a discrepancy somewhere. Today's json file can only accept information from today, not from another day.
        if (today.date !== logLine.date)
        {
            return false;
        }

        updateVisitors(currentDailyData, lineObj.ip, logLine.hour, {info, infoType: TIME_UNIT.DAY, cookieData});

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2667"}, e.message);
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
        const todayDate = getTodayDate();
        let json = generateVisitorsChartData(CHART_DATA_FILES.TODAY_DATA_FILENAME);

        const year = getYear();
        const actualWeekNumber = getWeekNumber();

        // Chart week number
        const chartDate = new Date(json.date);
        const chartWeekNumber = getWeekNumber(chartDate);
        const charYear = getYear(chartDate);

        if (todayDate !== json.date || actualWeekNumber !== chartWeekNumber || charYear !== year)
        {
            json = resetDataChart(CHART_DATA_FILES.TODAY_DATA_FILENAME);
        }

        currentDailyData = json;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }
};

module.exports.generateTodayChartData = generateTodayChartData;
module.exports.saveTodayFile = saveTodayFile;
module.exports.updateTodayContent = updateTodayContent;

