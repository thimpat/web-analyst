const {DEFAULT_PLUGIN_PATTERN} = require("../../hybrid/cjs/constants.cjs");
const pageRegexes = [];
const earningRegexes = [];
const ignoreRegexes = [];

const isPattern = function (text, pageRegexes)
{
    try
    {
        for (let i = 0; i < pageRegexes.length; ++i)
        {
            try
            {
                const regexp = pageRegexes[i];
                regexp.lastIndex = 0;
                if (regexp.test(text))
                {
                    return true;
                }
            }
            catch (e)
            {
                console.error({lid: 2249}, e.message);
            }
        }
    }
    catch (e)
    {
        // console.error({lid: 2993}, e.message);
    }

    return false;
};

const isPagePattern = function (text)
{
    return isPattern(text, pageRegexes);
};

const isEarningPattern = function (text)
{
    return isPattern(text, earningRegexes);
};

const isIgnorePattern = function (text)
{
    return isPattern(text, ignoreRegexes);
};

const getEarningPattern = function (text)
{
    try
    {
        for (let i = 0; i < pageRegexes.length; ++i)
        {
            try
            {
                const regexp = earningRegexes[i];
                if (!regexp)
                {
                    continue;
                }

                regexp.lastIndex = 0;

                const matches = regexp.exec(text);
                if (!matches || matches.length <= 1)
                {
                    continue;
                }

                return parseFloat(matches[1]);
            }
            catch (e)
            {
                console.error({lid: 2259}, e.message);
            }
        }
    }
    catch (e)
    {
        // console.error({lid: 2993}, e.message);
    }

    return 0;

};

/**
 * Convert string patterns to regexes
 * @param patterns
 * @param regexes
 * @param defaultPattern
 * @returns {boolean}
 */
const setPatterns = function (patterns, regexes, {defaultPattern = null} = {})
{
    try
    {
        if (!Array.isArray(patterns))
        {
            patterns = patterns || defaultPattern;
            patterns = patterns ? [patterns] : [];
        }

        for (let i = 0; i < patterns.length; ++i)
        {
            try
            {
                const pattern = patterns[i] || defaultPattern;
                regexes[i] = new RegExp(pattern);
            }
            catch (e)
            {
                console.error({lid: 2655}, e.message);
            }
        }
        return true;
    }
    catch (e)
    {
        console.error({lid: 2997}, e.message);
    }

    return false;
};

const setIgnorePatterns = function (ignorePatterns)
{
    setPatterns(ignorePatterns, ignoreRegexes);
 };

const setPagePatterns = function (pagePatterns)
{
    setPatterns(pagePatterns, pageRegexes, {defaultPattern: DEFAULT_PLUGIN_PATTERN});
 };

const setMoneyPattern = function (moneyPatterns)
{
    setPatterns(moneyPatterns, earningRegexes);
};

/**
 *
 * @param pagePatterns
 * @param earningPatterns
 * @param ignorePatterns
 * @returns {boolean}
 */
const initPatterns = function (pagePatterns, earningPatterns, ignorePatterns)
{
    try
    {
        setPagePatterns(pagePatterns);
        setMoneyPattern(earningPatterns);
        setIgnorePatterns(ignorePatterns);
        return true;
    }
    catch (e)
    {
        console.error({lid: 2985}, e.message);
    }

    return false;
};

module.exports.initPatterns = initPatterns;


module.exports.setIgnorePatterns = setIgnorePatterns;
module.exports.setMoneyPattern = setMoneyPattern;
module.exports.setPagePattern = setPagePatterns;

module.exports.isIgnorePattern = isIgnorePattern;
module.exports.isEarningPattern = isEarningPattern;
module.exports.isPagePattern = isPagePattern;

module.exports.getEarningPattern = getEarningPattern;
