const {joinPath} = require("@thimpat/libutils");
const {LIST_DATA_FILES} = require("../constants.cjs");
const {getServerLogDir} = require("./core.cjs");
const {existsSync, writeFileSync, readFileSync} = require("fs");
const {getStringFormattedDate} = require("./common.cjs");
const {buildMapFile} = require("./common/common-maps.cjs");

let myMap = null;

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getDataPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, LIST_DATA_FILES.IPS_REFS);
};

/**
 * Create ip log file
 * @returns {boolean}
 */
const buildIpMap = () =>
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
const getRegisteredIps = () =>
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
const isIpRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateIPFile = function ()
{
    try
    {
        const ipsDataPath = getDataPath();
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

module.exports.initialiseIpMapFile = buildIpMap;
module.exports.addToIpFile = addToIpFile;
module.exports.updateIPFile = updateIPFile;

module.exports.isIpRegistered = isIpRegistered;
