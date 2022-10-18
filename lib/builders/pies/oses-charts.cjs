const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {loadPopularityChartData, savePopularityChartData} = require("../../common/common-charts.cjs");

let currentData = null;

const saveOsesIndexer = () =>
{
    savePopularityChartData(CHART_DATA_FILES.OSES_DATA_FILENAME, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const generateOsesPopularityDataFromIndexer = function ()
{
    try
    {
        currentData = loadPopularityChartData(CHART_DATA_FILES.OSES_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.generateOsesPopularityDataFromIndexer = generateOsesPopularityDataFromIndexer;
module.exports.saveOsesIndexer = saveOsesIndexer;

