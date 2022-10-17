const {joinPath} = require("@thimpat/libutils");
const {LIST_DATA_FILES} = require("../../../constants.cjs");
const {getServerLogDir} = require("../../utils/core.cjs");
const {writeFileSync} = require("fs");
const {buildMapFile, getRegisteredElements} = require("../../common/common-maps.cjs");

const useragent = require("useragent");

let myMap = null;

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getDataPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, LIST_DATA_FILES.BROWSERS_REFS);
};

/**
 * Create browser map file
 * @returns {boolean}
 */
const initialiseBrowserMapFile = () =>
{
    try
    {
        const ipsLogPath = getDataPath();
        return buildMapFile(ipsLogPath);
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
    const filepath = getDataPath();
    return getRegisteredElements(filepath, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isBrowserRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateBrowserFile = function ()
{
    try
    {
        const browserDataPath = getDataPath();
        const registeredBrowsers = getRegisteredBrowsers();
        writeFileSync(browserDataPath, JSON.stringify(registeredBrowsers, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function addToBrowserFile(userAgent)
{
    try
    {
        const agent = useragent.parse(userAgent);
        const browser = agent.family;
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

module.exports.initialiseBrowserMapFile = initialiseBrowserMapFile;

module.exports.addToBrowserFile = addToBrowserFile;
module.exports.updateBrowserFile = updateBrowserFile;

module.exports.isBrowserRegistered = isBrowserRegistered;
