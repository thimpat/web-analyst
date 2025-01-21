const {CHART_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {loadPopularityChartData, savePopularityChartData} = require("../../common/common-charts.cjs");

let currentData = null;

const saveLanguagesIndexer = () =>
{
    savePopularityChartData(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const generateLanguagesPopularityDataFromIndexer = function ()
{
    try
    {
        currentData = loadPopularityChartData(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }

    return false;
};

module.exports.generateLanguagesPopularityDataFromIndexer = generateLanguagesPopularityDataFromIndexer;
module.exports.saveLanguagesIndexer = saveLanguagesIndexer;

