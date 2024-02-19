import * as d3 from "d3";
import { useRef, useEffect } from "react";

export function LineChart({
  data,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 30,
  marginLeft = 40
}) {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Obtener las dimensiones del contenedor padre
    const parentWidth = svgRef.current.parentElement.clientWidth;
    const parentHeight = svgRef.current.parentElement.clientHeight;

    // Calcular la escala necesaria para adaptarse al contenedor
    const scaleX = parentWidth / width;
    const scaleY = parentHeight / height;

    const innerWidth = parentWidth - marginLeft * scaleX - marginRight * scaleX;
    const innerHeight = parentHeight - marginTop * scaleY - marginBottom * scaleY;

    const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain(d3.extent(data)).range([innerHeight, 0]);

    const line = d3.line().x((d, i) => x(i)).y(y);

    svg.attr("width", parentWidth).attr("height", parentHeight);

    svg.select(".x-axis").call(d3.axisBottom(x));
    svg.select(".y-axis").call(d3.axisLeft(y));

    svg
      .select(".line")
      .attr("stroke", "currentColor")
      .attr("stroke-width", "1.5")
      .attr("d", line(data));

    svg
      .select(".circles")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(d))
      .attr("r", "2.5");
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft]);

  return (
    <svg ref={svgRef} width="100%" height="100%">
      <g className="x-axis" transform={`translate(${marginLeft},${height - marginBottom})`} />
      <g className="y-axis" transform={`translate(${marginLeft},${marginTop})`} />
      <g className="content" transform={`translate(${marginLeft},${marginTop})`}>
        <path className="line" fill="none" />
        <g className="circles" fill="white" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
