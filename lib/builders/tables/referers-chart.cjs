const {CHART_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {savePopularityChartData, loadFrequencyTableData} = require("../../common/common-charts.cjs");

let currentData = null;

const saveReferrerIndexer = () =>
{
    savePopularityChartData(CHART_DATA_FILES.REFERRERS_DATA_FILENAME, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const generateReferrerPopularityDataFromIndexer = function ()
{
    try
    {
        currentData = loadFrequencyTableData(CHART_DATA_FILES.REFERRERS_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }

    return false;
};

module.exports.generateReferrerPopularityDataFromIndexer = generateReferrerPopularityDataFromIndexer;
module.exports.saveReferrerIndexer = saveReferrerIndexer;

