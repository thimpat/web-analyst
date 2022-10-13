const {getTodayDate, getCurrentTime} = require("./common.cjs");
const parseNow = function ()
{
    try
    {
        let date = getTodayDate();
        let time = getCurrentTime();

        let hour = new Date().getHours();

        return {
            date, time, hour
        };
    }
    catch (e)
    {
        console.error({lid: 2669}, e.message);
    }

    return null;
};

/**
 *
 * @param lineObj
 * @returns {{}|{date: string, hour: number, time: string}}
 */
const parseLineObj = function (lineObj)
{
    try
    {
        // Only take into account log from today
        const moment = lineObj.date.split(/\s+/);
        const date = moment[0];

        const time = moment[1];
        const hour = parseInt(time.split(":")[0]);

        return {
            date, time, hour
        };
    }
    catch (e)
    {
        console.error({lid: 2645}, e.message);
    }

    return {};
};

module.exports.parseNow = parseNow;
module.exports.parseLineObj = parseLineObj;
