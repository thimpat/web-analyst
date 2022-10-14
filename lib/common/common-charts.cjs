const {getTodayDate} = require("../common.cjs");
const {writeFileSync, existsSync, readFileSync} = require("fs");
const {isJson} = require("@thimpat/libutils");
const {isIpVisited} = require("../ips.cjs");
const {INIT_DATA_CHART} = require("../../constants.cjs");


const updateVisitors = (currentData, ip, index) =>
{
    try
    {
        ++currentData.dataVisitors[index];
        if (!isIpVisited(ip))
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

const getChartContent = (jsonPath, labels) =>
{
    try
    {
        // Read today file
        let strJson = INIT_DATA_CHART;

        if (existsSync(jsonPath))
        {
            strJson = readFileSync(jsonPath, {encoding: "utf8"});
            if (!isJson(strJson))
            {
                console.error({lid: 2411}, `Invalid json file: ${jsonPath}. The content will be updated.`);
                writeFileSync(jsonPath, INIT_DATA_CHART, {encoding: "utf8"});
                strJson = INIT_DATA_CHART;
            }
        }
        else
        {
            writeFileSync(jsonPath, INIT_DATA_CHART, {encoding: "utf8"});
        }

        const json = JSON.parse(strJson);
        json.labels = labels;
        json.dataVisitors = json.dataVisitors || new Array(labels.length).fill(0);
        json.dataUniqueVisitors = json.dataUniqueVisitors || new Array(json.labels.length).fill(0);

        return json;
    }
    catch (e)
    {
        console.error({lid: 2337}, e.message);
    }

    return null;

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
 * Read json file for today chart
 * Create one if it does not exist
 * Reset it if needed
 * @returns {null|any}
 */
const reviewChartData = (jsonPath, labels) =>
{
    try
    {
        const json = getChartContent(jsonPath, labels);

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

module.exports.saveChartData = saveChartData;
module.exports.reviewChartData = reviewChartData;
module.exports.updateVisitors = updateVisitors;