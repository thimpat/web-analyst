const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {generateVisitorsChartData, saveChartData, updateVisitors} = require("../../common/common-charts.cjs");
const {getYearFilename} = require("../../utils/common.cjs");

let currentData = null;

// ---------------------------------------------------
// Labels
// ---------------------------------------------------
const saveYearFile = () =>
{
    const year = getYearFilename();
    saveChartData(year, currentData);
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
            return false;
        }

        updateVisitors(currentData, lineObj.ip, logLine.month);

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
        const year = getYearFilename();
        currentData = generateVisitorsChartData(year);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};


module.exports.saveYearFile = saveYearFile;
module.exports.updateYearContent = updateYearContent;
module.exports.generateYearChartData = generateYearChartData;
