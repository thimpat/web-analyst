import {
    generateBarChart,
    generateDataTables,
    generateGenericChart,
    generatePieChart,
    getData
} from "./chart-generator.mjs";
import {CHART_DATA_FILES, VIEW_TYPE} from "./constants.mjs";
import {getWeekLabels, getYearLabels} from "./fixed-label-generator.mjs";

export const buildVisitorChart = async function (pathname, {
    $chart, style1, style2, title, subTitle
})
{
    try
    {
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
            // scales    : {
            //     x: {
            //         stacked: true,
            //     },
            //     y: {
            //         stacked: true
            //     }
            // }
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
        console.error({lid: "WA2437"}, e.message);
    }

    return false;
};

export const buildMoneyChart = async function (pathname, {
    view, $chart, style1, title, subTitle
})
{
    try
    {
        const jsonData = await getData(pathname);

        // Build datasets
        let {months, days} = jsonData;

        let labels, money;
        if (view === VIEW_TYPE.WEEK)
        {
            labels = getWeekLabels();
            money = days;
        }
        else if (view === VIEW_TYPE.YEAR)
        {
            labels = getYearLabels();
            money = months;
        }
        else
        {
            return false;
        }


        const datasets = [
            {
                label: "Earnings",
                data : money,
                ...style1,
            }
        ];

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

        generateGenericChart($chart, {
            type           : "line",
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

export const buildPopularityGraph = async function (pathname, {
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
        const {labels, percentages} = jsonData;
        if (!percentages)
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
                data       : percentages,
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
                    formatter: (value) =>
                    {
                        return value + "%";
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

export const buildVisitorGraph = async function (pathname, {$chart, title, subTitle})
{
    try
    {
        // Build DOM element
        await buildVisitorChart(pathname,
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
                title,
                subTitle
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2437}, e.message);
    }

    return false;
};

export const buildEarningsGraph = async function (pathname, {$chart, title, subTitle, view})
{
    try
    {
        // Build DOM element
        await buildMoneyChart(CHART_DATA_FILES.EARNING_DATA_FILENAME,
            {
                view,
                $chart,
                style1: {
                    backgroundColor: "rgb(180,181,217)",
                    borderColor    : "rgb(76,87,134)",
                },
                style2: {
                    backgroundColor: "rgb(188,217,180)",
                    borderColor    : "rgb(76,134,123)",
                },
                title,
                subTitle
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2437}, e.message);
    }

    return false;
};

export const buildDataTable = async function (pathname)
{
    try
    {
        // Data
        const dataTables = await getData(pathname);
        generateDataTables("#endpoint-table", {data: dataTables});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2449}, e.message);
    }

    return false;
};

