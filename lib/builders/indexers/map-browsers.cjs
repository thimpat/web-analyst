const {LIST_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

const useragent = require("useragent");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildBrowserIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.BROWSERS_REFS);
        return buildIndexer(ipsLogPath);
    }
    catch (e)
    {
        console.error({lid: 2113}, e.message);
    }

    return false;
};

/**
 * List of registered ips
 * Returns non-empty and already seen ips from ip log file
 * @returns {{}}
 */
const getRegisteredBrowsers = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.BROWSERS_REFS, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isBrowserRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateBrowserIndexer = function ()
{
    try
    {
        const dataPath = getDataPath(LIST_DATA_FILES.BROWSERS_REFS);
        const registeredEntries = getRegisteredBrowsers();
        writeFileSync(dataPath, JSON.stringify(registeredEntries, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function getBrowserName(userAgent)
{

    if (userAgent.match(/opr\//i))
    {
        return "Opera";
    }
    else if (userAgent.match(/edg/i))
    {
        return "Edge";
    }
    else if (userAgent.match(/chrome|chromium|crios/i))
    {
        return "Chrome";
    }
    else if (userAgent.match(/firefox|fxios/i))
    {
        return "Firefox";
    }
    else if (userAgent.match(/safari/i))
    {
        return "Safari";
    }

    return null;
}

function addToBrowserIndexer(userAgent)
{
    try
    {
        const agent = useragent.parse(userAgent);

        const browser = getBrowserName(agent.source) || agent.family;
        const version = agent.toVersion();

        myMap = getRegisteredBrowsers();
        if (isBrowserRegistered(browser))
        {
            ++myMap[browser].visited;
            myMap[browser].versions[version] = myMap[browser].versions[version] || 1;
            ++myMap[browser].versions[version];
            ++myMap[browser].seen;
            return false;
        }

        myMap[browser] = {
            seen    : 1,
            versions: {
                [version]: 1
            }
        };

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

module.exports.getRegisteredBrowsers = getRegisteredBrowsers;

module.exports.buildBrowserIndexer = buildBrowserIndexer;

module.exports.addToBrowserIndexer = addToBrowserIndexer;
module.exports.updateBrowserIndexer = updateBrowserIndexer;

module.exports.isBrowserRegistered = isBrowserRegistered;
