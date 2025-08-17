const {existsSync, writeFileSync, mkdirSync, readFileSync} = require("fs");
const {INIT_DATA_CHART} = require("../../hybrid/cjs/wa-constants.cjs");
const path = require("path");
const {getServerLogDir} = require("../utils/core.cjs");
const {joinPath} = require("@thimpat/libutils");

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getDataPath = (pathname) =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, pathname);
};

/**
 * Create a map file (if non-existent) and parent directories
 * @returns {boolean}
 */
const buildIndexer = (mapPath) =>
{
    try
    {
        let jsonStr = "";
        if (existsSync(mapPath))
        {
            try {
                jsonStr = readFileSync(mapPath, { encoding: "utf8" }) || "";
                jsonStr = jsonStr.trim();
                if (jsonStr.length > 4) {
                    return true;
                }

                JSON.parse(jsonStr);
                return true;
            }
            catch {
                console.error({lid: "WA2111"}, `Invalid indexer file: ${mapPath}. The file must be a valid JSON`);
                if (jsonStr.length > 10) {
                    return false;
                }
            }
        }

        const dir = path.parse(mapPath).dir;
        if (!existsSync(dir))
        {
            mkdirSync(dir, {recursive: true});
        }

        writeFileSync(mapPath, INIT_DATA_CHART, {encoding: "utf8"});
        return true;
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
 * @returns {{}}
 */
const getRegisteredElements = (pathname, myMap) =>
{
    try
    {
        if (myMap)
        {
            return myMap;
        }

        const filepath = getDataPath(pathname);
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

module.exports.getDataPath = getDataPath;

module.exports.buildIndexer = buildIndexer;
module.exports.getRegisteredElements = getRegisteredElements;
