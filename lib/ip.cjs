const {joinPath} = require("@thimpat/libutils");
const {MEANINGFUL_LOG_FILES} = require("../constants.cjs");
const {getServerLogDir} = require("./core.cjs");
const {existsSync, writeFileSync, readFileSync, appendFileSync} = require("fs");

let ipList = null;

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getIpLogsPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, MEANINGFUL_LOG_FILES.IPS_LOG_FILENAME);
};

/**
 * Create ip log file
 * @returns {boolean}
 */
const buildIpFile = () =>
{
    try
    {
        // Create ips.log
        const ipsLogPath = getIpLogsPath();
        if (existsSync(ipsLogPath))
        {
            return true;
        }

        writeFileSync(ipsLogPath, "", {encoding: "utf8"});
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
 * @returns {Set<string>}
 */
const getRegisteredIps = (force = false) =>
{
    if (!force && ipList)
    {
        return ipList;
    }

    const filepath = getIpLogsPath();
    const content = readFileSync(filepath, {encoding: "utf8"});
    const lines = content.split(/\s+/).filter((item) => item);

    ipList = new Set(lines);

    return ipList;
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
function addToIpFile(ip)
{
    try
    {
        if (ipList && ipList.has(ip))
        {
            return false;
        }

        const ipsLogPath = getIpLogsPath();
        appendFileSync(ipsLogPath, ip + "\n", {encoding: "utf8"});

        const ips = getRegisteredIps();
        ips.add(ip);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

module.exports.getIpLogsPath = getIpLogsPath;
module.exports.buildIpFile = buildIpFile;

module.exports.getRegisteredIps = getRegisteredIps;
module.exports.addToIpFile = addToIpFile;