import {
    buildVisitorGraph,
    buildPopularityGraph, buildDataTable, buildEarningsGraph, buildViewsUsersGraph
} from "./wa-elt-views.mjs";
import {CHART_DATA_FILES, LIST_DATA_FILES, VIEW_TYPE} from "./wa-constants.mjs";
import {CONFIG} from "../../config.mjs";


const init = async () => {
    try {
        // ------------------------------------------------
        // Visitors: day / Week / Months
        // ------------------------------------------------
        await buildVisitorGraph(CHART_DATA_FILES.TODAY_DATA_FILENAME, {
            $chart: document.getElementById("visitorHours"),
            title: "Today",
            subTitle: "Visitor per hour"
        });

        await buildVisitorGraph(CHART_DATA_FILES.WEEK_DATA_FILENAME, {
            $chart: document.getElementById("visitorsWeek"),
            title: "This week",
            subTitle: "Visitor per day"
        });

        await buildVisitorGraph(CHART_DATA_FILES.YEAR_DATA_FILENAME, {
            $chart: document.getElementById("visitorsYear"),
            title: "This year",
            subTitle: "Visitor per month"
        });

        // ------------------------------------------------
        // Views per users
        // ------------------------------------------------
        await buildViewsUsersGraph([LIST_DATA_FILES.IPS_REFS, LIST_DATA_FILES.TOKENS], {
            $chart: document.getElementById("ViewsUsersGraph"),
            title: "Views per users",
            subTitle: "Views per users"
        });

        // ------------------------------------------------
        // Popularity: Browsers / OS / Languages
        // ------------------------------------------------
        await buildPopularityGraph(CHART_DATA_FILES.BROWSERS_DATA_FILENAME, {
            $chart: document.getElementById("browsers"),
            title: "Browser popularity"
        });

        await buildPopularityGraph(CHART_DATA_FILES.OSES_DATA_FILENAME, {
            $chart: document.getElementById("oses"),
            title: "OS popularity"
        });

        await buildPopularityGraph(CHART_DATA_FILES.LANGUAGES_DATA_FILENAME, {
            $chart: document.getElementById("languages"),
            title: "Language popularity"
        });

        // ------------------------------------------------
        // Endpoint frequencies
        // ------------------------------------------------
        await buildDataTable(CHART_DATA_FILES.ENDPOINTS_DATA_FILENAME, "#endpoint-table");
        await buildDataTable(CHART_DATA_FILES.REFERRERS_DATA_FILENAME, "#referrer-table");

        // ------------------------------------------------
        // Earnings
        // ------------------------------------------------
        if (CONFIG.HIDE_EARNING_CHARTS)
        {
            document.getElementById("earning-days").classList.add("hidden");
            document.getElementById("earning-months").classList.add("hidden");
        }
        else
        {
            await buildEarningsGraph(CHART_DATA_FILES.EARNING_DATA_FILENAME, {
                view: VIEW_TYPE.WEEK,
                $chart: document.getElementById("money-day"),
                title: "This week",
                subTitle: "Earning per day"
            });

            await buildEarningsGraph(CHART_DATA_FILES.EARNING_DATA_FILENAME, {
                view: VIEW_TYPE.YEAR,
                $chart: document.getElementById("money-month"),
                title: "This year",
                subTitle: "Earning per month"
            });
        }

        return true;
    } catch (e) {
        console.error({lid: "WA2153"}, e.message);
    }

    return false;

};

(async function () {
    try {
        await init();

        return true;
    } catch (e) {
        console.error({lid: "WA2147"}, e.message);
    }

    return false;
}());