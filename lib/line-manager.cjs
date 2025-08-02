const {getWeekNumber, getStringFormattedDate} = require("./utils/common.cjs");

/**
 *
 * @param {string} strDate
 * @returns {{}|PARSED_DATE_TYPE}
 */
const parseDateString = function (strDate)
{
    try
    {
        // Only take into account log from today
        const moment = strDate.split(/\s+/);
        const date = moment[0];

        let time = moment[1];
        if (moment.length === 3) {
            time = time + " " + moment[2];
        }

        let currentTime, hour;
        try {
            currentTime = new Date(strDate);
            hour = currentTime.getHours();
        }
        catch(e)
        {
            // Fallback
            hour = parseInt(time.split(":")[0]);
            if (moment.length === 3) {
                hour = hour + 12;
            }

            currentTime = new Date(date);
        }


        const curr = currentTime.getDay() % 7;
        const day = curr === 0 ? 6 : curr - 1;
        const month = currentTime.getMonth();

        const week = getWeekNumber(currentTime);

        return {
            date, time, hour, day, week, month
        };
    }
    catch (e)
    {
        console.error({lid: "WA2645"}, e.message);
    }

    return {};
};

/**
 *
 * @returns {null|PARSED_DATE_TYPE}
 */
const parseNow = function ()
{
    try
    {
        const now = new Date();
        const strDate = getStringFormattedDate(now);
        return parseDateString(strDate);
    }
    catch (e)
    {
        console.error({lid: "WA2669"}, e.message);
    }

    return null;
};

module.exports.parseNow = parseNow;
module.exports.parseDateString = parseDateString;
