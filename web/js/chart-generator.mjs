export function generateGenericBarChart(elem, {
    type = "line",
    labels,
    data = [],
    options = {},
})
{
    try
    {
        const config = {
            type,
            labels,
            data,
            options
        };

        return new Chart(
            elem,
            config
        );
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generateGenericPieChart(elem, {
    labels,
    datasets = [],
    options = {},
})
{
    try
    {
        const config = {
            plugins: [ChartDataLabels],
            type: "pie",
            labels,
            data: {
                labels,
                datasets
            },
            options
        };

        return new Chart(
            elem,
            config
        );
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
        const myChart = generateGenericBarChart(elem, {
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
    data = [],
    options = {},
    backgroundColor = "rgb(180,181,217)",
    borderColor = "rgb(76,87,134)",
} = {})
{
    try
    {
        return generateGenericBarChart(elem, {
            title,
            data,
            type: "bar",
            options,
            backgroundColor,
            borderColor
        });
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generatePieChart(elem, {
    title = "Pie Chart",
    labels,
    datasets = [],
    options = {},
    backgroundColor = [
        "rgb(180,181,217)", "rgb(208,180,217)", "rgb(180,217,211)", "rgb(192,217,180)",
        "rgb(217,204,180)", "rgb(217,189,180)", "rgb(217,180,180)", "rgb(217,180,216)",
        "rgb(217,180,194)", "rgb(180,217,217)", "rgb(192,217,180)", "rgb(217,212,180)", "rgb(180,181,217)",
    ],
    borderColor = "rgb(76,87,134)",
} = {})
{
    try
    {
        return generateGenericPieChart(elem, {
            title,
            datasets,
            labels,
            type: "pie",
            options,
            backgroundColor,
            borderColor
        });
    }
    catch (e)
    {
        console.error({lid: 2111}, e.message);
    }

    return null;

}

export function generateDataTables(elem, {data = []} = {})
{
    try
    {
        for (let i = 0; i < data.length; ++i)
        {
            const line = data[i];
            line.id = i;
        }

        const table = new Tabulator("#example-table", {
            height        : 320,
            persistence   : {
                sort   : true,
                filter : true,
                columns: true,
            },
            clipboard     : true,
            movableRows   : true,
            movableColumns: true,
            persistenceID : "examplePerststance",
            // layout            : "fitColumns",
            resizableColumnFit: true,
            data,
            autoColumns       : true,
            placeholder       : "Awaiting Data, Please Load File"
        });

        return table;
    }
    catch (e)
    {
        console.error({lid: 2143}, e.message);
    }

    return null;

}

export const getData = async function (endPoint)
{
    let result;
    try
    {
        const url = "./" + endPoint;
        const response = await fetch(url);
        result = await response.json();
    }
    catch (e)
    {
        console.error({lid: 2983}, e.message);
    }

    return result;
};


