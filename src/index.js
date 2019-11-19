"use strict";

import * as controls from "./controls.js";
import * as store from "./store.js";
import * as util from "./util.js";

const ROOT_ELEMENT_ID = "app";
const DATA_FILE_URL =
  "data/GBD_2017_death_rate_opioid_use_disorders_all_ages.csv";

// Initialize application state using default control options.
store.setState(controls.initialState);

// Get a handle to the root element, in which we'll build the application.
const appContainer = document.getElementById(ROOT_ELEMENT_ID);

// Create UI controls and add to the DOM.
controls.create(appContainer);

// Add visualization container to the DOM. Visualization should be created inside this container.
const vizContainer = util.createElementWithAttributes("main", {
  id: "viz",
  class: "viz"
});
appContainer.appendChild(vizContainer);

(async function main() {
  try {
    // const parsed = await util.loadCSVData(DATA_FILE_URL);
    console.log(store.setYear(2000));

    d3.csv(DATA_FILE_URL, data => {
      var valueLabelWidth = 40;
      var barHeight = 20;
      var barLabelWidth = 200;
      var barLabelPadding = 5;
      var gridLabelHeight = 18;
      var gridChartOffset = 3;
      var maxBarWidth = 800;

      var barLabel = d => {
        return d["location"] + "(" + d["sex"] + ", " + d["year"] + ")";
      };

      var barValue = d => {
        return parseFloat(d["mean"]);
      };

      var yScale = d3.scale
        .ordinal()
        .domain(d3.range(0, data.length))
        .rangeBands([0, data.length * barHeight]);

      var y = (d, i) => {
        return yScale(i);
      };

      var yText = (d, i) => {
        return y(d, i) + yScale.rangeBand() / 2;
      };

      var x = d3.scale
        .linear()
        .domain([0, d3.max(data, barValue) / 2])
        .range([0, maxBarWidth]);

      var chart = d3
        .select("#app")
        .append("svg")
        .attr("width", maxBarWidth + barLabelWidth + valueLabelWidth)
        .attr(
          "height",
          gridLabelHeight + gridChartOffset + data.length * barHeight
        );

      var gridContainer = chart
        .append("g")
        .attr(
          "transform",
          "translate(" + barLabelWidth + "," + gridLabelHeight + ")"
        );
      gridContainer
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("dy", -3)
        .attr("text-anchor", "middle")
        .text(String);
      // vertical grid lines
      gridContainer
        .selectAll("line")
        .data(x.ticks(10))
        .enter()
        .append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
        .style("stroke", "#ccc");
      // bar labels
      var labelsContainer = chart
        .append("g")
        .attr(
          "transform",
          "translate(" +
            (barLabelWidth - barLabelPadding) +
            "," +
            (gridLabelHeight + gridChartOffset) +
            ")"
        );
      labelsContainer
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("y", yText)
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "end")
        .text(barLabel)
        .style("font-style", "italic")
        .style("color", "#ccc");
      // bars
      var barsContainer = chart
        .append("g")
        .attr(
          "transform",
          "translate(" +
            barLabelWidth +
            "," +
            (gridLabelHeight + gridChartOffset) +
            ")"
        );
      barsContainer
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", y)
        .attr("height", yScale.rangeBand())
        .attr("width", d => {
          return x(barValue(d));
        })
        .attr("stroke", "white")
        .attr("fill", "#A020F0");

      // bar value(mean) labels
      barsContainer
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => {
          return x(barValue(d));
        })
        .attr("y", yText)
        .attr("dx", 5)
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "start") // text-align: right
        .attr("fill", "black")
        .attr("stroke", "none")
        .style("font-size", "0.8em")
        .text(d => {
          return d3.round(barValue(d), 2);
        });
      // start line
      barsContainer
        .append("line")
        .attr("y1", -gridChartOffset)
        .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
        .style("stroke", "#000")
        .style("shape-rendering", "crispEdges");
    });
  } catch (err) {
    // console.error(err);
    vizContainer.textContent = "Error loading data.";
  }
})();
