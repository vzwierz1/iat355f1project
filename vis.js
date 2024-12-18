/*
    POPULARITY OF F1
*/
function getPlot_RacetrackMap(width, height) {
    return Plot.plot({
        width: width,
        height: height,
        style: "color: #000",
        projection: ({ width, height }) => d3.geoMercator()
            .translate([width / 2 + 10, height / 2 + 70])
            .scale(135),
        marks: [
            Plot.graticule({ stroke: "#808080", strokeOpacity: 0.25 }),
            Plot.geo(geoCountries, { fill: '#7E7E7E', stroke: "#606060", strokeOpacity: 0.5 }),
            Plot.dot(data_F1Circuits, { x: "lng", y: "lat", r: 3, fill: "#ff4b33", symbol: "dot", tip: true, title: (datum) => `${datum.name}\n\nLocation: ${datum.location}\nCountry: ${datum.country}` }),
            Plot.sphere({ stroke: "#000", strokeOpacity: 0 })
        ]
    })
}

function getPlot_MostPopularSportsGlobal(width, height) {
    return Plot.plot({
        x: { percent: true },
        width: width,
        height: height,
        color: { scheme: "reds" },
        marks: [
            Plot.barX(data_MostPopularSportsGlobal, Plot.stackX({ x: "Estimated Viewers", fill: "Sport", fillOpacity: d => d["Sport"] == "Formula 1/Grand Prix racing" ? 0.9 : 0.3, inset: 0.5 })),
            Plot.textX(data_MostPopularSportsGlobal, Plot.stackX({ x: "Estimated Viewers", text: (d) => d["Estimated Viewers"] > 200000000 ? `${d["Sport"]}      ${d3.format(".2s")(d["Estimated Viewers"]).replace(/G/, "B")}` : '', inset: 0.5, rotate: -90, fontSize: 12 })),
            Plot.axisX({ ticks: [] }),
        ]
    })
}

function getPlot_MostPopularSportsGlobal_Filtered(width, height) {
    return Plot.plot({
        x: { percent: true },
        y: { axis: null },
        height: 360,
        width: 1100,
        color: { scheme: "reds" },
        marks: [
            Plot.barX(data_MostPopularSportsGlobal_Filtered, Plot.stackX({ x: "Estimated Viewers", fill: "Sport", fillOpacity: d => d["Sport"] == "Formula 1/Grand Prix racing" ? 0.9 : 0.3, inset: 0.5 })),
            Plot.textX(data_MostPopularSportsGlobal_Filtered, Plot.stackX({ x: "Estimated Viewers", text: (d) => `${d["Sport"]}      ${d3.format(".2s")(d["Estimated Viewers"])}`, inset: 0.5, rotate: -90, fontSize: 12 })),
            Plot.axisX({ ticks: [] }),
        ]
    })
}

function getPlot_MostPopularSportsGlobal_FilteredHighlighted(width, height) {
    return Plot.plot({
        x: { percent: true },
        x: { axis: null },
        y: { axis: null },
        height: 360,
        width: 1100,
        color: { scheme: "reds" },
        marks: [
            Plot.barX(data_MostPopularSportsGlobal_Filtered, Plot.stackX({ x: "Estimated Viewers", fill: "Sport", fillOpacity: (d) => (d["Sport"] == "Basketball" || d["Sport"] == "American football" || d["Sport"] == "Mixed Martial Arts (MMA)" || d["Sport"] == "Golf") ? 0.3 : (d["Sport"] == "Formula 1/Grand Prix racing" ? 0.9 : 0), inset: 0.5 })),
            Plot.textX(data_MostPopularSportsGlobal_Filtered, Plot.stackX({ x: "Estimated Viewers", text: (d) => `${d["Sport"]}      ${d3.format(".2s")(d["Estimated Viewers"])}`, inset: 0.5, rotate: -90, fontSize: 12 })),
            Plot.axisX({ ticks: [] })
        ]
    })
}

function getPlot_F1NascarComparison() {
    return Plot.plot({
        marginBottom: 40,
        x: { axis: null },
        fx: { tickFormat: "d" },
        y: { tickFormat: "s", grid: true },
        color: { scheme: "spectral", legend: true },
        marks: [
            Plot.barY(data_ViewershipF1Nascar, { fx: "Year", y: "Viewers", x: "Sport", fill: "Sport" }),
            Plot.ruleY([0]),
        ]
    })
}

function getPlot_F1NascarComparison_Delta() {
    const data_ViewershipF1Nascar_Delta = data_ViewershipF1Nascar.map((d, i, arr) => {
        let delta;
        if (i == 0 || i == 7) return null;
        else {
            delta = (-1 * (100 - (d.Viewers / arr[i - 1].Viewers) * 100)) * 0.01;
        }
        return { ...d, Delta: delta }
    }).filter(d => d !== null);

    return Plot.plot({
        marginLeft: 55,
        marginBottom: 110,
        label: null,
        fx: {
            axis: "bottom",
            tickPadding: 75,
        },
        color: {
            scheme: "PiYG",
            type: "ordinal"
        },
        marks: [
            Plot.barY(data_ViewershipF1Nascar_Delta, {
                fx: "Sport",
                y: "Delta",
                x: "Year",
                fill: (d) => d.Delta > 0,
            }),
            Plot.gridY({ stroke: "white", strokeOpacity: 0.31 }),
            Plot.text(data_ViewershipF1Nascar_Delta, {
                filter: (d) => d.Delta > 0,
                fx: "Sport",
                x: "Year",
                y: "Delta",
                text: ((f) => (d) => f(d.Delta))(d3.format("+.1%")),
                dy: -8
            }),
            Plot.text(data_ViewershipF1Nascar_Delta, {
                filter: (d) => d.Delta < 0,
                fx: "Sport",
                x: "Year",
                y: "Delta",
                text: ((f) => (d) => f(d.Delta))(d3.format("+.1%")),
                dy: 8
            }),
            Plot.axisX({ anchor: "bottom", tickFormat: "d", dy: 30 }),
            Plot.axisY({ anchor: "left", tickFormat: ".0%", dx: -20 }),
            Plot.ruleY([0]),
        ]
    });
}
