import {generateLineChart} from "./chart-generator.mjs";


const init = () =>
{
    try
    {
        const elem = document.getElementById("myChart");

        const labels = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
        ];

        const data = [0, 10, 5, 2, 20, 30, 45];

        generateLineChart(elem, {labels, data});

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