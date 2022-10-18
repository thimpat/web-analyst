const {getRegisteredBrowsers} = require("../builders/indexers/map-browsers.cjs");
const {CHART_DATA_FILES} = require("../../hybrid/cjs/constants.cjs");
const {getRegisteredLanguages} = require("../builders/indexers/map-languages.cjs");
const {getRegisteredOses} = require("../builders/indexers/map-oses.cjs");
const {getRegisteredEndpoints} = require("../builders/indexers/map-endpoints.cjs");

const getPopularityLabels = function(pathname)
{
    try
    {
        let map;

        // Get labels dynamically
        if (pathname === CHART_DATA_FILES.BROWSERS_DATA_FILENAME)
        {
            map = getRegisteredBrowsers();
        }
        else if (pathname === CHART_DATA_FILES.OSES_DATA_FILENAME)
        {
            map = getRegisteredOses();
        }
        else if (pathname === CHART_DATA_FILES.LANGUAGES_DATA_FILENAME)
        {
            map = getRegisteredLanguages();
        }
        else if (pathname === CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME)
        {
            map = getRegisteredEndpoints();
        }
        else
        {
            map = null;
            console.error({lid: 2145}, `No pathname given`);
            return false;
        }
        return Object.keys(map);
    }
    catch (e)
    {
        console.error({lid: 2145}, e.message);
    }

    return false;

};

// Dynamic labels
module.exports.getPopularityLabels = getPopularityLabels;

