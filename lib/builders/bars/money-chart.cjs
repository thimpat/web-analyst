const {saveChartData, getChartPath, readChartContent} = require("../../common/common-charts.cjs");
const {CHART_DATA_FILES, CHART_TYPE} = require("../../../hybrid/cjs/wa-constants.cjs");
const {parseNow} = require("../../line-manager.cjs");
const {getEarningPattern} = require("../../utils/patterns.cjs");
const {getWeekLabels, getYearLabels} = require("../../../hybrid/cjs/wa-fixed-label-generator.cjs");
const {getTodayDate, getWeekNumber} = require("../../utils/common.cjs");
const {writeFileSync, existsSync, mkdirSync} = require("fs");
const path = require("path");
let currentData = null;

// ---------------------------------------------------
// Labels
// ---------------------------------------------------
const resetWeek = () =>
{
    const week = getWeekLabels();
    currentData.days = new Array(week.length).fill(0);

    const today = parseNow();
    currentData.weekNumber = today.week;
};

/**
 * Create data for empty chart
 * @param jsonPath
 * @returns {{}}
 */
const createEarningEmptyChart = (jsonPath) =>
{
    try
    {
        const dir = path.parse(jsonPath).dir;
        if (!existsSync(dir))
        {
            mkdirSync(dir);
        }

        const json = {};

        json.creationDate = getTodayDate();
        json.weekNumber = getWeekNumber(new Date());

        const year = getYearLabels();
        json.months = new Array(year.length).fill(0);

        currentData = json;
        resetWeek(json);

        writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: "utf8"});
        return json;
    }
    catch (e)
    {
        console.error({lid: "WA2485"}, e.message);
    }

    return null;
};

const saveEarningFile = () =>
{
    saveChartData(CHART_DATA_FILES.EARNING_DATA_FILENAME, currentData);
};

const loadMoneyChartData = () =>
{
    try
    {
        const jsonPath = getChartPath(CHART_DATA_FILES.EARNING_DATA_FILENAME);

        // Read data chart
        let json = readChartContent(jsonPath, {type: CHART_TYPE.LINE});
        if (!json)
        {
            json = createEarningEmptyChart(jsonPath);
        }

        json.date = getTodayDate();
        return json;
    }
    catch (e)
    {
        console.error({lid: "WA2353"}, e.message);
    }

    return null;
};

const updateEarning = (currentData, {lineObj} = {}) =>
{
    try
    {
        const today = parseNow();
        const earning = getEarningPattern(lineObj.search) || getEarningPattern(lineObj.pathname);
        if (!earning)
        {
            return;
        }

        if (today.week !== currentData.weekNumber)
        {
            resetWeek();
        }

        currentData.days[today.day] += earning;
        currentData.months[today.month] += earning;
    }
    catch (e)
    {
        console.error({lid: "WA2669"}, e.message);
    }
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
        updateEarning(currentData, {lineObj});
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2667"}, e.message);
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
        currentData = loadMoneyChartData(CHART_DATA_FILES.EARNING_DATA_FILENAME);
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2543"}, e.message);
    }

    return false;
};


module.exports.saveEarningFile = saveEarningFile;
module.exports.updateMoneyContent = updateMoneyContent;
module.exports.generateMoneyChartData = generateMoneyChartData;
