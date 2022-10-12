import {
    generateBarChart,
    generateDataTables,
    generatePieChart,
    getData
} from "./chart-generator.mjs";
import {MEANINGFUL_DATA_FILES} from "./constants.mjs";
import {
    buildBrowserPopularityPie,
    buildDataTable,
    buildLanguagePie, buildVisitorDay,
    buildVisitorsYear,
    buildVisitorWeek
} from "./elt-views.mjs";

const init = async () =>
{
    try
    {
        // generateLineChart($lineChart, {title: "My First dataset", labels, data, options});

        // ------------------------------------------------
        // Visitor per day
        // ------------------------------------------------
        buildVisitorDay();

        // ------------------------------------------------
        // Visitor per week
        // ------------------------------------------------
        buildVisitorWeek();

        // ------------------------------------------------
        // Visitor per month
        // ------------------------------------------------
        buildVisitorsYear();

        // ------------------------------------------------
        // Browsers
        // ------------------------------------------------
        buildBrowserPopularityPie();

        // ------------------------------------------------
        // Language
        // ------------------------------------------------
        buildLanguagePie();

        // ------------------------------------------------
        // All data
        // ------------------------------------------------
        await buildDataTable();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2153}, e.message);
    }

    return false;

};

(async function ()
{
    try
    {
        await init();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2147}, e.message);
    }

    return false;

}());