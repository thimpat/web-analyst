const {LIST_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {existsSync, writeFileSync, readFileSync} = require("fs");
const {getStringFormattedDate} = require("../../utils/common.cjs");
const {buildIndexer, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;

/**
 * Create the log file to collect IPs
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
 * @note This file must not return a copy, but the original myMap
 * Only return a copy when a "setter" is ready and all references updated to
 * use that setter
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
const getRegisteredInfoIP = function (ip)
{
    return myMap && myMap[ip];
};

const isIpRegistered = function (ip)
{
    return !getRegisteredInfoIP(ip);
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

/**
 * Add or create information related to the passed ip (visits, first seen date, etc.)
 * @param ip
 * @returns {boolean}
 */
function addIpInformationToMapper(ip)
{
    try
    {
        const ips = getRegisteredIps();

        const infoIP = getRegisteredInfoIP(ip);
        if (infoIP)
        {
            let firstTimeDate = infoIP.realDate;
            if (!firstTimeDate && infoIP.date)
            {
                firstTimeDate = new Date(infoIP.date);
                infoIP.realTime = firstTimeDate;
            }

            ++infoIP.visited;
            return false;
        }

        const realDate = new Date();
        const date = getStringFormattedDate(realDate);

        ips[ip] = {
            visited: 1,
            date,
            realDate
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
module.exports.addIpInformationToMapper = addIpInformationToMapper;
module.exports.updateIPFile = updateIPFile;

module.exports.getRegisteredInfoIP = getRegisteredInfoIP;
module.exports.isIpRegistered = isIpRegistered;
