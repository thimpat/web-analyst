import {
    buildVisitorDay,
    buildVisitorsYear,
    buildVisitorsWeek, buildPopularityChart, buildDataTable
} from "./elt-views.mjs";
import {CHART_DATA_FILES} from "./constants.mjs";


const init = async () =>
{
    try
    {
        // ------------------------------------------------
        // Visitors: day / Week / Months
        // ------------------------------------------------
        await buildVisitorDay();
        await buildVisitorsWeek();
        await buildVisitorsYear();

        // ------------------------------------------------
        // Popularity: Browsers / OS / Languages
        // ------------------------------------------------
        await buildPopularityChart(CHART_DATA_FILES.BROWSERS_DATA_FILENAME,{
            $chart: document.getElementById("browsers"),
            title: "Browser popularity"
        });

        await buildPopularityChart(CHART_DATA_FILES.OSES_DATA_FILENAME,{
            $chart: document.getElementById("oses"),
            title: "OS popularity"
        });

        await buildPopularityChart(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME,{
            $chart: document.getElementById("languages"),
            title: "Language popularity"
        });

        // // ------------------------------------------------
        // // All data
        // // ------------------------------------------------
        await buildDataTable(CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME);

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