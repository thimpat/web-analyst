const {toISODateTime} = require("./core.cjs");

// ---------------------------------------------------
// Date and Time
// ---------------------------------------------------
/**
 * Returns today data (i.e. 2022-11-06)
 * @param now
 * @returns {string}
 */
const getTodayDate = function (now = new Date())
{
    const time = toISODateTime(now);
    return time.slice(0, 10);
};

const getCurrentTime = function (now = new Date())
{
    return now.toLocaleTimeString();
};

const getStringFormattedDate = function (now = new Date())
{
    return getTodayDate(now) + "  " + getCurrentTime(now);
};

/* For a given date, get the ISO week number
 * @see https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
 */
function getWeekNumber(now = new Date()) 
{
    // To make now immutable
    now = new Date(now);

    now.setUTCDate(now.getUTCDate() + 4 - (now.getUTCDay()||7));
    const currentYear = (new Date()).getUTCFullYear();
    const yearStart = new Date(Date.UTC(currentYear, 0, 1));
    const res = Math.ceil((((now - yearStart) / 86400000) + 1) / 7);

    // For the -0 instead of 0
    return Math.abs(res);
}

function getYear(now = new Date())
{
    return (now).getFullYear();
}

// ---------------------------------------------------
// Utils
// ---------------------------------------------------


// Date and Time strings
module.exports.getCurrentTime = getCurrentTime;
module.exports.getTodayDate = getTodayDate;

module.exports.getStringFormattedDate = getStringFormattedDate;

module.exports.getWeekNumber = getWeekNumber;
module.exports.getYear = getYear;
