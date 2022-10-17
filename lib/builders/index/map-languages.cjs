const {joinPath} = require("@thimpat/libutils");
const {LIST_DATA_FILES} = require("../../../constants.cjs");
const {getServerLogDir} = require("../../utils/core.cjs");
const {writeFileSync} = require("fs");
const {buildMapFile, getRegisteredElements} = require("../../common/common-maps.cjs");

const acceplanguage = require("accept-language-parser");

let myMap = null;

/**
 * Log file containing all seen ips
 * @returns {*}
 */
const getDataPath = () =>
{
    const dataDir = getServerLogDir();
    return joinPath(dataDir, LIST_DATA_FILES.LANGUAGES_REF);
};

/**
 * Create browser map file
 * @returns {boolean}
 */
const initialiseLanguageMapFile = () =>
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

const getRegisteredLanguages = () =>
{
    const filepath = getDataPath();
    return getRegisteredElements(filepath, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isLanguageRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateLanguageFile = function ()
{
    try
    {
        const browserDataPath = getDataPath();
        const registeredBrowsers = getRegisteredLanguages();
        writeFileSync(browserDataPath, JSON.stringify(registeredBrowsers, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function addToLanguageFile(acceptLanguage)
{
    try
    {
        const languages = acceplanguage.parse(acceptLanguage);

        myMap =  getRegisteredLanguages();
        for (let i = 0; i < languages.length; ++i)
        {
            const language = languages[i];
            const code = language.code;
            if (isLanguageRegistered(code))
            {
                ++myMap[code].visited;
                ++myMap[code].seen;
                continue;
            }

            myMap[code] = {
                seen    : 1,
                visited    : 1,
            };
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2451}, e.message);
    }

    return false;
}

module.exports.getRegisteredLanguages = getRegisteredLanguages;

module.exports.initialiseLanguageMapFile = initialiseLanguageMapFile;

module.exports.addToLanguageFile = addToLanguageFile;
module.exports.updateLanguageFile = updateLanguageFile;

module.exports.isBrowserRegistered = isLanguageRegistered;
