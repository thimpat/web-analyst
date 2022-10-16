const {existsSync, writeFileSync, mkdirSync} = require("fs");
const {INIT_DATA_CHART} = require("../../constants.cjs");
const path = require("path");

/**
 * Create map file
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

module.exports.buildMapFile = buildMapFile;
