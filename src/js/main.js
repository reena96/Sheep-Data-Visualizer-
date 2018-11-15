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


    //add the FIELD system to the scene
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
    sheep1.scale.set(0.01, 0.01, 0.01);
    sheep2.scale.set(0.01, 0.01, 0.01);
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
  function analyze(error, data1, data2) {
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
      var sampledData1 = sampleData(data1, sliderVal);
      var sampledData2 = sampleData(data2, sliderVal);
      moveSheep(sampledData1, sampledData2);
    }

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

function moveSheep(data1, data2) {
  if (count == 0) {
    dataset1 = data1;
    dataset2 = data2;
  }
 
  //console.log(count);

  //console.log(dataset1[count]);
  //console.log(dataset2[count]);
  if (count > 0) {
    var geometry = new THREE.CircleGeometry(0.009, 32);
    var material1 = new THREE.MeshBasicMaterial({ color: "blue" });
    var circle1 = new THREE.Mesh(geometry, material1);
    var material2 = new THREE.MeshBasicMaterial({ color: "red" });
    var circle2 = new THREE.Mesh(geometry, material2);



    // console.log("Rolled up data");
    // console.log(sampledData);

    circle1.position.set(dataset1[count - 1]['Latitude'] * 20, 0, (dataset1[count - 1]['Longitude'] - 36) * 20);
    circle2.position.set(dataset2[count - 1]['Latitude'] * 20, 0, (dataset2[count - 1]['Longitude'] - 36) * 20);
    App.scene.addObject(circle1);
    App.scene.addObject(circle2);
    //  App.scene.render();
  }
  sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
  sheep2.position.set(dataset2[count]['Latitude'] * 20, 0, (dataset2[count]['Longitude'] - 36) * 20);
  //sheepfield.translateX(0.1);
  //console.log(count);
  count = count + 1;
  for (var j = 0; j < 10000000; j++) { }
  window.requestAnimationFrame(moveSheep);

}
