/**
 * DO NOT EDIT THIS FILE DIRECTLY.
 * This file is generated following the conversion of 
 * @see [./lib/utils/common.cjs]{@link ./lib/utils/common.cjs}
 * 
 **/

// ---------------------------------------------------
// Date and Time
// ---------------------------------------------------
export const getTodayDate  = function (now = new Date())
{
    return now.toISOString().slice(0, 10);
};

export const getCurrentTime  = function (now = new Date())
{
    return now.toLocaleTimeString();
};

export const getStringFormattedDate  = function (now = new Date())
{
    return getTodayDate(now) + "  " + getCurrentTime(now);
};

/* For a given date, get the ISO week number
 * @see https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
 */
export function  getWeekNumber (d) {
    d = new Date(d);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ---------------------------------------------------
// Utils
// ---------------------------------------------------


// Date and Time strings









