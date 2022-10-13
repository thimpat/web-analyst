import {MEANINGFUL_DATA_FILES} from "./constants.mjs";
import {generateBarChart, generateDataTables, generatePieChart, getData} from "./chart-generator.mjs";
import {getYearFilename} from "./common.mjs";


export const buildVisitorChart = async function (dataPath, {
    $chart, style1, style2, title, subTitle
})
{
    try
    {
        const jsonData = await getData(dataPath);

        // Build datasets
        const {dataVisitors, dataUniqueVisitors} = jsonData;

        const datasets = [
            {
                label          : "Visitors unique",
                data           : dataUniqueVisitors,
                ...style1,
            },
            {
                label          : "Visits",
                data           : dataVisitors,
                ...style2,
            },
        ];

        // Build labels
        const labels = jsonData.labels || [];

        const data = {labels, datasets};

        // Build DOM element
        const options1 = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : title
                }
            },
            scales    : {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            }
        };

        generateBarChart($chart, {
            title          : subTitle,
            data,
            options        : options1,
            backgroundColor: "rgb(180,181,217)",
            borderColor    : "rgb(76,87,134)",
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2437}, e.message);
    }

    return false;
};

export const buildVisitorDay = async function ()
{
    try
    {
        // Build DOM element
        const $chart = document.getElementById("visitorHours");

        await buildVisitorChart(MEANINGFUL_DATA_FILES.TODAY_DATA_FILENAME,
            {
                $chart,
                style1: {
                    backgroundColor: "rgb(180,181,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2: {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title: "Today",
                subTitle: "Visitor per hour"
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2437}, e.message);
    }

    return false;
};

export const buildVisitorsWeek = async function ()
{
    try
    {
        const $chart = document.getElementById("visitorsWeek");
        await buildVisitorChart(MEANINGFUL_DATA_FILES.WEEK_DATA_FILENAME,
            {
                $chart,
                style1: {
                    backgroundColor: "rgb(195,180,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2: {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title: "This week",
                subTitle: "Visitor per day"
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2439}, e.message);
    }

    return false;
};

export const buildVisitorsYear = async function ()
{
    try
    {
        const $chart = document.getElementById("visitorsYear");
        const yearFilename = getYearFilename();
        await buildVisitorChart(yearFilename,
            {
                $chart,
                style1: {
                    backgroundColor: "rgb(195,180,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2: {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title: "This year",
                subTitle: "Visitor per month"
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2441}, e.message);
    }

    return false;
};

export const buildBrowserPopularityPie = function ()
{
    try
    {
        const labelsBrowsers = [
            "Chrome",
            "Firefox",
            "Edge",
            "Internet Explorer",
            "Safari"
        ];

        const $chart = document.getElementById("browser");
        const options4 = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : "Browsers"
                }
            }
        };
        generatePieChart($chart, {
            title      : "Visitor per month", labels: labelsBrowsers, data, options: options4,
            borderColor: "transparent",
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2443}, e.message);
    }

    return false;
};

export const buildLanguagePie = function ()
{
    try
    {
        const labelsLanguages = [
            "en",
            "fr",
            "sp",
            "ru",
        ];

        const $chart = document.getElementById("languages");
        const options5 = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : "This year"
                }
            }
        };
        generatePieChart($chart, {
            title      : "Languages", labels: labelsLanguages, data, options: options5,
            borderColor: "transparent",
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2445}, e.message);
    }

    return false;
};

export const buildDataTable = async function ()
{
    try
    {
        // Data
        const dataTables = await getData(MEANINGFUL_DATA_FILES.HITS_DATA_FILENAME);

        //
        const table = generateDataTables("#example-table", {data: dataTables});

        const fieldEl = document.getElementById("filter-field");
        const typeEl = document.getElementById("filter-type");
        const valueEl = document.getElementById("filter-value");

        function customFilter(data)
        {
            return data.date;
        }

        function updateFilter()
        {
            const filterVal = fieldEl.options[fieldEl.selectedIndex].value;
            const typeVal = typeEl.options[typeEl.selectedIndex].value;

            const filter = filterVal === "function" ? customFilter : filterVal;

            if (filterVal === "function")
            {
                typeEl.disabled = true;
                valueEl.disabled = true;
            }
            else
            {
                typeEl.disabled = false;
                valueEl.disabled = false;
            }

            if (filterVal)
            {
                table.setFilter(filter, typeVal, valueEl.value);
            }
        }

        document.getElementById("filter-field").addEventListener("change", updateFilter);
        document.getElementById("filter-type").addEventListener("change", updateFilter);
        document.getElementById("filter-value").addEventListener("keyup", updateFilter);

        document.getElementById("filter-clear").addEventListener("click", function ()
        {
            fieldEl.value = "";
            typeEl.value = "=";
            valueEl.value = "";

            table.clearFilter();
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2449}, e.message);
    }

    return false;
};

