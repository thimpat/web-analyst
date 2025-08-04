const {LIST_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {existsSync, writeFileSync, readFileSync} = require("fs");
const {getStringFormattedDate} = require("../../utils/common.cjs");
const {buildIndexer, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;
let myTokenMap = null;

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
        console.error({lid: "WA2113"}, e.message);
    }

    return false;
};

const buildTokenIndexer = () =>
{
    try
    {
        const tokenLogPath = getDataPath(LIST_DATA_FILES.TOKENS);
        return buildIndexer(tokenLogPath);
    }
    catch (e)
    {
        console.error({lid: "WA2113"}, e.message);
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
        console.error({lid: "WA2333"}, e.message);
    }

    return {};
};

const getRegisteredTokens = () =>
{
    try
    {
        if (myTokenMap)
        {
            return myTokenMap;
        }

        const filepath = getDataPath(LIST_DATA_FILES.TOKENS);
        if (!existsSync(filepath))
        {
            return {};
        }
        const content = readFileSync(filepath, {encoding: "utf8"});
        myTokenMap = JSON.parse(content);

        return myTokenMap;
    }
    catch (e)
    {
        console.error({lid: "WA2333"}, e.message);
    }

    return {};
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
/**
 * Returns stored information about ip
 * null if the ip wasn't already stored (First visit)
 * @param ip
 * @returns {null|*}
 */
const getRegisteredInfoIP = function (ip)
{
    return myMap && myMap[ip];
};

const getRegisteredInfoToken = function (token)
{
    return myTokenMap && myTokenMap[token];
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
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

const updateTokenFile = function ()
{
    try
    {
        const tokenDataPath = getDataPath(LIST_DATA_FILES.TOKENS);
        const tokens = getRegisteredTokens();
        writeFileSync(tokenDataPath, JSON.stringify(tokens, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

/**
 * Manipulate the data that keep ips (indexers/ips.json) or tokens (indexers/tokens.json)
 * @param info
 * @param dataEntryList
 * @param ip
 * @param token
 * @returns {boolean}
 */
function updateMapperList(info, dataEntryList, ip, token = null) {
    try {

        if (info)
        {
            info.lastVisit = new Date();
            if (ip) {
                info.ip = ip;
            }

            info.lastDayVisited = info.lastDayVisited || info.lastVisit;
            info.lastWeekVisited = info.lastWeekVisited || info.lastVisit;
            info.lastYearVisited = info.lastYearVisited || info.lastVisit;
            info.initialDate = info.initialDate || info.lastVisit;

            if (token) {
                dataEntryList[token].ips = dataEntryList[token].ips || [];
                dataEntryList[token].detectionMethod = "token";
                if (!dataEntryList[token].ips.includes(ip)) {
                    dataEntryList[token].ips.push(ip);
                }
            }
            else {
                dataEntryList[ip].detectionMethod = "ip";
            }

            ++info.visited;
            return false;
        }

        const lastDayVisited = new Date();
        const date = getStringFormattedDate(lastDayVisited);

        dataEntryList[token || ip] = {
            visited: 1,
            date,
            lastDayVisited,
            lastWeekVisited: lastDayVisited,
            lastYearVisited: lastDayVisited,
            // It's the first time the ip was seen. It will not be reset
            initialDate: lastDayVisited,
        };

        if (token) {
            dataEntryList[token].ips = dataEntryList[token].ips || [];
            dataEntryList[token].detectionMethod = "token";
            if (!dataEntryList[token].ips.includes(ip)) {
                dataEntryList[token].ips.push(ip);
            }
        }
        else {
            dataEntryList[ip].detectionMethod = "ip";
        }

    }
    catch (e)
    {
        console.error({lid: "WA2989"}, e.message);
    }
}

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
        updateMapperList(infoIP, ips, ip);
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

function addTokenInformationToMapper(token, ip)
{
    try
    {
        const tokenList = getRegisteredTokens();
        const infoToken = getRegisteredInfoToken(token);
        updateMapperList(infoToken, tokenList, ip, token);
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

module.exports.buildIPIndexer = buildIPIndexer;
module.exports.buildTokenIndexer = buildTokenIndexer;
module.exports.addIpInformationToMapper = addIpInformationToMapper;
module.exports.addTokenInformationToMapper = addTokenInformationToMapper;

module.exports.updateIPFile = updateIPFile;
module.exports.updateTokenFile = updateTokenFile;

module.exports.getRegisteredInfoIP = getRegisteredInfoIP;
module.exports.getRegisteredInfoToken = getRegisteredInfoToken;

module.exports.getRegisteredToken = getRegisteredTokens;
