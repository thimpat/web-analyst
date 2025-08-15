export function generateWorldMapSVG({ width = 900, height = 500, fill = "#e0e0e0", stroke = "#999" } = {}) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.background = "#f5f5f5";

    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("id", "world-map");
    g.setAttribute("fill", fill);
    g.setAttribute("stroke", stroke);
    g.setAttribute("stroke-width", "0.5");

    // Minimal country shapes (simplified for performance)
    const paths = [
        // These are placeholder paths. Replace with real Mercator-projected paths.
        "M100,150 L120,160 L130,155 Z", // Example country
        "M200,180 L220,190 L210,185 Z", // Another country
        "M300,220 L320,230 L310,225 Z"  // And another
    ];

    paths.forEach(d => {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", d);
        g.appendChild(path);
    });

    svg.appendChild(g);
    return svg;
}