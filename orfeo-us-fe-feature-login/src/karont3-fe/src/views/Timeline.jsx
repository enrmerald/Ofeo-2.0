import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const Timeline = ({ name, data = [] }) => {
  const timelineRef = useRef();

  useEffect(() => {
    const { current: timelineContainer } = timelineRef;

    // Verificar si ya hay un SVG en el contenedor
    const existingSvg = d3.select(timelineContainer).select("svg");

    // Si ya hay un SVG, no hagas nada
    if (existingSvg.size() > 0) {
      return;
    }

    const parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S");

    const times = d3.extent(data.map((item) => parseDate(item.hit)));
    const range = [50, timelineContainer.clientWidth - 50];

    const scale = d3.scaleTime().domain(times).range(range);

    const svg = d3
      .select(timelineContainer)
      .append("svg")
      .attr("height", 200)
      .attr("width", "100%");

    const group = svg
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${scale(parseDate(d.hit))}, 0)`);

    group
      .append("circle")
      .attr("cy", 160)
      .attr("r", 5)
      .style("fill", "blue");

    group
      .append("text")
      .text((d) => `${d.hit} - ${d.name}`)
      .style("font-size", 10)
      .attr("y", 115)
      .attr("x", -95)
      .attr("transform", "rotate(-45)");
  }, [data]);

  return (
    <div className="timeline" ref={timelineRef}>
      <h1>{name}</h1>
    </div>
  );
};

export default Timeline;
