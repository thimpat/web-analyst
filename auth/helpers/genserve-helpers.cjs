const {existsSync} = require("fs");
const {joinPath} = require("@thimpat/libutils");
const {CONTEXT_TYPE} = require("../../constants.cjs");

let genserveDir = "";

const getGenserveDir = function ()
{
    return genserveDir;
};

const setGenserveDir = function (dir)
{
    genserveDir = dir;
};

const getLibPath = function (libraryName)
{
    try
    {
        if (!genserveDir)
        {
            console.error({lid: "WA5323"}, `Genserve has not passed its location`);
            return null;
        }

        const libPath = joinPath(genserveDir, libraryName);

        if (!existsSync(libPath))
        {
            console.error({lid: "WA5317"}, `Could not find [${libPath}]`);
            return null;
        }

        return libPath;
    }
    catch (e)
    {
        console.error({lid: "WA5319"}, e.message);
    }

    return null;
};

const importGenserveLibrary = function (libraryName)
{
    try
    {
        const libPath = getLibPath(libraryName);
        if (!libPath)
        {
            return null;
        }

        return require(libPath);
    }
    catch (e)
    {
        console.error({lid: "WA5325"}, e.message);
    }

    return null;
};

const bindGenserve = function (dir, libPaths = [])
{
    try
    {
        setGenserveDir(dir);

        const libraryMap = {};
        for (let i = 0; i < libPaths.length; ++i)
        {
            const libPath = libPaths[i];
            const lib = importGenserveLibrary(libPath);
            libraryMap[libPath] = lib;
        }

        return libraryMap;
    }
    catch (e)
    {
        console.error({lid: "WA5441"}, e.message);
    }

    return {};
};


// -----------------------------------------------
// Genserve util importers
// -----------------------------------------------
const getLoggable = function (dir = genserveDir)
{
    try
    {
        const library = bindGenserve(dir, [
            "./30-log-manager/log-central.cjs"
        ]);

        const libLogCentral = library["./30-log-manager/log-central.cjs"];

        const {initialiseLogCentral} = libLogCentral;
        const loggable = initialiseLogCentral({type: CONTEXT_TYPE, name: "web-analyst"});

        return loggable;
    }
    catch (e)
    {
        console.error({lid: "WA5563"}, e.message);
    }

    return false;
};

module.exports.getLoggable = getLoggable;


module.exports.getGenserveDir = getGenserveDir;
module.exports.setGenserveDir = setGenserveDir;
module.exports.bindGenserve = bindGenserve;
