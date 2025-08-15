import {tz} from "./timezone.mjs";
import {SUB_DATA_DIR} from "./wa-constants.mjs";
import {generateWorldMapSVG} from "./world-map.mjs";


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
        console.error({lid: "WA2111"}, e.message);
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
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateGenericMapChartD3(elem, {
    labels = [],
    datasets = [],
    options = {}
}) {
    const width = options.width || 900;
    const height = options.height || 500;
    const scaleFactor = options.scaleFactor || 2;
    const fillColor = options.fillColor || "#3399ff";
    const borderColor = options.borderColor || "#003366";
    const fillOpacity = options.fillOpacity || 0.6;
    const maxRadius = options.maxRadius || 20;

    const timeZoneToCoords = tz; // your lat/lng mapping

    // Clear previous content
    elem.innerHTML = "";

    // Create SVG container
    const svg = d3.select(elem)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", options.backgroundColor || "#f5f5f5");

    const longitudes = labels
        .map(label => timeZoneToCoords[label]?.[1])
        .filter(lng => typeof lng === "number");

    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    const projection = d3.geoMercator()
        .center([avgLng, 0])
        .scale((width / 2 / Math.PI) * 1.3)
        .translate([width / 2, height / 1.5]);


    const path = d3.geoPath().projection(projection);

    svg.append("circle")
        .attr("cx", projection([139.6917, 35.6895])[0]) // Tokyo
        .attr("cy", projection([139.6917, 35.6895])[1])
        .attr("r", 4)
        .attr("fill", "red");

    // Load and render world map
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .then(world => {
            svg.append("g")
                .selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#e0e0e0")
                .attr("stroke", "#999")
                .attr("stroke-width", 0.5);

            // Plot data points
            labels.forEach((label, i) => {
                const coords = timeZoneToCoords[label];
                const value = parseFloat(datasets[i]);

                if (!coords || isNaN(value)) return;

                const [lng, lat] = [coords[1], coords[0]];
                const [x, y] = projection([lng, lat]);
                const radius = Math.min(value * scaleFactor, maxRadius);

                svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", radius)
                    .attr("fill", fillColor)
                    .attr("stroke", borderColor)
                    .attr("stroke-width", 1)
                    .attr("fill-opacity", fillOpacity)
                    .append("title")
                    .text(`${label}: ${value}%`);
            });
        })
        .catch(err => {
            console.error({ lid: "WA2113" }, err.message);
        });
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
        console.error({lid: "WA2111"}, e.message);
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
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateMapChart(elem, {
    title = "Map Chart",
    labels,
    datasets = [],
    options=  {
        scaleFactor: 1200,
        fillColor: "#3399ff",
        borderColor: "#003366"
    },
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
        return generateGenericMapChartD3(elem, {
            title,
            datasets,
            labels,
            options,
            backgroundColor,
            borderColor
        });
    }
    catch (e)
    {
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateDataTables(elemSelector, {data = []} = {})
{
    try
    {
        return new Tabulator(elemSelector, {
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


export const getPercentages = async function (endPoint, category) {
    try {
        const jsonData = await getData(endPoint);
        const data = [];
        const keys = Object.keys(jsonData);

        // First, we collect the resolutions
        for (let key of keys) {
            const item = jsonData[key];
            if (!item) {
                continue;
            }

            if (!item.extra) {
                continue;
            }

            if (!Object.keys(item.extra).length) {
                continue;
            }

            if (!item.extra[category]) {
                continue;
            }

            data.push(item.extra[category]);
        }

        // Second, we count the references
        const subSections = {};
        let count = 0;
        for (let i = 0; i < data.length; i++) {
            const key = data[i];
            subSections[key] = subSections[key] || 0;
            ++subSections[key];
            ++count;
        }

        // Then, we calculate the percentages
        const result = {};
        for (let key in subSections) {
            const nbOccurences = subSections[key];
            const percent = nbOccurences / count * 100;
            result[key] = percent.toFixed(2);
        }

        const labels = Object.keys(result);
        const percentages = Object.values(result);

        return {labels, percentages};
    }
    catch (e) {
        console.error({lid: 2985}, e.message);
    }
    return null;
};

