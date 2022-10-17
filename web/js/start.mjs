import {
    buildVisitorGraph,
    buildPopularityGraph, buildDataTable, buildMoneyGraph
} from "./elt-views.mjs";
import {CHART_DATA_FILES} from "./constants.mjs";
import {getYearFilename} from "./common.mjs";


const init = async () =>
{
    try
    {
        // ------------------------------------------------
        // Visitors: day / Week / Months
        // ------------------------------------------------
        await buildVisitorGraph(CHART_DATA_FILES.TODAY_DATA_FILENAME, {
            $chart: document.getElementById("visitorHours"),
            title   : "Today",
            subTitle: "Visitor per hour"
        });

        await buildVisitorGraph(CHART_DATA_FILES.WEEK_DATA_FILENAME, {
            $chart: document.getElementById("visitorsWeek"),
            title   : "This week",
            subTitle: "Visitor per day"
        });

        const yearFilename = getYearFilename();
        await buildVisitorGraph(yearFilename, {
            $chart: document.getElementById("visitorsYear"),
            title   : "This year",
            subTitle: "Visitor per month"
        });

        // ------------------------------------------------
        // Popularity: Browsers / OS / Languages
        // ------------------------------------------------
        await buildPopularityGraph(CHART_DATA_FILES.BROWSERS_DATA_FILENAME,{
            $chart: document.getElementById("browsers"),
            title: "Browser popularity"
        });

        await buildPopularityGraph(CHART_DATA_FILES.OSES_DATA_FILENAME,{
            $chart: document.getElementById("oses"),
            title: "OS popularity"
        });

        await buildPopularityGraph(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME,{
            $chart: document.getElementById("languages"),
            title: "Language popularity"
        });

        // ------------------------------------------------
        // Endpoint frequencies
        // ------------------------------------------------
        await buildDataTable(CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME);

        await buildMoneyGraph(CHART_DATA_FILES.MONEY_DATA_FILENAME, {
            $chart: document.getElementById("money"),
            title   : "This year",
            subTitle: "Earning per month"
        });

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