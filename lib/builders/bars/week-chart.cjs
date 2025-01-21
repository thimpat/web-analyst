const {CHART_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors, resetDataChart} = require("../../common/common-charts.cjs");
const {getWeekNumber, getYear} = require("../../utils/common.cjs");

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
            // Reset per day visitor data
            currentData = generateVisitorsChartData(CHART_DATA_FILES.WEEK_DATA_FILENAME);
        }

        updateVisitors(currentData, lineObj.ip, logLine.day, {seen: lineObj.seen});
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2667"}, e.message);
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
        let json = generateVisitorsChartData(CHART_DATA_FILES.WEEK_DATA_FILENAME);

        // Current week number
        const actualWeekNumber = getWeekNumber();

        // Chart week number
        const chartDate = new Date(json.date);
        const chartWeekNumber = getWeekNumber(chartDate);

        const year = getYear();
        const charYear = getYear(chartDate);

        if (actualWeekNumber !== chartWeekNumber || charYear !== year)
        {
            json = resetDataChart(CHART_DATA_FILES.WEEK_DATA_FILENAME);
        }

        currentData = json;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }

};


module.exports.saveWeekFile = saveWeekFile;
module.exports.updateWeekContent = updateWeekContent;
module.exports.generateWeekChartData = generateWeekChartData;
