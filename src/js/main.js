"use strict";

/* Get or create the application global variable */
var App = App || {};
var gps_data = {};
/* IIFE to initialize the main entry of the application*/
var sheep1;
var sheep2;
(function () {

  // setup the pointer to the scope 'this' variable
  var self = this;
  // Defining data

  var loader = new THREE.FileLoader();
  var lat = {};
  var long = {};
  var timestamp = {};
  var gps_data = [];
  var i = 0;

  //load a text file and output the result to the console


  /* Entry point of the application */
  App.start = function () {
    // create a new scene
    App.scene = new Scene({
      container: "scene"
    });

    // initialize the FIELD system
    var sheepSystem1 = new SheepSystem();
    sheepSystem1.initialize();
    sheep1 = sheepSystem1.getSheepSystem();
    var sheepSystem2 = new SheepSystem();
    sheepSystem2.initialize();
    sheep2 = sheepSystem2.getSheepSystem();

    console.log(sheep1);
    console.log(sheep2);
    //  console.log(sheepfield);
    //var  gps_data=sheepSystem.loadAllData("data/gps_processed_C2.csv");
    //App.scene.addObject(sheepfield);
    //console.log(sheepfield);
    sheep1.scale.set(0.02, 0.02, 0.02);
    sheep2.scale.set(0.02, 0.02, 0.02);
    App.scene.addObject(sheep1);
    App.scene.addObject(sheep2);


    App.scene.render();
    define_data("data/gps_processed_C2.csv");


  };

})();
var count = 0;
var dataset1 = [];
var dataset2 = [];

var sampledData1;
function define_data(file) {
  d3.queue()
    .defer(d3.csv, "data/gps_processed_C2.csv")
    .defer(d3.csv, "data/gps_processed_C3.csv")
    .defer(d3.csv, "data/9dof_processed_C2.csv")
    .defer(d3.csv, "data/9dof_processed_C3.csv")
    //.defer(d3.tsv, "/data/animals.tsv")

    .await(analyze);

     // // To get data by uniquestamps and their corresponding avg lat, long
    // sampledData1 = d3.nest()
    //   .key(function (d) {
    //     return d.TIMESTAMP;
    //   })
    //   .rollup(function (v) {
    //     return {
    //       count: v.length,
    //       latitude: d3.mean(v, function (d) { return d.Latitude; }),
    //       longitude: d3.mean(v, function (d) { return d.Longitude; })
    //     };
    //   })
    //   .entries(data1);
  function analyze(error, data1, data2,data3,data4) {
    if (error) { console.log(error); }

// Sampling Data
    var slider = document.getElementById("sampleRate");
    var output = document.getElementById("rate");
    output.innerHTML = slider.value;
    console.log(output.innerHTML);

    slider.oninput = function () {
      output.innerHTML = this.value;
      console.log("Slider Value now");
      var sliderVal = parseInt(this.value);
      count=0;
      var sampledData1 = sampleData(data1, sliderVal);
      var sampledData2 = sampleData(data2, sliderVal);
      var sampledData1Acc = sampleDataAcc(data3, sliderVal);
      var sampledData2Acc = sampleDataAcc(data4, sliderVal);
      console.log(sampledData2Acc);
      d3.selectAll("#graph").remove();
      drawLineGraphAcc(sampledData1Acc);
      drawLineGraphAcc(sampledData2Acc);
      moveSheep(sampledData1, sampledData2,sliderVal);


    }
    drawLineGraphAcc(data3);
    drawLineGraphAcc(data4);
    moveSheep(data1, data2);
  }

}

function sampleData(arr, n) {
  var result = [];
  var object;
  for (var i = 0; i < arr.length; i = i + n) {
    console.log(arr.length);
    object =
      {
        TIMESTAMP: arr[i].TIMESTAMP,
        Latitude: arr[i].Latitude,
        Longitude: arr[i].Longitude,
      };
    result.push(object);
  }
  return result
}

function sampleDataAcc(arr, n) {
  var result = [];
  var object;
  for (var i = 0; i < arr.length; i = i + n) {
    console.log(arr.length);
    object =
      {
        TIMESTAMP: arr[i].TIMESTAMP,
        ACC_X: arr[i].ACC_X,
        ACC_Y: arr[i].ACC_Y,
        ACC_Z: arr[i].ACC_Z,
      };
    result.push(object);
  }
  return result
}

function drawLineGraphAcc(data){
console.log(data);
  // data.forEach(function(d) {
  //       d.TIMESTAMP=
  //       d.ACC_X = +(d.ACC_X);
  //       d.close = +d.close;
  //   });
  console.log("Draw Graph");
  var svg = d3.selectAll("#graph")
        .append("svg")
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
        .attr("width","100%")
        .attr("height","100%")
        .append("g")
        .attr("width","100%")
        .attr("height","100%");


var valueline = d3.line()
          .x(function(d) { return x(d.TIME); })
          .y(function(d) { return y(d.ACC_X); });
    var x = d3.scaleLinear().range([d3.min(data, function(d) { return d.TIME; }), d3.max(data, function(d) { return d.TIME; })]);
    var y = d3.scaleLinear().range([0,1]);

    x.domain([0, d3.max(data, function(d) { return d.TIME; })]);
    y.domain([0, d3.max(data, function(d) { return d.ACC_X; })]);
    console.log(svg);

    svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);
    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}

function moveSheep(data1, data2,sliderVal) {
  if (count == 0) {
    dataset1 = data1;
    dataset2 = data2;
    count_remove=1;
    remove("paths1");
    count_remove=1;
    remove("paths2");
  }

  //console.log(count);

  //console.log(dataset1[count]);
  //console.log(dataset2[count]);
  if (count > 0) {
    var geometry = new THREE.CircleGeometry(0.005, 32);
    var material1 = new THREE.MeshBasicMaterial({ color: "blue" });
    var circle1 = new THREE.Mesh(geometry, material1);
    var material2 = new THREE.MeshBasicMaterial({ color: "red" });
    var circle2 = new THREE.Mesh(geometry, material2);
    circle1.name="paths1"+String(count);
    circle2.name="paths2"+String(count);
    // console.log("Rolled up data");
    // console.log(sampledData);
    circle1.position.copy(sheep1.position);
    circle2.position.copy(sheep2.position);
    App.scene.addObject(circle1);
    App.scene.addObject(circle2);
    //  App.scene.render();
  }
  sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
  sheep2.position.set(dataset2[count]['Latitude'] * 20, 0, (dataset2[count]['Longitude'] - 36) * 20);
  App.scene.lookAt(sheep2)
  //sheepfield.translateX(0.1);
  //console.log(count);
  count = count + 1;
  for (var j = 0; j < 10000000; j++) { }
  window.requestAnimationFrame(moveSheep);

}
var count_remove;
function remove(id) {

  var i=count_remove;

  //console.log(id+String(i));
  //console.log(App.scene.getObjectByName(id+String(i)));

  App.scene.remove(App.scene.findobj(id+String(i)));
  count_remove=count_remove+1;
  i=count_remove;
  if (App.scene.findobj(id+String(i))!=null){

    remove(id);
  }
}
