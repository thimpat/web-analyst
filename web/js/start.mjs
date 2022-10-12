import {
    buildDataTable,
    buildVisitorDay,
    buildVisitorsYear,
    buildVisitorsWeek
} from "./elt-views.mjs";

const init = async () =>
{
    try
    {
        // generateLineChart($lineChart, {title: "My First dataset", labels, data, options});

        // ------------------------------------------------
        // Visitor per day
        // ------------------------------------------------
        await buildVisitorDay();

        // ------------------------------------------------
        // Visitor per week
        // ------------------------------------------------
        await buildVisitorsWeek();

        // ------------------------------------------------
        // Visitor per month
        // ------------------------------------------------
        await buildVisitorsYear();

        // // ------------------------------------------------
        // // Browsers
        // // ------------------------------------------------
        // buildBrowserPopularityPie();
        //
        // // ------------------------------------------------
        // // Language
        // // ------------------------------------------------
        // buildLanguagePie();

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