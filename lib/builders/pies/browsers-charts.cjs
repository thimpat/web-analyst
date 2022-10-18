const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {loadPopularityChartData, savePopularityChartData} = require("../../common/common-charts.cjs");

let currentData = null;

const saveBrowserIndexer = () =>
{
    savePopularityChartData(CHART_DATA_FILES.BROWSERS_DATA_FILENAME, currentData);
};

/**
 * Initialise data for browser popularity chart by reading chart file
 * @returns {boolean}
 */
const generateBrowserPopularityDataFromIndexer = function ()
{
    try
    {
        currentData = loadPopularityChartData(CHART_DATA_FILES.BROWSERS_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.generateBrowserPopularityDataFromIndexer = generateBrowserPopularityDataFromIndexer;
module.exports.saveBrowserIndexer = saveBrowserIndexer;

