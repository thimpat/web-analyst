const {LIST_DATA_FILES} = require("../../../constants.cjs");
const {existsSync, writeFileSync, readFileSync} = require("fs");
const {getStringFormattedDate} = require("../../utils/common.cjs");
const {buildIndexer, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;

/**
 * Create ip log file
 * @returns {boolean}
 */
const buildIPIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.IPS_REFS);
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
const getRegisteredIps = () =>
{
    try
    {
        if (myMap)
        {
            return myMap;
        }

        const filepath = getDataPath(LIST_DATA_FILES.IPS_REFS);
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
const isIpRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateIPFile = function ()
{
    try
    {
        const ipsDataPath = getDataPath(LIST_DATA_FILES.IPS_REFS);
        const ips = getRegisteredIps();
        writeFileSync(ipsDataPath, JSON.stringify(ips, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function addToIpFile(ip)
{
    try
    {
        const ips = getRegisteredIps();
        if (isIpRegistered(ip))
        {
            ++ips[ip].visited;
            return false;
        }

        ips[ip] = {
            visited: 1,
            date: getStringFormattedDate()
        };

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

module.exports.buildIPIndexer = buildIPIndexer;
module.exports.addToIpFile = addToIpFile;
module.exports.updateIPFile = updateIPFile;

module.exports.isIpRegistered = isIpRegistered;
