const {resolvePath, joinPath} = require("@thimpat/libutils");
const {initPatterns} = require("./patterns.cjs");
const {STATS_DIR} = require("../../hybrid/cjs/wa-constants.cjs");

let options = {};

/**
 * @typedef {"day" | "week" | "year"} TimeUnit
 */
const TIME_UNIT = {
    DAY: "day",
    WEEK: "week",
    YEAR: "year",
};

/**
 * Update Web-Analyst options
 * @param opts
 * @param ignore
 * @returns {boolean}
 */
const setOptions = function (opts, {ignore = ""} = {})
{
    try
    {
        if (opts)
        {
            if (typeof opts === "string" || opts instanceof String)
            {
                options = JSON.parse(opts) || {};
            }
            else
            {
                options = JSON.parse(JSON.stringify(opts)) || {};
            }
        }

        options.outputDir = options.dir ? resolvePath(options.dir) : joinPath(process.cwd(), STATS_DIR);

        if (!options.ignore || !Array.isArray(options.ignore))
        {
            options.ignore = [];
        }

        if (ignore)
        {
            options.ignore.push(ignore);
        }

        initPatterns(options.pages, options.earnings, options.ignore);

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2635"}, e.message);
    }

    return false;
};

const setOptionProperty = function (name, value)
{
    options[name] = value;
};

const getOptions = function ()
{
    return options;
};

const getOptionProperty = function (name)
{
    return options[name];
};

// -------------------------
// Specialized
// -------------------------
/**
 * Returns in seconds the value of a day, week or year
 * @param {TIME_UNIT} infoType
 * @returns {number}
 */
const getAgeMaxUnique = function (infoType = TIME_UNIT.DAY)
{
    let seconds, day = 86400;
    if (infoType === TIME_UNIT.WEEK) {
        seconds = day * 7;
    }
    else if (infoType === TIME_UNIT.YEAR) {
        seconds = day * 365;
    }
    else {
        seconds = day;
    }
    return seconds;
};

module.exports.TIME_UNIT = TIME_UNIT;

module.exports.getOptionProperty = getOptionProperty;
module.exports.getOptions = getOptions;

module.exports.setOptions = setOptions;
module.exports.setOptionProperty = setOptionProperty;

module.exports.getAgeMaxUnique = getAgeMaxUnique;

