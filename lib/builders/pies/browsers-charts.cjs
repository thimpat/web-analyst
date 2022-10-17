const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {saveChartData, loadPopularityChartData, getChartPath} = require("../../common/common-charts.cjs");

let currentData = null;

const saveBrowserPopularityFile = () =>
{
    const jsonPath = getChartPath(CHART_DATA_FILES.BROWSERS_DATA_FILENAME);
    saveChartData(jsonPath, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const loadBrowserPopularityChartData = function ()
{
    try
    {
        const jsonPath = getChartPath(CHART_DATA_FILES.BROWSERS_DATA_FILENAME);
        currentData = loadPopularityChartData(jsonPath);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.loadBrowserPopularityChartData = loadBrowserPopularityChartData;
module.exports.saveBrowserPopularityFile = saveBrowserPopularityFile;

