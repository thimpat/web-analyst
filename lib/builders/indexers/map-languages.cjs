const {LIST_DATA_FILES} = require("../../../hybrid/cjs/constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

const acceplanguage = require("accept-language-parser");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildLanguageIndexer = () =>
{
    try
    {
        const ipsLogPath = getDataPath(LIST_DATA_FILES.LANGUAGES_REF);
        return buildIndexer(ipsLogPath);
    }
    catch (e)
    {
        console.error({lid: 2113}, e.message);
    }

    return false;
};

const getRegisteredLanguages = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.LANGUAGES_REF, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isLanguageRegistered = function (ip)
{
    return myMap && myMap[ip];
};

const updateLanguageIndexer = function ()
{
    try
    {
        const dataPath = getDataPath(LIST_DATA_FILES.LANGUAGES_REF);
        const registeredEntries = getRegisteredLanguages();
        writeFileSync(dataPath, JSON.stringify(registeredEntries, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2989}, e.message);
    }

    return false;
};

function addToLanguageIndexer(acceptLanguage)
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

module.exports.buildLanguageIndexer = buildLanguageIndexer;

module.exports.addToLanguageIndexer = addToLanguageIndexer;
module.exports.updateLanguageIndexer = updateLanguageIndexer;

module.exports.isBrowserRegistered = isLanguageRegistered;
