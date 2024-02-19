import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function SunburstChart({ data }) {
  const chartRef = useRef();

  useEffect(() => {
    const { current: chartContainer } = chartRef;

    // Verificar si ya hay un SVG en el contenedor
    const existingSvg = d3.select(chartContainer).select("svg");

    // Si ya hay un SVG, no hagas nada
    if (existingSvg.size() > 0) {
      return;
    }

    const width = chartContainer.clientWidth;
    const height = width;
    const radius = width / 6;

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy);

    root.each(d => (d.current = d));

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");

    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", d => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
      .attr("pointer-events", d => (arcVisible(d.current) ? "auto" : "none"))
      .attr("d", d => arc(d.current));

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    chartContainer.appendChild(svg.node());

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function clicked(event, p) {
      // ... (resto del código de la función clicked)
    }

  }, [data]);

  return <div ref={chartRef}></div>;
}

export default SunburstChart;
