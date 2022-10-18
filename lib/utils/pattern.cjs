const regexPages = [];
const earningRegexes = [];

const isPagePattern = function (text)
{
    try
    {
        for (let i = 0; i < regexPages.length; ++i)
        {
            try
            {
                const regexp = regexPages[i];
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


const isMoneyPattern = function (text)
{
    try
    {
        for (let i = 0; i < earningRegexes.length; ++i)
        {
            const regexp = earningRegexes[i];
            regexp.lastIndex = 0;
            if (regexp.test(text))
            {
                return true;
            }
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2995}, e.message);
    }

    return false;
};

const setPagePatterns = function (pagePatterns)
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
                regexPages[i] = new RegExp(pagePattern);
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

const setMoneyPattern = function (moneyPatterns)
{
    try
    {
        if (!Array.isArray(moneyPatterns))
        {
            moneyPatterns = [moneyPatterns];
        }


        for (let i = 0; i < moneyPatterns.length; ++i)
        {
            const moneyPattern = moneyPatterns[i];
            earningRegexes[i] = new RegExp(moneyPattern || "");
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2999}, e.message);
    }

    return false;
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
module.exports.isMoneyPattern = isMoneyPattern;
module.exports.isPagePattern = isPagePattern;
