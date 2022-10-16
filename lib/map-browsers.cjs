const {joinPath} = require("@thimpat/libutils");
const {LIST_DATA_FILES} = require("../constants.cjs");
const {getServerLogDir} = require("./core.cjs");
const {existsSync, writeFileSync, readFileSync} = require("fs");
const {buildMapFile} = require("./common/common-maps.cjs");

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
const buildBrowserMap = () =>
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
    try
    {
        if (myMap)
        {
            return myMap;
        }

        const filepath = getDataPath();
        if (!existsSync(filepath))
        {
            return {};
        }
        const content = readFileSync(filepath, {encoding: "utf8"});
        myMap = JSON.parse(content);

        return myMap;
    }
    catch (e)
    {
        console.error({lid: 2333}, e.message);
    }

    return {};
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

        const browserMap = getRegisteredBrowsers();
        if (isBrowserRegistered(browser))
        {
            ++browserMap[browser].visited;
            browserMap[browser].versions[version] = browserMap[browser].versions[version] || 1;
            ++browserMap[browser].versions[version];
            ++browserMap[browser].seen;
            return false;
        }

        browserMap[browser] = {
            seen: 1,
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

module.exports.initialiseBrowserMapFile = buildBrowserMap;

module.exports.addToBrowserFile = addToBrowserFile;
module.exports.updateBrowserFile = updateBrowserFile;

module.exports.isBrowserRegistered = isBrowserRegistered;
