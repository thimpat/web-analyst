export function generateGenericChart(elem, {
    type = "line",
    title = "Line Chart",
    labels,
    data = [],
    options = {},
    backgroundColor = "rgb(255, 99, 132)",
    borderColor = "rgb(255, 99, 132)",

})
{
    try
    {
        const dataChart = {
            labels  : labels,
            datasets: [
                {
                    label: title,
                    backgroundColor,
                    borderColor,
                    data,
                }
            ]
        };

        const config = {
            type,
            data: dataChart,
            options
        };

        const myChart = new Chart(
            elem,
            config
        );

        return myChart;
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generateLineChart(elem, {
    title = "Line Chart",
    labels,
    data = [],
    options = {},
    backgroundColor = "rgb(125,169,117)",
    borderColor = "rgb(70,107,77)",
} = {})
{
    try
    {
        const myChart = generateGenericChart(elem, {
            title,
            data,
            labels,
            type: "line",
            options,
            backgroundColor,
            borderColor
        });

        return myChart;
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generateBarChart(elem, {
    title = "Line Chart",
    labels,
    data = [],
    options = {},
    backgroundColor = "rgb(180,181,217)",
    borderColor = "rgb(76,87,134)",
} = {})
{
    try
    {
        const myChart = generateGenericChart(elem, {
            title,
            data,
            labels,
            type: "bar",
            options,
            backgroundColor,
            borderColor
        });

        return myChart;
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generateDataTables()
{
    try
    {
        var table = new Tabulator("#example-table", {
            height:"311px",
            columns:[
                {title:"Name", field:"name"},
                {title:"Progress", field:"progress", sorter:"number"},
                {title:"Gender", field:"gender"},
                {title:"Rating", field:"rating"},
                {title:"Favourite Color", field:"col"},
                {title:"Date Of Birth", field:"dob", hozAlign:"center"},
            ],
        });
        return true;
    }
    catch (e)
    {
        console.error({lid: 2143}, e.message);
    }

    return false;

}
