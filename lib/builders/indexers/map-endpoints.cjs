const {LIST_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildEndpointIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.ENDPOINTS_REFS);
        return buildIndexer(ipsLogPath);
    }
    catch (e)
    {
        console.error({lid: "WA2113"}, e.message);
    }

    return false;
};

const getRegisteredEndpoints = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.ENDPOINTS_REFS, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isEndpointRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateEndpointIndexer = function ()
{
    try
    {
        const dataPath = getDataPath(LIST_DATA_FILES.ENDPOINTS_REFS);
        const registeredEntries = getRegisteredEndpoints();
        writeFileSync(dataPath, JSON.stringify(registeredEntries, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

function addToEndpointIndexer(endpointName)
{
    try
    {
        myMap = getRegisteredElements(LIST_DATA_FILES.ENDPOINTS_REFS, myMap);
        if (isEndpointRegistered(endpointName))
        {
            ++myMap[endpointName].visited;
            return false;
        }

        myMap[endpointName] = {
            visited: 1,
        };

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

module.exports.getRegisteredEndpoints = getRegisteredEndpoints;

module.exports.buildEndpointIndexer = buildEndpointIndexer;

module.exports.addToEndpointIndexer = addToEndpointIndexer;
module.exports.updateEndpointIndexer = updateEndpointIndexer;

