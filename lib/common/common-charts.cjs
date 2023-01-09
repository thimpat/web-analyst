const {mkdirSync, writeFileSync, existsSync, readFileSync} = require("fs");
const {isJson, joinPath} = require("@thimpat/libutils");
const {getRegisteredInfoIP} = require("../builders/indexers/map-ips.cjs");
const {INIT_DATA_CHART, CHART_TYPE, CHART_DATA_FILES} = require("../../hybrid/cjs/constants.cjs");
const path = require("path");
const {getRegisteredBrowsers} = require("../builders/indexers/map-browsers.cjs");
const {get24HoursLabels, getWeekLabels, getYearLabels} = require("../../hybrid/cjs/fixed-label-generator.cjs");
const {getPopularityLabels} = require("./dynamic-label-generator.cjs");
const {getServerLogDir} = require("../utils/core.cjs");
const {getRegisteredOses} = require("../builders/indexers/map-oses.cjs");
const {getRegisteredLanguages} = require("../builders/indexers/map-languages.cjs");
const {getRegisteredEndpoints} = require("../builders/indexers/map-endpoints.cjs");
const {getTodayDate, getStringFormattedDate} = require("../utils/common.cjs");
const {getAgeMaxUnique} = require("../utils/options.cjs");

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

/**
 * Update the number of unique visitors without checks
 * @param currentData
 * @param ip
 * @param index
 * @returns {boolean}
 */
const updateUniqueVisitors = (currentData, ip, index) =>
{
    try
    {
        ++currentData.dataUniqueVisitors[index];
    }
    catch (e)
    {
        console.error({lid: 2669}, e.message);
    }
};

/**
 * Update the number of visits and visitors (unique)
 * @param currentData
 * @param ip
 * @param index
 * @param seen
 * @returns {boolean}
 */
const updateVisitors = (currentData, ip, index, {seen = false} = {}) =>
{
    try
    {
        ++currentData.dataVisitors[index];

        if (seen)
        {
            return true;
        }

        const ipInfo = getRegisteredInfoIP(ip);
        if (ipInfo)
        {
            const now = new Date();
            const ipAge = (now.getTime() - (new Date(ipInfo.realDate || ipInfo.date)).getTime()) / 1000;

            const ageMax = getAgeMaxUnique();
            if (ipAge < ageMax)
            {
                return true;
            }

            // The log file ip will be updated later
            ipInfo.realDate = now;
            ipInfo.date = getStringFormattedDate(now);
        }

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

/**
 * Create data for empty chart
 * @param jsonPath
 * @returns {{}}
 */
const createEmptyChart = (jsonPath) =>
{
    const dir = path.parse(jsonPath).dir;
    if (!existsSync(dir))
    {
        mkdirSync(dir);
    }
    writeFileSync(jsonPath, INIT_DATA_CHART, {encoding: "utf8"});
    return {};
};

/**
 * Save data into a json file
 * @param {string} pathname
 * @param {*} data
 * @returns
 */
const saveChartData = (pathname, data) =>
{
    try
    {
        if (!data)
        {
            return false;
        }

        const jsonPath = getChartPath(pathname);
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
    return saveChartData(pathname, data);
};

const getLabelsByPathname = function (pathname)
{
    try
    {
        // Get labels
        let labels;

        if (pathname === CHART_DATA_FILES.TODAY_DATA_FILENAME)
        {
            labels = get24HoursLabels();
        }
        else if (pathname === CHART_DATA_FILES.WEEK_DATA_FILENAME)
        {
            labels = getWeekLabels();
        }
        else if (pathname === CHART_DATA_FILES.YEAR_DATA_FILENAME)
        {
            labels = getYearLabels();
        }

        return labels;
    }
    catch (e)
    {
        console.error({lid: 2341}, e.message);
    }

    return false;
};

const resetDataChart = function (pathname)
{
    const json = {};
    try
    {
        const labels = getLabelsByPathname(pathname);

        json.dataVisitors = new Array(labels.length).fill(0);
        json.dataUniqueVisitors = new Array(labels.length).fill(0);
        json.date = getTodayDate();
        json.labels = labels;

        const jsonPath = getChartPath(pathname);
        writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: "utf8"});
    }
    catch (e)
    {
        console.error({lid: 2343}, e.message);
    }

    return json;
};

/**
 * Read json file for today chart to determine whether it needs resetting
 * Create one if it does not exist
 * Reset it if needed
 * @returns {null|any}
 */
const generateVisitorsChartData = (pathname) =>
{
    try
    {
        const labels = getLabelsByPathname(pathname);
        if (!labels)
        {
            console.error({lid: 2353}, `Invalid pathname`);
            return null;
        }

        const dataLength = labels.length;

        // Read existing data chart
        const jsonPath = getChartPath(pathname);
        let json = readChartContent(jsonPath, {type: CHART_TYPE.BAR, dataLength});
        if (!json)
        {
            json = createEmptyChart(jsonPath);
        }

        // Apply labels (We should check the labels in the file are valid and reject any update)
        json.labels = json.labels || labels;

        return json;
    }
    catch (e)
    {
        console.error({lid: 2355}, e.message);
    }

    return null;
};

/**
 * Read one of the indexers to generate popularity data (Pie charts)
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

const loadFrequencyTableData = (pathname) =>
{
    try
    {
        let items;
        if (pathname === CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME)
        {
            items = getRegisteredEndpoints();
        }
        else
        {
            items = null;
            console.error({lid: 2141}, `Unsupported pathname`);
            return null;
        }

        let total = 0;
        Object.values(items).forEach(item =>
            total += item.seen || item.visited || 0
        );
        const json = [];
        for (let key in items)
        {
            const itemObject = items[key];
            const visited = itemObject.seen || itemObject.visited || 0;
            const percent = (visited / total * 100).toFixed(2);
            json.push({
                pathname: key,
                hits    : visited,
                percent : percent + "%"
            });
        }

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

module.exports.generateVisitorsChartData = generateVisitorsChartData;
module.exports.loadPopularityChartData = loadPopularityChartData;
module.exports.loadFrequencyTableData = loadFrequencyTableData;

module.exports.readChartContent = readChartContent;
module.exports.createEmptyChart = createEmptyChart;

module.exports.resetDataChart = resetDataChart;
