const {getTodayDate} = require("../utils/common.cjs");
const {mkdirSync, writeFileSync, existsSync, readFileSync} = require("fs");
const {isJson, joinPath} = require("@thimpat/libutils");
const {isIpRegistered} = require("../builders/indexers/map-ips.cjs");
const {INIT_DATA_CHART, CHART_TYPE, CHART_DATA_FILES} = require("../../constants.cjs");
const path = require("path");
const {getRegisteredBrowsers} = require("../builders/indexers/map-browsers.cjs");
const {getPopularityLabels, get24HoursLabels, getWeekLabels, getYearLabels} = require("./label-generator.cjs");
const {getServerLogDir} = require("../utils/core.cjs");
const {getRegisteredOses} = require("../builders/indexers/map-oses.cjs");
const {getRegisteredLanguages} = require("../builders/indexers/map-languages.cjs");
const {getRegisteredEndpoints} = require("../builders/indexers/map-endpoints.cjs");


const getChartPath = (pathname) =>
{
    if (!pathname)
    {
        console.error({lid: 2667}, `No pathname given`);
        return null;
    }
    const dataDir = getServerLogDir();
    return joinPath(dataDir, pathname);
};

const updateUniqueVisitors = (currentData, ip, index) =>
{
    try
    {
        if (!isIpRegistered(ip))
        {
            ++currentData.dataUniqueVisitors[index];
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 2669}, e.message);
    }

    return false;
};

const updateVisitors = (currentData, ip, index) =>
{
    try
    {
        ++currentData.dataVisitors[index];
        return updateUniqueVisitors(currentData, ip, index);
    }
    catch (e)
    {
        console.error({lid: 2669}, e.message);
    }

    return false;
};

const readChartContent = (jsonPath, {type, dataLength} = {}) =>
{
    try
    {
        if (!existsSync(jsonPath))
        {
            return null;
        }

        let strJson = readFileSync(jsonPath, {encoding: "utf8"});
        if (!isJson(strJson))
        {
            console.error({lid: 2411}, `Invalid json file: ${jsonPath}. The content will be updated.`);
            return null;
        }

        const json = JSON.parse(strJson);

        if (type === CHART_TYPE.BAR)
        {
            json.dataVisitors = json.dataVisitors || new Array(dataLength).fill(0);
            json.dataUniqueVisitors = json.dataUniqueVisitors || new Array(dataLength).fill(0);
        }
        else if (type === CHART_TYPE.PIE)
        {
            json.dataVisits = json.dataVisits || new Array(dataLength).fill(0);
        }
        else if (type === CHART_TYPE.TABLE)
        {
            json.dataVisits = json.dataVisits || new Array(dataLength).fill(0);
        }

        return json;
    }
    catch (e)
    {
        console.error({lid: 2337}, e.message);
    }

    return null;

};

const createChartContent = (jsonPath) =>
{
    const dir = path.parse(jsonPath).dir;
    if (!existsSync(dir))
    {
        mkdirSync(dir);
    }
    writeFileSync(jsonPath, INIT_DATA_CHART, {encoding: "utf8"});
    return {};
};

const saveChartData = (jsonPath, data) =>
{
    try
    {
        if (!data)
        {
            return false;
        }

        const dir = path.parse(jsonPath).dir;
        if (!existsSync(dir))
        {
            mkdirSync(dir, {recursive: true});
        }

        const str = JSON.stringify(data, null, 2);
        writeFileSync(jsonPath, str, {encoding: "utf8"});
        return true;
    }
    catch (e)
    {
        console.error({lid: 2339}, e.message);
    }

    return false;
};

const savePopularityChartData = (pathname, data) =>
{
    const jsonPath = getChartPath(pathname);
    return saveChartData(jsonPath, data);
};

/**
 * Read json file for today chart to determine whether it needs resetting
 * Create one if it does not exist
 * Reset it if needed
 * @returns {null|any}
 */
const loadVisitorsChartData = (jsonPath) =>
{
    try
    {
        // Get labels
        let labels;

        if (jsonPath.endsWith(CHART_DATA_FILES.TODAY_DATA_FILENAME))
        {
            labels = get24HoursLabels();
        }
        else if (jsonPath.endsWith(CHART_DATA_FILES.WEEK_DATA_FILENAME))
        {
            labels = getWeekLabels();
        }
        else
        {
            labels = getYearLabels();
        }

        // Read data chart
        const dataLength = labels.length;
        let json = readChartContent(jsonPath, {type: CHART_TYPE.BAR, dataLength});
        if (!json)
        {
            json = createChartContent(jsonPath);
        }

        // Apply labels
        json.labels = json.labels || labels;

        // Apply data
        const todayDate = getTodayDate();
        if (json.date !== todayDate)
        {
            json.date = todayDate;
            json.dataVisitors = new Array(labels.length).fill(0);
            json.dataUniqueVisitors = new Array(labels.length).fill(0);
            writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: "utf8"});
        }

        return json;
    }
    catch (e)
    {
        console.error({lid: 2353}, e.message);
    }

    return null;
};

/**
 * Read one of the indexers to generate popularity data
 * @returns {null|any}
 */
const loadPopularityChartData = (pathname) =>
{
    try
    {
        // Get labels dynamically
        const labels = getPopularityLabels(pathname);

        let items;
        // Get labels dynamically
        if (pathname === CHART_DATA_FILES.BROWSERS_DATA_FILENAME)
        {
            items = getRegisteredBrowsers();
        }
        else if (pathname === CHART_DATA_FILES.OSES_DATA_FILENAME)
        {
            items = getRegisteredOses();
        }
        else if (pathname === CHART_DATA_FILES.LANGUAGES_DATA_FILENAME)
        {
            items = getRegisteredLanguages();
        }
        else if (pathname === CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME)
        {
            items = getRegisteredEndpoints();
        }
        else
        {
            items = null;
            console.error({lid: 2143}, `No pathname given`);
            return null;
        }

        let total = 0;
        const visits = [];
        for (let browserName in items)
        {
            const browserObject = items[browserName];
            const visited = browserObject.seen || browserObject.visited;
            visits.push(visited);
            total += visited;
        }

        const percentages = [];
        for (let i = 0; i < visits.length; ++i)
        {
            const percent = (visits[i] / total * 100).toFixed(2);
            percentages.push(parseFloat(percent));
        }

        const json = {};

        // Apply labels
        json.labels = json.labels || labels;

        // Apply data
        json.dataVisits = visits;
        json.percentages = percentages;

        return json;
    }
    catch (e)
    {
        console.error({lid: 2353}, e.message);
    }

    return null;
};


module.exports.getChartPath = getChartPath;
module.exports.saveChartData = saveChartData;

module.exports.savePopularityChartData = savePopularityChartData;

module.exports.updateUniqueVisitors = updateUniqueVisitors;
module.exports.updateVisitors = updateVisitors;

module.exports.loadVisitorsChartData = loadVisitorsChartData;
module.exports.loadPopularityChartData = loadPopularityChartData;
