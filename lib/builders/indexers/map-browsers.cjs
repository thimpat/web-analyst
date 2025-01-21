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
        console.error({lid: "WA2113"}, e.message);
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

/**
 * Write on disk statistics related to the number of times browsers have been used
 * @returns {boolean}
 */
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
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

/**
 * Simplify browser name to most common ones
 * See {@link https://stackoverflow.com/questions/8754080/how-to-get-exact-browser-name-and-version} for list of
 * user agent
 * @param userAgent
 * @returns {null|string}
 */
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
    else if (userAgent.match(/firefox|fxios|gecko/i))
    {
        return "Firefox";
    }
    else if (userAgent.match(/safari/i))
    {
        return "Safari";
    }
    else if (userAgent.match(/trident|msie/i))
    {
        return "Explorer";
    }
    else if (userAgent.match(/netscape|navigator/i))
    {
        return "Netscape";
    }
    else if (userAgent.match(/lynx/i))
    {
        return "Lynx";
    }
    else if (userAgent.match(/webtv/i))
    {
        return "WebTV";
    }
    else if (userAgent.match(/Konqueror/i))
    {
        return "Konqueror";
    }
    else if (userAgent.match(/galeon/i))
    {
        return "Galeon";
    }
    else if (userAgent.match(/amaya/i))
    {
        return "amaya";
    }
    else if (userAgent.match(/netpositive/i))
    {
        return "NetPositive";
    }
    else if (userAgent.match(/icab/i))
    {
        return "iCab";
    }
    else if (userAgent.match(/omniweb/i))
    {
        return "Omniweb";
    }
    else if (userAgent.match(/phoenix/i))
    {
        return "Phoenix";
    }
    else if (userAgent.match(/firebird/i))
    {
        return "Firebird";
    }
    else if (userAgent.match(/iceweasel/i))
    {
        return "Iceweasel";
    }

    return null;
}

/**
 * Increment the number of times a browser has been used by parsing the given user agent
 * @param userAgent
 * @returns {boolean}
 */
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
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

module.exports.getRegisteredBrowsers = getRegisteredBrowsers;

module.exports.buildBrowserIndexer = buildBrowserIndexer;

module.exports.addToBrowserIndexer = addToBrowserIndexer;
module.exports.updateBrowserIndexer = updateBrowserIndexer;

module.exports.isBrowserRegistered = isBrowserRegistered;
