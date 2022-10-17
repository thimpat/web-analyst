const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {savePopularityChartData, loadFrequencyTableData} = require("../../common/common-charts.cjs");

let currentData = null;

const saveEndpointIndexer = () =>
{
    savePopularityChartData(CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const generateEndpointPopularityDataFromIndexer = function ()
{
    try
    {
        currentData = loadFrequencyTableData(CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.generateEndpointPopularityDataFromIndexer = generateEndpointPopularityDataFromIndexer;
module.exports.saveEndpointIndexer = saveEndpointIndexer;

