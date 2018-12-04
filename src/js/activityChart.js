"use strict";
var c = 0;
var act_width = d3.select('#viewDiv').node().clientWidth;
var chart = realTimeChartMulti()
  // .title("Time Series Activity Chart")
  .yTitle("Sheep Activity")
  .xTitle("Time")
  .yDomain(["Sheep ID2", "Sheep ID3"]) // initial y domain (note array)
  .border(true)
  .width(act_width)
  .height(250);

// invoke the chart
var chartDiv = d3v3.select("#viewDiv").append("div")
  .attr("id", "chartDiv")
  .call(chart);

// alternative and equivalent invocation
//chart(chartDiv);

// event handler for debug checkbox
d3v3.select("#debug").on("change", function() {
  var state = d3v3.select(this).property("checked")
  chart.debug(state);
})

// event handler for halt checkbox
d3v3.select("#halt").on("change", function() {
  var state = d3v3.select(this).property("checked")
  chart.halt(state);
})


// configure the data generator

// mean and deviation for generation of time intervals
var tX = 5; // time constant, multiple of one second
var meanMs = 1000 * tX, // milliseconds
  dev = 200 * tX; // std dev

// define time scale
var timeScale = d3v3.scale.linear()
  .domain([300 * tX, 1700 * tX])
  .range([300 * tX, 1700 * tX])
  .clamp(true);

// define function that returns normally distributed random numbers
var normal = d3v3.random.normal(meanMs, dev);

// define color scale
var color = d3v3.scale.category10();

// in a normal use case, real time data would arrive through the network or some other mechanism
var d = -1;
var shapes = ["rect", "circle"];
var timeout = 0;


d3.queue()
  .defer(d3v3.csv, "data/mergedc2.csv")
  .defer(d3v3.csv, "data/mergedc3.csv")

  .await(analyze);

function analyze(error, data1, data2) {
  if (error) {
    console.log(error);
  }

  // define data generator
  function dataGenerator() {

    var index1 = data1.length;
    var index2 = data2.length;
    // console.log("data***************");
    // console.log(data1);
    // console.log(data2);
    for (let idx = 4610; idx < data1.length; idx++) {
      // output a sample for each category, each interval (five seconds)
      // chart.yDomain().forEach(function (cat, i) {

      if (idx <= index1) {
        createSample(data1, idx, chart, 2);
      }
      if (idx <= index2) {
        createSample(data2, idx, chart, 3);
      }

    };

  }

  function createSample(data, index, chart, actor) {

    // console.log(data[index]);
    // create randomized timestamp for this category data item
    if (data[index] != null) {
      var start_time = Number(data[index].TIME);
      // console.log(start_time*1000);
      // var end_time = Number(data[index].end_time);
      var now = new Date(start_time * 1000);
      var action = data[index].activity + "";
      var color = "";
      // var diff = end_time - start_time;
      var j = 0;
      // do {
      switch (action) {
        case "stand up":
          color = "#068b0c"; // dark green
          break;
        case "stand down":
          color = "#04f10e"; // light green
          break;
        case "walk up":
          color = "#1B07AD"; // dark blue
          break;
        case "walk down":
          color = "#04B5FC"; // light blue
          break;
        case "ramble up":
          color = "#FC04E9"; // dark pink
          break;
        case "ramble down":
          color = "#FFB6C1"; // light pink
          break;
        case "trot":
          color = "#cc6600"; // brown
          break;
        case "canter_right lead":
          color = "FCDE04"; // dark yellow
          break;
        case "canter_left lead":
          color = "#FFFF99"; // Light yellow
          break;
        case "canter_unk":
          color = "#cc0000"; // red
          break;
        default:
          color = "black";
          break;
      }
      // var i = 1;
      // if (data[index].actor == "ID0") {
      //     console.log(i);
      //     i = 2;
      // }
      // now = new Date(start_time + j); //add "j" seconds to each start time, where "j" is a multiple of 1000
      // create new data item
      var obj;
      obj = {
        // complex data item; four attributes (type, color, opacity and size) are changing dynamically with each iteration (as an example)
        time: now,
        color: color,
        opacity: 1,
        category: "Sheep ID" + actor,
        //type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
        type: "rect",
        size: 30,
      };
      // console.log("$$$$$$$$$$$$$$$$$$4");
      // console.log(obj);
      // send the datum to the chart
      chart.datum(obj);
      // j = j + 1000;
      // diff = diff - 1000;

      // }
      // while (diff > 0); // as long as difference between start and end time is greater than zero, keep sending the object containing the behavior
      // c = c + 1;
      // console.log("-------------------");
      // console.log(c);
    }
  }
  // start the data generator
  dataGenerator();


};