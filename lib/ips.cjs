const {joinPath} = require("@thimpat/libutils");
const {MEANINGFUL_DATA_FILES, INIT_DATA_CHART} = require("../constants.cjs");
const {getServerLogDir} = require("./core.cjs");
const {existsSync, writeFileSync, readFileSync, appendFileSync} = require("fs");
const {getStringFormattedDate} = require("./common.cjs");

let ipMap = null;

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getDataIPsPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_DATA_FILES.IPS_DATA_FILENAME);
};

/**
 * Create ip log file
 * @returns {boolean}
 */
const buildIpFile = () =>
{
    try
    {
        const ipsLogPath = getDataIPsPath();
        if (existsSync(ipsLogPath))
        {
            return true;
        }

        writeFileSync(ipsLogPath, INIT_DATA_CHART, {encoding: "utf8"});
        return true;
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
        if (ipMap)
        {
            return ipMap;
        }

        const filepath = getDataIPsPath();
        if (!existsSync(filepath))
        {
            return {};
        }
        const content = readFileSync(filepath, {encoding: "utf8"});
        ipMap = JSON.parse(content);

        return ipMap;
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
const isIpVisited = function (ip)
{
    return ipMap && ipMap[ip];
};

const updateIPFile = function ()
{
    try
    {
        const ipsDataPath = getDataIPsPath();
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

module.exports.updateIPFile = updateIPFile;


function addToIpFile(ip)
{
    try
    {
        const ips = getRegisteredIps();
        if (isIpVisited(ip))
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

module.exports.getDataIPsPath = getDataIPsPath;
module.exports.buildIpFile = buildIpFile;

module.exports.getRegisteredIps = getRegisteredIps;
module.exports.addToIpFile = addToIpFile;

module.exports.updateIPFile = updateIPFile;

module.exports.isIpVisited = isIpVisited;
