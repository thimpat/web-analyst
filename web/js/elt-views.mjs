import {MEANINGFUL_DATA_FILES} from "./constants.mjs";
import {generateBarChart, generateDataTables, generatePieChart, getData} from "./chart-generator.mjs";


export const buildVisitorDay = function ()
{
    try
    {
        // Build datasets
        const data1 = [0, 10, 5, 2, 20, 30, 45];
        const data2 = [10, 5, 2, 20, 30, 45, 50];

        const datasets = [
            {
                label          : "Visitors unique",
                backgroundColor: "rgb(180,181,217)",
                borderColor    : "rgb(76,87,134)",
                data           : data1,
            },
            {
                label          : "Visits",
                backgroundColor: "rgb(188,217,180)",
                borderColor    : "rgb(76,134,123)",
                data           : data2,
            },
        ];

        // Build labels
        const labels = [];
        for (let i = 0; i < 24; ++i)
        {
            labels.push(i + "h");
        }

        const data = {labels, datasets};

        // Build DOM element
        const $barChart1 = document.getElementById("visitorHours");
        const options1 = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : "Today"
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

        generateBarChart($barChart1, {
            title          : "Visitor per hour",
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

export const buildVisitorWeek = function ()
{
    try
    {
        const labelWeek = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];

        const $barChart2 = document.getElementById("visitorsWeek");
        const options2 = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : "This week"
                }
            }
        };
        generateBarChart($barChart2, {
            title          : "Visitor per day", labels: labelWeek, data, options: options2,
            backgroundColor: "rgb(195,180,217)",
            borderColor    : "rgb(76,87,134)",
        });

        return true;
    }
    catch (e)
    {
        console.error({lid: 2439}, e.message);
    }

    return false;
};

export const buildVisitorsYear = function ()
{
    try
    {
        const labelsMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const $barChart3 = document.getElementById("visitorsYear");
        const options3 = {
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
        generateBarChart($barChart3, {
            title          : "Visitor per month", labels: labelsMonths, data, options: options3,
            backgroundColor: "rgb(217,190,180)",
            borderColor    : "rgb(76,87,134)",
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

        const $barChart4 = document.getElementById("browser");
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
        generatePieChart($barChart4, {
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

        const $barChart5 = document.getElementById("languages");
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
        generatePieChart($barChart5, {
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
        const dataTables = await getData(MEANINGFUL_DATA_FILES.HITS_DATA_PATH);

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

            const filter = filterVal == "function" ? customFilter : filterVal;

            if (filterVal == "function")
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

