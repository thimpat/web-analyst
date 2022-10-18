import {SUB_DATA_DIR} from "./constants.mjs";

export function generateGenericChart(elem, {
    type = "bar",
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
            type   : "pie",
            labels,
            data   : {
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

export function generateBarChart(elem, {
    type = "bar",
    title = "Line Chart",
    data = [],
    options = {},
    backgroundColor = "rgb(180,181,217)",
    borderColor = "rgb(76,87,134)",
} = {})
{
    try
    {
        return generateGenericChart(elem, {
            type,
            title,
            data,
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
        return new Tabulator("#endpoint-table", {
            height            : 320,
            persistence       : {
                sort   : true,
                columns: true,
            },
            clipboard         : true,
            columnMinWidth    : 80,
            movableRows       : true,
            movableColumns    : true,
            persistenceID     : "examplePerststance",
            layout            : "fitDataFill",
            resizableColumnFit: true,
            data,
            autoColumns       : true,
            placeholder       : "Awaiting Data, Please Load File"
        });
    }
    catch (e)
    {
        console.error({lid: 2143}, e.message);
    }

    return null;

}

/**
 * Fetch data from datadir
 * @param endPoint
 * @returns {Promise<*>}
 */
export const getData = async function (endPoint)
{
    let result;
    try
    {
        const url = "./" + SUB_DATA_DIR + "/" + endPoint;
        const response = await fetch(url);
        result = await response.json();
    }
    catch (e)
    {
        console.error({lid: 2983}, e.message);
    }

    return result;
};


