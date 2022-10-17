const {saveChartData, loadMoneyChartData, updateMoney} = require("../../common/common-charts.cjs");
const {CHART_DATA_FILES} = require("../../../constants.cjs");
let currentData = null;

// ---------------------------------------------------
// Labels
// ---------------------------------------------------
const saveMoneyFile = () =>
{
    saveChartData(CHART_DATA_FILES.MONEY_DATA_FILENAME, currentData);
};

/**
 * Update today json file
 * @param lineObj
 * @returns {boolean}
 */
const updateMoneyContent = (lineObj) =>
{
    try
    {
        updateMoney(currentData, {lineObj});
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
const generateMoneyChartData = function ()
{
    try
    {
        currentData = loadMoneyChartData(CHART_DATA_FILES.MONEY_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};


module.exports.saveMoneyFile = saveMoneyFile;
module.exports.updateMoneyContent = updateMoneyContent;
module.exports.generateMoneyChartData = generateMoneyChartData;
