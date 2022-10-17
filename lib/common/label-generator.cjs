const {getRegisteredBrowsers} = require("../builders/index/map-browsers.cjs");


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

const getPopularityLabels = function()
{
    try
    {
        // Get labels dynamically
        const map = getRegisteredBrowsers();
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

