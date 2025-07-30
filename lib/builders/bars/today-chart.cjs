const {CHART_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors, resetDataChart} = require("../../common/common-charts.cjs");
const {getTodayDate, getWeekNumber, getYear} = require("../../utils/common.cjs");


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

        updateVisitors(currentData, lineObj.ip, logLine.hour, {seen: lineObj.seen});

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

        currentData = json;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }
};

module.exports.generateTodayChartData = generateTodayChartData;
module.exports.saveTodayFile = saveTodayFile;
module.exports.updateTodayContent = updateTodayContent;

