import {generateBarChart, generateDataTables, generateLineChart} from "./chart-generator.mjs";

const init = () =>
{
    try
    {
        const $lineChart = document.getElementById("myChart1");

        const options = {
            responsive: true,
            plugins   : {
                legend: {
                    position: "top",
                },
                title : {
                    display: true,
                    text   : "Chart.js Bar Chart"
                }
            }
        };

        const data = [0, 10, 5, 2, 20, 30, 45];

        // generateLineChart($lineChart, {title: "My First dataset", labels, data, options});

        // ------------------------------------------------
        // Visitor per day
        // ------------------------------------------------
        const labelHours = [];
        for (let i = 0; i < 24; ++i)
        {
            labelHours.push(i + "h");
        }

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
            }
        };
        generateBarChart($barChart1, {title: "Visitor per hour", labels: labelHours, data, options: options1});

        // ------------------------------------------------
        // Visitor per week
        // ------------------------------------------------
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
        generateBarChart($barChart2, {title: "Visitor per day", labels: labelWeek, data, options: options2});

        // ------------------------------------------------
        // Visitor per month
        // ------------------------------------------------
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
        generateBarChart($barChart3, {title: "Visitor per month", labels: labelsMonths, data, options: options3});

        // Data Tables
        generateDataTables();

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
        init();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2147}, e.message);
    }

    return false;

}());