const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors, resetDataChart} = require("../../common/common-charts.cjs");
const {CHART_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {getYear} = require("../../utils/common.cjs");

let currentData = null;

// ---------------------------------------------------
// Labels
// ---------------------------------------------------
const saveYearFile = () =>
{
    saveChartData(CHART_DATA_FILES.YEAR_DATA_FILENAME, currentData);
};

/**
 * Update today json file
 * @param lineObj
 * @returns {boolean}
 */
const updateYearContent = (lineObj) =>
{
    try
    {
        const today = parseNow();
        const logLine = parseDateString(lineObj.date);

        if (today.month !== logLine.month)
        {
            // Reset per month visitor data
            currentData = generateVisitorsChartData(CHART_DATA_FILES.YEAR_DATA_FILENAME);
        }

        updateVisitors(currentData, lineObj.ip, logLine.month, {seen: lineObj.seen});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2667}, e.message);
    }

    return false;
};

/**
 * Initialise data for year chart by reading or creating chart file
 * @returns {null|any}
 */
const generateYearChartData = function ()
{
    try
    {
        let json = generateVisitorsChartData(CHART_DATA_FILES.YEAR_DATA_FILENAME);

        const year = getYear();

        const chartDate = new Date(json.date);
        const charYear = getYear(chartDate);
        
        if (year !== charYear)
        {
            json = resetDataChart(CHART_DATA_FILES.YEAR_DATA_FILENAME);
        }

        currentData = json;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }
};


module.exports.saveYearFile = saveYearFile;
module.exports.updateYearContent = updateYearContent;
module.exports.generateYearChartData = generateYearChartData;
