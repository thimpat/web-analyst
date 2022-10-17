const {CHART_DATA_FILES} = require("../../../constants.cjs");
const {saveChartData, loadPopularityChartData, getChartPath} = require("../../common/common-charts.cjs");

let currentData = null;

const saveLanguagesPopularityFile = () =>
{
    const jsonPath = getChartPath(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME);
    saveChartData(jsonPath, currentData);
};

/**
 * Initialise data for browser popularity chart by reading or creating chart file
 * @returns {boolean}
 */
const loadLanguagesPopularityChartData = function ()
{
    try
    {
        const jsonPath = getChartPath(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME);
        currentData = loadPopularityChartData(jsonPath);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};

module.exports.loadLanguagesPopularityChartData = loadLanguagesPopularityChartData;
module.exports.saveLanguagesPopularityFile = saveLanguagesPopularityFile;

