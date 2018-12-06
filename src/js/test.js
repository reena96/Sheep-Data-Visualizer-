"use strict";
var chart = realTimeChartMulti()
    .title("Chart Title")
    .yTitle("Categories")
    .xTitle("Time")
    .yDomain(["Category1"]) // initial y domain (note array)
    .border(true)
    .width(900)
    .height(350);

// invoke the chart
var chartDiv = d3v3.select("#activity-chart-div").append("div")
    .attr("id", "chartDiv")
    .call(chart);

// alternative and equivalent invocation
//chart(chartDiv); 

// event handler for debug checkbox
d3v3.select("#debug").on("change", function () {
    var state = d3v3.select(this).property("checked")
    chart.debug(state);
})

// event handler for halt checkbox
d3v3.select("#halt").on("change", function () {
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
    .defer(d3.csv, "data/pos_state_collar_C2.csv")
    .defer(d3.csv, "data/pos_state_collar_C2.csv")

    .await(analyze);

function analyze(error, data1, data2) {
    if (error) { console.log(error); }

    console.log(data1[0]);
    console.log(data2[0]);
    // define data generator
    function dataGenerator() {

        setTimeout(function () {

            // add categories dynamically
            d++;
            switch (d) {
                case 5:
                    chart.yDomain(["Category1", "Category2"]);
                    break;
                case 10:
                    chart.yDomain(["Category1", "Category2", "Category3"]);
                    break;
                default:
            }

            var obj = {};
            // output a sample for each category, each interval (five seconds)
            for (let index = 0; index < array.length; index++) {
                console.log(array[index]);
                // create new data item
                obj = outputSample(data1[index]);
                // send the datum to the chart
                chart.datum(obj);
                obj = outputSample(data2[index]);
                chart.datum(obj);
            }



            // drive data into the chart at average interval of five seconds
            // here, set the timeout to roughly five seconds
            timeout = Math.round(timeScale(normal()));

            // do forever
            dataGenerator();

        }, timeout);
    }

    function outputSample(data) {
        // output a sample for each category, each interval (five seconds)

        // create randomized timestamp for this category data item
        // var now = new Date(data.start_time);
        var now = new Date(new Date().getTime() + i * (Math.random() - 0.5) * 1000);

        // create new data item
        var obj;
        var doSimple = false;
        if (doSimple) {
            obj = {
                // simple data item (simple black circle of constant size)
                time: now,
                color: "black",
                opacity: 1,
                category: data.actor,
                type: "rect",
                size: 50,
            };

        } else {
            obj = {
                // complex data item; four attributes (type, color, opacity and size) are changing dynamically with each iteration (as an example)
                time: now,
                color: color(d % 10),
                opacity: Math.max(Math.random(), 0.3),
                category: data.actor,
                //type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
                type: "rect",
                size: 50,
            };
        }
    }
};
