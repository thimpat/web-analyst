import {tz} from "./timezone.mjs";
import {SUB_DATA_DIR} from "./wa-constants.mjs";

function pulse(selection, baseRadius) {
    (function repeat() {
        selection.transition()
            .duration(1000)
            .attr("r", baseRadius * 1.1)
            .transition()
            .duration(1000)
            .attr("r", baseRadius)
            .on("end", repeat);
    })();
}

export function generateGenericChart(elem, {
    type = "bar",
    labels,
    data = [],
    options = {},
}) {
    try {
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
    } catch (e) {
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateGenericPieChart(elem, {
    labels,
    datasets = [],
    options = {},
}) {
    try {
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
    } catch (e) {
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateGenericMapChartD3(elem, {
    labels = [],
    datasets = [],
    options = {
        useFixedRadius: false,
        fillColor: "#3399ff",
        borderColor: "#003366",
        fixedRadius: 8,
        backgroundColor: "#fff",
        scaleFactor: 2,
        maxRadius: 20
    }
}) {
    const width = options.width || 900;
    const height = options.height || 500;
    const scaleFactor = options.scaleFactor || 2;
    const maxRadius = options.maxRadius || 20;
    const backgroundColor = options.backgroundColor || "#f5f5f5";

    const timeZoneToCoords = tz;

    elem.innerHTML = "";

    // Create SVG container
    const svg = d3.select(elem)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", backgroundColor);

// Define color scale based on dataset values
    const values = datasets.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const colorScale = d3.scaleSequential()
        .domain([d3.min(values), d3.max(values)])
        .interpolator(d3.interpolateYlOrRd);

    // Optional: define glow filter
    const defs = svg.append("defs");
    defs.append("filter")
        .attr("id", "glow")
        .append("feGaussianBlur")
        .attr("stdDeviation", 6)
        .attr("result", "coloredBlur");


    defs.append("filter")
        .attr("id", "glowMerge")
        .html(`
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        `);

    const longitudes = labels
        .map(label => timeZoneToCoords[label]?.[1])
        .filter(lng => typeof lng === "number");

    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    const projection = d3.geoMercator()
        .center([avgLng, 0])
        .scale((width / 2 / Math.PI) * 1.3)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const controls = d3.select(elem)
        .append("div")
        .style("margin", "10px 0");

    controls.append("label")
        .text("Fixed Radius ")
        .append("input")
        .attr("type", "checkbox")
        .property("checked", options.useFixedRadius)
        .on("change", function () {
            options.useFixedRadius = this.checked;
            generateGenericMapChartD3(elem, {labels, datasets, options});
        });

    // controls.append("label")
    //     .text("Enable Glow ")
    //     .style("margin-left", "20px")
    //     .append("input")
    //     .attr("type", "checkbox")
    //     .property("checked", options.enableGlow || false)
    //     .on("change", function () {
    //         options.enableGlow = this.checked;
    //         generateGenericMapChartD3(elem, { labels, datasets, options });
    //     });

    // Load and render world map
    d3.json("web-analyst/json/world.geojson")
        .then(world => {


            const geoPoints = labels
                .map(label => timeZoneToCoords[label])
                .filter(coords => coords)
                .map(([lat, lng]) => ({type: "Point", coordinates: [lng, lat]}));

            const featureCollection = {
                type: "FeatureCollection",
                features: geoPoints.map(pt => ({type: "Feature", geometry: pt}))
            };

            projection.fitExtent([[20, 20], [width - 20, height - 20]], featureCollection);


            svg.append("g")
                .selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#e0e0e0")
                .attr("stroke", "#999")
                .attr("stroke-width", 0.5);

            // Plot data points with heatmap styling
            labels.forEach((label, i) => {
                const coords = timeZoneToCoords[label];
                const value = parseFloat(datasets[i]);
                if (!coords || isNaN(value)) return;

                const [lng, lat] = [coords[1], coords[0]];
                const [x, y] = projection([lng, lat]);
                const color = colorScale(value);

                const radius = options.useFixedRadius
                    ? options.fixedRadius || 6
                    : Math.min(value * scaleFactor, maxRadius);

                const applyGlow = options.enableGlow && value > d3.max(values) * 0.8;

                const circle = svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", radius)
                    .attr("fill", color)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.5)
                    .attr("fill-opacity", 0.8)
                    // .attr("filter", applyGlow ? "url(#glowMerge)" : null)
                    .text(`${label}: ${value}%`);

                circle.append("title")
                    .text(`${label}: ${value}%`);

                circle.transition()
                    .duration(800)
                    .ease(d3.easeElastic)
                    .attr("r", radius);

                if (value > d3.max(values) * 0.2) {
                    pulse(circle, radius);
                }
            });


            // Add legend
            const legendWidth = 200;
            const legendHeight = 10;
            const legendSvg = svg.append("g")
                .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

            const legendScale = d3.scaleLinear()
                .domain(colorScale.domain())
                .range([0, legendWidth]);

            const legendAxis = d3.axisBottom(legendScale)
                .ticks(5)
                .tickFormat(d => `${d}%`);

            const gradientId = "legendGradient";
            defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("x1", "0%")
                .attr("x2", "100%")
                .selectAll("stop")
                .data(d3.range(0, 1.01, 0.01))
                .enter()
                .append("stop")
                .attr("offset", d => `${d * 100}%`)
                .attr("stop-color", d => colorScale(colorScale.domain()[0] + d * (colorScale.domain()[1] - colorScale.domain()[0])));

            legendSvg.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", `url(#${gradientId})`);

            legendSvg.append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxis);
        })
        .catch(err => {
            console.error({lid: "WA2113"}, err.message);
        });
}

export function generateBarChart(elem, {
    type = "bar",
    title = "Line Chart",
    data = [],
    options = {},
    backgroundColor = "rgb(180,181,217)",
    borderColor = "rgb(76,87,134)",
} = {}) {
    try {
        return generateGenericChart(elem, {
            type,
            title,
            data,
            options,
            backgroundColor,
            borderColor
        });
    } catch (e) {
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
} = {}) {
    try {
        return generateGenericPieChart(elem, {
            title,
            datasets,
            labels,
            type: "pie",
            options,
            backgroundColor,
            borderColor
        });
    } catch (e) {
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateMapChart(elem, {
    title = "Map Chart",
    labels,
    datasets = [],
    options = undefined,
    backgroundColor = [
        "rgb(180,181,217)", "rgb(208,180,217)", "rgb(180,217,211)", "rgb(192,217,180)",
        "rgb(217,204,180)", "rgb(217,189,180)", "rgb(217,180,180)", "rgb(217,180,216)",
        "rgb(217,180,194)", "rgb(180,217,217)", "rgb(192,217,180)", "rgb(217,212,180)", "rgb(180,181,217)",
    ],
    borderColor = "rgb(76,87,134)",
} = {}) {
    try {
        return generateGenericMapChartD3(elem, {
            title,
            datasets,
            labels,
            options,
            backgroundColor,
            borderColor
        });
    } catch (e) {
        console.error({lid: "WA2111"}, e.message);
    }

    return null;

}

export function generateDataTables(elemSelector, {data = []} = {}) {
    try {
        return new Tabulator(elemSelector, {
            height: 320,
            persistence: {
                sort: true,
                columns: true,
            },
            clipboard: true,
            columnMinWidth: 80,
            movableRows: true,
            movableColumns: true,
            persistenceID: "examplePerststance",
            layout: "fitDataFill",
            resizableColumnFit: true,
            data,
            autoColumns: true,
            placeholder: "Awaiting Data, Please Load File"
        });
    } catch (e) {
        console.error({lid: 2143}, e.message);
    }

    return null;

}

/**
 * Fetch data from datadir
 * @param endPoint
 * @returns {Promise<*>}
 */
export const getData = async function (endPoint) {
    let result;
    try {
        const url = "./" + SUB_DATA_DIR + "/" + endPoint;
        const response = await fetch(url);
        result = await response.json();
    } catch (e) {
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
    } catch (e) {
        console.error({lid: 2985}, e.message);
    }
    return null;
};

