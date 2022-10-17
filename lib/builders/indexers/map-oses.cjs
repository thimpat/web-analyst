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
    return joinPath(dataDir, LIST_DATA_FILES.OS_REFS);
};

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildOSIndexer = () =>
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

const getRegisteredOses = () =>
{
    const filepath = getDataPath();
    return getRegisteredElements(filepath, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isOSRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateOSIndexer = function ()
{
    try
    {
        const browserDataPath = getDataPath();
        const registeredBrowsers = getRegisteredOses();
        writeFileSync(browserDataPath, JSON.stringify(registeredBrowsers, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function addToOSIndexer(userAgent)
{
    try
    {
        const agent = useragent.parse(userAgent);
        const os = agent.os.toString();
        const version = agent.os.toVersion();

        const filepath = getDataPath();
        myMap = getRegisteredElements(filepath, myMap);
        if (isOSRegistered(os))
        {
            ++myMap[os].visited;
            myMap[os].versions[version] = myMap[os].versions[version] || 1;
            ++myMap[os].versions[version];
            ++myMap[os].seen;
            return false;
        }

        myMap[os] = {
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

module.exports.getRegisteredOses = getRegisteredOses;

module.exports.buildOSIndexer = buildOSIndexer;

module.exports.addToOSIndexer = addToOSIndexer;
module.exports.updateOSIndexer = updateOSIndexer;

