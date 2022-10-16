const {getTodayDate} = require("../common.cjs");
const {mkdirSync, writeFileSync, existsSync, readFileSync} = require("fs");
const {isJson} = require("@thimpat/libutils");
const {isIpRegistered} = require("../map-ips.cjs");
const {INIT_DATA_CHART, CHART_TYPE} = require("../../constants.cjs");
const path = require("path");
const {getRegisteredBrowsers} = require("../map-browsers.cjs");


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

const readChartContent = (jsonPath, labels, {type} = {}) =>
{
    try
    {
        let strJson = INIT_DATA_CHART;

        if (existsSync(jsonPath))
        {
            return null;
        }

        strJson = readFileSync(jsonPath, {encoding: "utf8"});
        if (!isJson(strJson))
        {
            console.error({lid: 2411}, `Invalid json file: ${jsonPath}. The content will be updated.`);
            writeFileSync(jsonPath, INIT_DATA_CHART, {encoding: "utf8"});
            strJson = INIT_DATA_CHART;
        }

        const json = JSON.parse(strJson);

        if (type === CHART_TYPE.BAR)
        {
            json.labels = labels;
            json.dataVisitors = json.dataVisitors || new Array(labels.length).fill(0);
            json.dataUniqueVisitors = json.dataUniqueVisitors || new Array(json.labels.length).fill(0);
        }
        else if (type === CHART_TYPE.PIE)
        {
            json.labels = labels;
            json.dataVisitors = json.dataVisitors || new Array(labels.length).fill(0);
            json.dataUniqueVisitors = json.dataUniqueVisitors || new Array(json.labels.length).fill(0);
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

/**
 * Read json file for today chart to determine whether it needs resetting
 * Create one if it does not exist
 * Reset it if needed
 * @returns {null|any}
 */
const loadVisitorsChartData = (jsonPath, labels) =>
{
    try
    {
        let json = readChartContent(jsonPath, labels, {type: CHART_TYPE.BAR});
        if (!json)
        {
            json = createChartContent(jsonPath);
        }

        const todayDate = getTodayDate();
        if (json.date !== todayDate)
        {
            json.date = todayDate;
            json.dataVisitors = new Array(labels.length).fill(0);
            json.dataUniqueVisitors = new Array(labels.length).fill(0);
            writeFileSync(jsonPath, JSON.stringify(json, null, 2), {encoding: "utf8"});
        }

        json.labels = json.labels || labels;

        return json;
    }
    catch (e)
    {
        console.error({lid: 2353}, e.message);
    }

    return null;
};

/**
 * Read json file for today chart
 * Create one if it does not exist
 * Reset it if needed
 * @returns {null|any}
 */
const loadPopularityChartData = (jsonPath) =>
{
    try
    {
        let json = readChartContent(jsonPath, labels, {type: CHART_TYPE.PIE});
        if (!json)
        {
            json = createChartContent(jsonPath);
        }

        const browserMap = getRegisteredBrowsers();

        const labels = [];
        const visits = [];
        for (let browserName in browserMap)
        {
            const browserObject = browserMap[browserName];
            labels.push(browserName);
            visits.push(browserObject.seen);
        }

        json.labels = labels;
        json.dataVisits = visits;

        return json;
    }
    catch (e)
    {
        console.error({lid: 2353}, e.message);
    }

    return null;
};

module.exports.saveChartData = saveChartData;

module.exports.updateUniqueVisitors = updateUniqueVisitors;
module.exports.updateVisitors = updateVisitors;

module.exports.loadVisitorsChartData = loadVisitorsChartData;
module.exports.loadPopularityChartData = loadPopularityChartData;
