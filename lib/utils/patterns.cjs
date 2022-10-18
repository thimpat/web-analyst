const pageRegexes = [];
const earningRegexes = [];

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

const getEarningPattern = function (text)
{
    try
    {
        for (let i = 0; i < pageRegexes.length; ++i)
        {
            try
            {
                const regexp = earningRegexes[i];
                regexp.lastIndex = 0;

                const matches = regexp.exec(text);
                if (matches.length <= 1)
                {
                    continue;
                }

                return parseFloat(matches[1]);
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

    return 0;

};

const setPatterns = function (pagePatterns, pageRegexes)
{
    try
    {
        // !(pathname === "/" || /server\./.test(pathname))
        if (!Array.isArray(pagePatterns))
        {
            pagePatterns = [pagePatterns];
        }

        for (let i = 0; i < pagePatterns.length; ++i)
        {
            try
            {
                const pagePattern = pagePatterns[i] || ".html$";
                pageRegexes[i] = new RegExp(pagePattern);
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

const setPagePatterns = function (pagePatterns)
{
    setPatterns(pagePatterns, pageRegexes);
 };

const setMoneyPattern = function (moneyPatterns)
{
    setPatterns(moneyPatterns, earningRegexes);
};

const initPattern = function (pagePatterns, earningPatterns)
{
    try
    {
        setPagePatterns(pagePatterns);
        setMoneyPattern(earningPatterns);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2985}, e.message);
    }

    return false;
};

module.exports.initPattern = initPattern;


module.exports.setMoneyPattern = setMoneyPattern;
module.exports.setPagePattern = setPagePatterns;
module.exports.isEarningPattern = isEarningPattern;
module.exports.getEarningPattern = getEarningPattern;
module.exports.isPagePattern = isPagePattern;