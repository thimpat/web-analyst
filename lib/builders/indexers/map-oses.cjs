const {LIST_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

const useragent = require("useragent");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildOSIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.OS_REFS);
        return buildIndexer(ipsLogPath);
    }
    catch (e)
    {
        console.error({lid: "WA2113"}, e.message);
    }

    return false;
};

const getRegisteredOses = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.OS_REFS, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isOSRegistered = function (ip)
{
    return myMap && myMap[ip];
};

/**
 * Write on disk statistics related to the number of times OSes have been used
 * @returns {boolean}
 */
const updateOSIndexer = function ()
{
    try
    {
        const dataPath = getDataPath(LIST_DATA_FILES.OS_REFS);
        const registeredEntries = getRegisteredOses();
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
 * Increment the number of times an O.S. has been used by parsing the user agent
 * @param userAgent
 * @returns {boolean}
 */
function addToOSIndexer(userAgent)
{
    try
    {
        const agent = useragent.parse(userAgent);
        const os = agent.os.toString();
        const version = agent.os.toVersion();

        myMap = getRegisteredElements(LIST_DATA_FILES.OS_REFS, myMap);
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
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

module.exports.getRegisteredOses = getRegisteredOses;

module.exports.buildOSIndexer = buildOSIndexer;

module.exports.addToOSIndexer = addToOSIndexer;
module.exports.updateOSIndexer = updateOSIndexer;

