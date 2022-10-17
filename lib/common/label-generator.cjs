const {getRegisteredBrowsers} = require("../builders/indexers/map-browsers.cjs");
const {CHART_DATA_FILES} = require("../../constants.cjs");
const {getRegisteredLanguages} = require("../builders/indexers/map-languages.cjs");
const {getRegisteredOses} = require("../builders/indexers/map-oses.cjs");
const {getRegisteredEndpoints} = require("../builders/indexers/map-endpoints.cjs");


const get24HoursLabels = function ()
{
    // Build labels
    const labels = [];
    for (let i = 0; i < 24; ++i)
    {
        labels.push(i + "h");
    }

    return labels;
};

const getWeekLabels = function ()
{
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
};

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

const getPopularityLabels = function(pathname)
{
    try
    {
        let map;

        // Get labels dynamically
        if (pathname === CHART_DATA_FILES.BROWSERS_DATA_FILENAME)
        {
            map = getRegisteredBrowsers();
        }
        else if (pathname === CHART_DATA_FILES.OSES_DATA_FILENAME)
        {
            map = getRegisteredOses();
        }
        else if (pathname === CHART_DATA_FILES.LANGUAGES_DATA_FILENAME)
        {
            map = getRegisteredLanguages();
        }
        else if (pathname === CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME)
        {
            map = getRegisteredEndpoints();
        }
        else
        {
            map = null;
            console.error({lid: 2145}, `No pathname given`);
            return false;
        }
        return Object.keys(map);
    }
    catch (e)
    {
        console.error({lid: 2145}, e.message);
    }

    return false;

};

// Static labels
module.exports.get24HoursLabels = get24HoursLabels;
module.exports.getWeekLabels = getWeekLabels;
module.exports.getYearLabels = getYearLabels;

// Dynamic labels
module.exports.getPopularityLabels = getPopularityLabels;

