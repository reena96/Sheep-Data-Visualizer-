function realTimeLineChart() {
  var lineArr;
  d3.selectAll("converge_lines").remove();
  var margin = {
      top: 20,
      right: 40,
      bottom: 20,
      left: 20
    },
    width = 200,
    height = 200,
    duration = 500,
    color = d3.schemeCategory10,
    halted = false;

  function chart(selection) {
    lineArr = [];
    if (halted) return;

    selection.each(function(data) {
      data = ["x", "y", "z"].map(function(c) {
        return {
          label: c,
          values: data.map(function(d) {
            return {
              time: +d.time,
              value: d[c]
            };
          })
        };
      });
      // console.log(data);

      var t = d3.transition().duration(duration).ease(d3.easeLinear),
        x = d3.scaleLinear().rangeRound([0, width - margin.left - margin.right]),
        y = d3.scaleLinear().rangeRound([height - margin.top - margin.bottom, 0]),
        z = d3.scaleOrdinal(color);

      var xMin = d3.min(data, function(c) {
        return d3.min(c.values, function(d) {
          return d.time;
        })
      });
      var xMax = d3.max(data, function(c) {
        return d3.max(c.values, function(d) {
          return d.time;
        })
      });
      // var xMax =d3.max(data, function(c) { return d3.min(c.values, function(d) { return d.time; })});
      // console.log(xMax);
      x.domain([xMin, xMax]);
      y.domain([
        -15,
        15
      ]);
      z.domain(data.map(function(c) {
        return c.label;
      }));

      //lineArr=[];
      var line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d) {
          return x(d.time);
        })
        .y(function(d) {
          if (d.value[0] >= d.value[1] && d.value[1] >= d.value[2]) {} else {
            appendToLineArr(d.time);
          }
          return y(d.value);
        });
      // console.log(data.length);
      // console.log(lineArr.length);

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");

      gEnter.append("g").attr("class", "axis x");
      gEnter.append("g").attr("class", "axis y");
      gEnter.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom);
      gEnter.append("g")
        .attr("class", "lines")
        .attr("clip-path", "url(#clip)")
        .selectAll(".data").data(data).enter()
        .append("path")
        .attr("class", "data");

      // console.log(lineArr);
      var con_line_g = gEnter.append("g");
      var con_line = con_line_g.selectAll("line")
        .data([lineArr])
        .enter()
        .append("line");

      con_line
        .style("stroke", "red")
        .attr("x1", function(d) {
          return d;
        }) // x position of the first end of the line
        .attr("y1", y(15)) // y position of the first end of the line
        .attr("x2", function(d) {
          return d
        }) // x position of the second end of the line
        .attr("y2", y(-15));


      var legendEnter = gEnter.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(450,-30)");
      legendEnter.append("rect")
        .attr("width", 50)
        .attr("height", 75)
        .attr("fill", "#ffffff")
        .attr("fill-opacity", 0.7);
      legendEnter.selectAll("text")
        .data(data).enter()
        .append("text")
        .attr("y", function(d, i) {
          return (i * 20) + 25;
        })
        .attr("x", 5)
        .attr("fill", function(d) {
          return z(d.label);
        });

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height);
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      g.select("g.axis.x")
        .attr("transform", "translate(0," + (height - margin.bottom - margin.top) + ")")
        .transition(t)
        .call(d3.axisBottom(x).ticks(5));
      g.select("g.axis.y")
        .transition(t)
        .attr("class", "axis y")
        .call(d3.axisLeft(y));

      g.select("defs clipPath rect")
        .transition(t)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.right);

      g.selectAll("g path.data")
        .data(data)
        .style("stroke", function(d) {
          return z(d.label);
        })
        .style("stroke-width", 1)
        .style("fill", "none")
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .on("start", tick);

      g.selectAll("g .legend text")
        .data(data)
        .text(function(d) {
          return d.label.toUpperCase() + ": " + d.values[d.values.length - 1].value;
        });

      // For transitions https://bl.ocks.org/mbostock/1642874
      function tick() {
        if (halted) return;
        d3.select(this)
          .attr("d", function(d) {
            return line(d.values);
          })
          .attr("transform", null);

        var xMinLess = xMin;
        d3.active(this)
          .attr("transform", "translate(" + x(xMinLess) + ",0)")
          .transition()
          .on("start", tick);
      }
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  // halt
  chart.halt = function(_) {
    if (arguments.length == 0) return halted;
    halted = _;
    return chart;
  }

  function appendToLineArr(value) {
    //console.log(lineArr);
    lineArr.push(value);
    // sleep(100).then(() => {});
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return chart;
}