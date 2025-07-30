const {LIST_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildReferrerIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.REFERRES_REF);
        return buildIndexer(ipsLogPath);
    }
    catch (e)
    {
        console.error({lid: "WA2113"}, e.message);
    }

    return false;
};

const getRegisteredReferrers = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.REFERRES_REF, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isReferrerRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateReferrerIndexer = function ()
{
    try
    {
        const dataPath = getDataPath(LIST_DATA_FILES.REFERRES_REF);
        const registeredEntries = getRegisteredReferrers();
        writeFileSync(dataPath, JSON.stringify(registeredEntries, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

function addToReferrerIndexer(referer)
{
    try
    {
        myMap =  getRegisteredReferrers();
        if (isReferrerRegistered(referer))
        {
            ++myMap[referer].visited;
            return false;
        }

        myMap[referer] = {
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

module.exports.getRegisteredReferrers = getRegisteredReferrers;

module.exports.buildReferrerIndexer = buildReferrerIndexer;

module.exports.addToReferrerIndexer = addToReferrerIndexer;
module.exports.updateReferrerIndexer = updateReferrerIndexer;

module.exports.isBrowserRegistered = isReferrerRegistered;
