const {joinPath} = require("@thimpat/libutils");

const {getServerLogDir} = require("../core.cjs");
const {parseNow, parseDateString} = require("../line-manager.cjs");
const {reviewChartData, saveChartData, updateVisitors} = require("../common/common-charts.cjs");
const {getYearFilename} = require("../common.cjs");

let currentData = null;

// ---------------------------------------------------
// Labels
// ---------------------------------------------------
const getYearLabels = function ()
{
    return [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
};

const getYearPath = () =>
{
    const dataDir = getServerLogDir();
    const year = getYearFilename();
    return joinPath(dataDir, year);
};

const saveYearFile = () =>
{
    const jsonPath = getYearPath();
    saveChartData(jsonPath, currentData);
};

/**
 * Update today json file
 * @param lineObj
 * @returns {boolean}
 */
const updateYearContent = (lineObj) =>
{
    try
    {
        const today = parseNow();
        const logLine = parseDateString(lineObj.date);

        if (today.month !== logLine.month)
        {
            return false;
        }

        updateVisitors(currentData, lineObj.ip, logLine.month);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2667}, e.message);
    }

    return false;
};

/**
 * Create json file for today chart
 * @returns {null|any}
 */
const registerYearChart = function ()
{
    try
    {
        const jsonPath = getYearPath();
        const labels = getYearLabels();

        currentData = reviewChartData(jsonPath, labels);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2543}, e.message);
    }

    return false;
};


module.exports.saveYearFile = saveYearFile;
module.exports.updateYearContent = updateYearContent;
module.exports.registerYearChart = registerYearChart;
