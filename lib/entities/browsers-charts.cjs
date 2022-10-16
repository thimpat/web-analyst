const {CHART_DATA_FILES} = require("../../constants.cjs");
const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../core.cjs");
const {parseNow, parseDateString} = require("../line-manager.cjs");
const {saveChartData, loadPopularityChartData, updateUniqueVisitors} = require("../common/common-charts.cjs");

let currentData = null;

const getBrowserPopularityPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, CHART_DATA_FILES.BROWSERS_DATA_FILENAME);
};

const saveBrowserPopularityFile = () =>
{
    const jsonPath = getBrowserPopularityPath();
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

        updateUniqueVisitors(currentData, lineObj.ip, logLine.hour);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2667}, e.message);
    }

    return false;
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const generateBrowserPopularityChartData = function ()
{
    try
    {
        const jsonPath = getBrowserPopularityPath();
        currentData = loadPopularityChartData(jsonPath);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.generateBrowserPopularityChartData = generateBrowserPopularityChartData;
module.exports.saveBrowserPopularityFile = saveBrowserPopularityFile;
module.exports.updateTodayContent = updateTodayContent;

