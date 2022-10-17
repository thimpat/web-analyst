const {existsSync, writeFileSync, mkdirSync, readFileSync} = require("fs");
const {INIT_DATA_CHART} = require("../../constants.cjs");
const path = require("path");

/**
 * Create a map file
 * @returns {boolean}
 */
const buildMapFile = (mapPath) =>
{
    try
    {
        if (existsSync(mapPath))
        {
            return true;
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
        console.error({lid: 2113}, e.message);
    }

    return false;
};

/**
 * List of registered ips
 * Returns non-empty and already seen ips from ip log file
 * @returns {{}}
 */
const getRegisteredElements = (filepath, myMap) =>
{
    try
    {
        if (myMap)
        {
            return myMap;
        }

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


module.exports.buildMapFile = buildMapFile;
module.exports.getRegisteredElements = getRegisteredElements;
