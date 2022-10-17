import {generateBarChart, generateDataTables, generatePieChart, getData} from "./chart-generator.mjs";
import {getYearFilename} from "./common.mjs";
import {CHART_DATA_FILES} from "./constants.mjs";

export const buildVisitorChart = async function (pathname, {
    $chart, style1, style2, title, subTitle
})
{
    try
    {
        // Chart.register(ChartDataLabels);

        const jsonData = await getData(pathname);

        // Build datasets
        const {dataVisitors, dataUniqueVisitors, labels} = jsonData;
        if (!dataVisitors || !dataUniqueVisitors)
        {
            console.error(`Missing data visitors`);
            return;
        }

        const datasets = [
            {
                label: "Visitors unique",
                data : dataUniqueVisitors,
                ...style1,
            },
            {
                label: "Visits",
                data : dataVisitors,
                ...style2,
            },
        ];

        if (!labels)
        {
            console.error(`Missing labels`);
            return;
        }

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

export const buildPopularityChart = async function (pathname, {
    $chart, style1 = {
        backgroundColor: [
            "rgb(180,181,217)", "rgb(208,180,217)", "rgb(180,217,211)", "rgb(192,217,180)",
            "rgb(121,152,176)", "rgb(185,168,133)",
            "rgb(217,204,180)", "rgb(217,189,180)", "rgb(217,180,180)", "rgb(217,180,216)",
            "rgb(217,180,194)", "rgb(180,217,217)", "rgb(192,217,180)", "rgb(217,212,180)", "rgb(180,181,217)",
        ],
    }, title, subTitle
})
{
    try
    {
        const jsonData = await getData(pathname);

        // Build datasets
        const {dataVisits, labels} = jsonData;
        if (!dataVisits)
        {
            console.error(`Missing data visitors`);
            return;
        }

        /**F
         *
         * @type {*[]}
         */
        const datasets = [
            {
                label      : "Visits",
                data       : dataVisits,
                hoverOffset: 4,
                ...style1,
            }
        ];

        if (!labels)
        {
            console.error(`Missing labels`);
            return;
        }

        // Build DOM element
        const options = {
            responsive: true,
            plugins   : {
                legend    : {
                    position: "top",
                },
                title     : {
                    display: true,
                    text   : title
                },
                datalabels: {
                    /**
                     * https://stackoverflow.com/questions/52044013/chartjs-datalabels-show-percentage-value-in-pie-piece
                     * @param value
                     * @param ctx
                     * @returns {string}
                     */
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        return (value * 100 / sum).toFixed(2) + "%";
                    },
                }
            }
        };

        generatePieChart($chart, {
            title          : subTitle,
            labels,
            datasets,
            options,
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

        await buildVisitorChart(CHART_DATA_FILES.TODAY_DATA_FILENAME,
            {
                $chart,
                style1  : {
                    backgroundColor: "rgb(180,181,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2  : {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title   : "Today",
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
        await buildVisitorChart(CHART_DATA_FILES.WEEK_DATA_FILENAME,
            {
                $chart,
                style1  : {
                    backgroundColor: "rgb(195,180,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2  : {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title   : "This week",
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
                style1  : {
                    backgroundColor: "rgb(195,180,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2  : {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title   : "This year",
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

export const buildBrowserPopularityPie = async function (chartPathname, {
    $chart,
    title   = "Browser popularity",
    subTitle = "Popularity"
} = {})
{
    try
    {
        // const yearFilename = getYearFilename();

        await buildPopularityChart(chartPathname,
            {
                $chart,
                title,
                subTitle
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
        const dataTables = await getData(CHART_DATA_FILES.HITS_DATA_FILENAME);

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

