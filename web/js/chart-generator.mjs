

export function generateLineChart(elem, {labels, data = []})
{
    try
    {

        const dataChart = {
            labels: labels,
            datasets: [{
                label: "My First dataset",
                backgroundColor: "rgb(255, 99, 132)",
                borderColor: "rgb(255, 99, 132)",
                data: data,
            }]
        };

        const config = {
            type: "line",
            data: dataChart,
            options: {}
        };

        const myChart = new Chart(
            elem,
            config
        );

        myChart.update();

        return true;
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return false;

};