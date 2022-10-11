import {generateBarChart, generateDataTables, generateLineChart} from "./chart-generator.mjs";



const init = () =>
{
    try
    {
        const $lineChart = document.getElementById("myChart1");
        const $barChart = document.getElementById("myChart2");

        const labels = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
        ];

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

        generateLineChart($lineChart, {title: "My First dataset", labels, data, options});
        generateBarChart($barChart, {title: "My Second dataset", labels, data, options});

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