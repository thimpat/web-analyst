const {joinPath} = require("@thimpat/libutils");
const {MEANINGFUL_DATA_FILES} = require("../constants.cjs");
const getTodayDate = function()
{
    let now = new Date();
    return now.toISOString().slice(0, 10);
};

const getCurrentTime = function()
{
    let now = new Date();
    return now.toLocaleTimeString();
};

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
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
};

const getYearFilename = () =>
{
    return (new Date()).getFullYear() + ".json";
};


// Date and Time strings
module.exports.getCurrentTime = getCurrentTime;
module.exports.getTodayDate = getTodayDate;

// Labels
module.exports.get24HoursLabels = get24HoursLabels;
module.exports.getWeekLabel = getWeekLabels;
module.exports.getYearLabels = getYearLabels;

module.exports.getYearFilename = getYearFilename;
