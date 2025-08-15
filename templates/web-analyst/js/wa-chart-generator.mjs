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

function getContinentForLabel(label, continents, timeZoneToCoords) {
    const coords = timeZoneToCoords[label];
    if (!coords) return null;

    const point = {
        type: "Point",
        coordinates: [coords[1], coords[0]] // [lng, lat]
    };

    for (const feature of continents.features) {
        if (d3.geoContains(feature, point)) {
            return feature.properties.CONTINENT;
        }
    }

    return null;
}

export function generateGenericMapChartD3(elem, {
    labels = [],
    datasets = [],
    options = {
        useFixedRadius: false,
        fixedRadius: 8,
        scaleFactor: 2,
    maxRadius: 20,
    backgroundColor: "#f5f5f5",
    width: 900,
    height: 500
    }
}) {
  // Destructure chart dimensions and styling
            const chartWidth = options.width;
            const chartHeight = options.height;
            const backgroundColor = options.backgroundColor;
            const useFixedRadius = options.useFixedRadius;
            const fixedRadius = options.fixedRadius;
            const scaleFactor = options.scaleFactor;
            const maxRadius = options.maxRadius;
  const timeZoneToCoords = tz;

  // Clear any existing content
    elem.innerHTML = "";

  // Create SVG container
    const svg = d3.select(elem)
        .append("svg")
        .attr("width", "100%")
      .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background", backgroundColor);

  // Prepare defs for gradients, filters, etc.
  const defs = svg.append("defs");

  // Parse numeric values and build color scale
  const numericValues = datasets
    .map(v => parseFloat(v))
    .filter(v => !isNaN(v));

    const colorScale = d3.scaleSequential()
                .domain([d3.min(numericValues), d3.max(numericValues)])
        .interpolator(d3.interpolateYlOrRd);

  // Add Fixed-Radius toggle
  const controlsContainer = d3.select(elem)
        .append("div")
        .style("margin", "10px 0");

  controlsContainer.append("label")
        .text("Fixed Radius ")
        .append("input")
        .attr("type", "checkbox")
      .property("checked", useFixedRadius)
      .on("change", function() {
            options.useFixedRadius = this.checked;
            generateGenericMapChartD3(elem, { labels, datasets, options });
        });

            // Define a hardcoded color map for continents
            const continentColorMap = {
                "Africa": "#9bb6bc",      // Blueish
                "Asia": "#94c8a1",        // Greenish
                "Europe": "#9e88c6",      // Purple-ish
                "Oceania": "#d3b797",     // Orange-ish
                "North America": "#87a8dc",
                "South America": "#87a8dc",
                "Antarctica": "#e0e0e0",    // Light gray
            };

  // Load world map and continent shapes in parallel
    Promise.all([
        d3.json("web-analyst/json/world.geojson"),
        d3.json("web-analyst/json/continents.json")
    ])
  .then(([worldTopology, continentTopology]) => {
    // Set up projection and path generator
                    const projection = d3.geoMercator();
                    const pathGenerator = d3.geoPath().projection(projection);

    // Build a FeatureCollection of all data points to fit extent
    const pointFeatures = labels
      .map(label => timeZoneToCoords[label])
      .filter(coord => coord)
      .map(([lat, lng]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] }
      }));

    projection.fitExtent(
      [[20, 20], [chartWidth - 20, chartHeight - 20]],
      { type: "FeatureCollection", features: pointFeatures }
    );

                    // Draw colored continents using the new color map
            svg.append("g")
                .selectAll("path")
      .data(continentTopology.features)
                .enter()
                .append("path")
        .attr("d", pathGenerator)
                        .attr("fill", d => continentColorMap[d.properties.CONTINENT] || "#e0e0e0")
                .attr("stroke", "#999")
                .attr("stroke-width", 0.5);

    // Optionally overlay country borders
        svg.append("g")
            .selectAll("path")
      .data(worldTopology.features)
            .enter()
            .append("path")
        .attr("d", pathGenerator)
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 0.3);

    // Draw and animate data circles
    labels.forEach((label, idx) => {
                        const coord = timeZoneToCoords[label];
                        const rawValue = parseFloat(datasets[idx]);
      if (!coord || isNaN(rawValue)) return;

                        const [xPos, yPos] = projection([coord[1], coord[0]]);
                        const fillColor = colorScale(rawValue);
                        const computedRadius = useFixedRadius
        ? fixedRadius
        : Math.min(rawValue * scaleFactor, maxRadius);

      const dataCircle = svg.append("circle")
        .attr("cx", xPos)
        .attr("cy", yPos)
                    .attr("r", 0)
        .attr("fill", fillColor)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.5)
                    .attr("fill-opacity", 0.8);

      dataCircle.append("title")
        .text(`${label}: ${rawValue}%`);

      dataCircle.transition()
                    .duration(800)
                    .ease(d3.easeElastic)
        .attr("r", computedRadius);

      if (rawValue > d3.max(numericValues) * 0.2) {
        pulse(dataCircle, computedRadius);
                }
            });

    // Build heatmap legend
    const legendWidth  = 200;
            const legendHeight = 10;
    const legendGroup  = svg.append("g")
      .attr("transform", `translate(${chartWidth - legendWidth - 20}, ${chartHeight - 40})`);

            const legendScale = d3.scaleLinear()
                .domain(colorScale.domain())
                .range([0, legendWidth]);

            const legendAxis = d3.axisBottom(legendScale)
                .ticks(5)
                .tickFormat(d => `${d}%`);

    const gradientId = "heatmapLegendGradient";
            defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("x1", "0%")
                .attr("x2", "100%")
                .selectAll("stop")
                .data(d3.range(0, 1.01, 0.01))
                .enter()
                .append("stop")
                .attr("offset", d => `${d * 100}%`)
        .attr("stop-color", d => colorScale(
          colorScale.domain()[0] +
          d * (colorScale.domain()[1] - colorScale.domain()[0])
        ));

    legendGroup.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", `url(#${gradientId})`);

    legendGroup.append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxis);
        })
        .catch(err => {
    console.error({ lid: "WA2113" }, err);
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


export const getPercentages = async function (endPoint, category, filter = []) {
    try {
        const jsonData = await getData(endPoint);
        const data = [];
        const keys = Object.keys(jsonData);

        // First, we collect the UID
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

            const str = item.extra[category];
            if (filter.includes(str)) {
                continue;
            }

            data.push(str);
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

