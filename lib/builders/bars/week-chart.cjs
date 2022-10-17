const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../../utils/core.cjs");
const {parseNow, parseDateString} = require("../../line-manager.cjs");
const {loadVisitorsChartData, saveChartData, updateVisitors} = require("../../common/common-charts.cjs");
const {getWeekLabels} = require("../../common/label-generator.cjs");

let currentData = null;

const getWeekPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, CHART_DATA_FILES.WEEK_DATA_FILENAME);
};

const saveWeekFile = () =>
{
    const jsonPath = getWeekPath();
    saveChartData(jsonPath, currentData);
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
        const jsonPath = getWeekPath();
        currentData = loadVisitorsChartData(jsonPath);
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
