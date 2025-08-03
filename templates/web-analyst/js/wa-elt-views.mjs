import {
    generateBarChart,
    generateDataTables,
    generateGenericChart,
    generatePieChart,
    getData
} from "./wa-chart-generator.mjs";
import {CHART_DATA_FILES, VIEW_TYPE} from "./wa-constants.mjs";
import {CHART_OPTIONS} from "./user-options.mjs";
import {getWeekLabels, getYearLabels} from "./wa-fixed-label-generator.mjs";

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

export const buildViewsUsersChart = async function (arr, {
    $chart, title, subTitle
})
{
    try
    {
        // Import data file
        const jsonData = {};
        for (let index in arr)
        {
            const pathname = arr[index];
            const data = await getData(pathname) || {};
            Object.assign(jsonData, data);
        }

        const datasets = [];
        // Build data by category
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Define a palette of colors for your datasets
        const colors = [
            "rgba(255, 99, 132, 0.7)",  // Red
            "rgba(54, 162, 235, 0.7)",  // Blue
            "rgba(255, 206, 86, 0.7)",  // Yellow
            "rgba(75, 192, 192, 0.7)",  // Green
            "rgba(153, 102, 255, 0.7)", // Purple
            "rgba(255, 159, 64, 0.7)",  // Orange
            "rgba(199, 199, 199, 0.7)", // Grey
            "rgba(120,73,73,0.7)",
        ];

        const categories = CHART_OPTIONS.PageViewsPerUsers.ranges || [2, 9, 10000];
        let start = categories[0];

        for (let index in categories)
        {
            const dataset = {};
            const limit = categories[index];
            const categoryIndex = parseInt(index);
            if (!categoryIndex) {
                dataset.label = `Number of users with less than ${limit} page views`;
            }
            else if (categoryIndex === categories.length - 1) {
                dataset.label = `Number of users with more than ${start} page views`;
            }
            else {
                dataset.label = `Number of users with ${start} to ${limit} page views`;
            }

            dataset.backgroundColor = colors[index];

            // Value of page views users every month per range
            dataset.data = Array(categories.length).fill(0);

            for (let m = 0; m < months.length; m++)
            {
                for (let userIPToken in jsonData)
                {
                    const info = jsonData[userIPToken];

                    const monthNumber = new Date(info.lastVisit || info.date || info.realDate || info.initialDate).getMonth();
                    if (m !== monthNumber)
                    {
                        continue;
                    }

                    if (info.visited <= limit)
                    {
                        dataset.data[m] = dataset.data[m] || [];
                        ++dataset.data[m];
                        delete jsonData[userIPToken];
                    }
                }

                start = limit + 1;
            }
            datasets.push(dataset);

        }

        const data = {
            labels: months,
            datasets
        };

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

export const buildViewsUsersGraph = async function (arr, {$chart, title, subTitle})
{
    try
    {
        // Build DOM element
        await buildViewsUsersChart(arr,
            {
                $chart,
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

export const buildDataTable = async function (pathname, selector)
{
    try
    {
        // Data
        const dataTables = await getData(pathname);
        generateDataTables(selector, {data: dataTables});

        return true;
    }
    catch (e)
    {
        console.error({lid: 2449}, e.message);
    }

    return false;
};

