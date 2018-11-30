"use strict";

/* Get or create the application global variable */
var App = App || {};
var gps_data = {};
/* IIFE to initialize the main entry of the application*/
var sheep1;
var sheep2;
var count=0;
var remove_path=[];
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

    sheep1.scale.set(0.000625, 0.000625, 0.000625);
    sheep2.scale.set(0.000625, 0.000625, 0.000625);

    var plane_geometry = new THREE.PlaneGeometry( 100, 100, 100 );
    var plane_material = new THREE.MeshBasicMaterial( {color: "#D7D7D7", side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( plane_geometry, plane_material );

    App.scene.addObject(sheep1);
    App.scene.addObject(sheep2);
    App.scene.addObject(plane);

    App.scene.render();
    define_data();
    //console.log();
    var animal_select=document.getElementById("selectAnimal")
    animal_select.addEventListener("click", function() {
    define_data();
    sheep1.position.set(0,0,0);
    sheep2.position.set(0,0,0);
    count=0;
});



  };

})();
var count = 0;
var dataset1 = [];
var dataset2 = [];

var sampledData1;
function define_data() {

  console.log("define_data");
 if (document.getElementById("both").selected == true){

  d3.queue()
    .defer(d3.csv, "data/mergedc2.csv")
    .defer(d3.csv, "data/mergedc3.csv")
    .await(analyzeboth);
  function analyzeboth(error, data1, data2) {
    console.log(data1);
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
      moveSheep(sampledData1, sampledData2,sliderVal);
    }
     drawLineGraphAcc(data1);
     drawLineGraphAcc(data2);

    console.log(data1);
    sheep1.visible=true;
    sheep2.visible=true;

    moveSheep(data1, data2,5);
  }
}
else{
 if (document.getElementById("sheep2").selected == true) {
   console.log("sheep2");
  d3.queue()
    .defer(d3.csv, "data/mergedc2.csv")
    .await(analyze);
  }
  else{
    d3.queue()
      .defer(d3.csv, "data/mergedc3.csv")
      .await(analyze);
  }

    function analyze(error, data1) {
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
        moveSheepAlone(sampledData1,sliderVal);

      }

      moveSheepAlone(data1,5);
    }
}
}

function sampleData(arr, n) {
  var result = [];
  var object;
  for (var i = 0; i < arr.length; i = i + n) {
    console.log(arr.length);
    object =
      {
        TIMESTAMP: arr[i].TIME,
        Latitude: arr[i].Latitude,
        Longitude: arr[i].Longitude,
        bracelet_ACC_X : arr[i].bracelet_ACC_X,
        bracelet_ACC_Y : arr[i].bracelet_ACC_Y,
        bracelet_ACC_Z : arr[i].bracelet_ACC_Z,
        bracelet_GYRO_X: arr[i].bracelet_GYRO_X,
        bracelet_GYRO_Y: arr[i].bracelet_GYRO_Y,
        bracelet_GYRO_Z: arr[i].bracelet_GYRO_Z,
        collar_ACC_X:arr[i].collar_ACC_X,
        collar_ACC_Y:arr[i].collar_ACC_Y,
        collar_ACC_Z:arr[i].collar_ACC_Z,
        collar_GYRO_X:arr[i].collar_GYRO_X,
        collar_GYRO_Y:arr[i].collar_GYRO_Y,
        collar_GYRO_Z:arr[i].collar_GYRO_Z,
        collar_MAG_X:arr[i].collar_MAG_X,
        collar_MAG_Y:arr[i].collar_MAG_Y,
        collar_MAG_Z:arr[i].collar_MAG_Z,
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
        MAG_X: arr[i].MAG_X,
        MAG_Y: arr[i].MAG_Y,
        MAG_Z: arr[i].MAG_Z,
      };
    result.push(object);
  }
  return result
}

function drawLineGraphAcc(data){
console.log(data);

  console.log("Draw Graph");
  var svg = d3.selectAll("#graph")
        .append("svg")

        .attr("width","100%")
        .attr("height","100%")
        .append("g")
        .attr("width","100%")
        .attr("height","100%");


var valueline = d3.line()
          .x(function(d) { return x(d.TIME); })
          .y(function(d) { return y(d.collar_ACC_X); });
    var x = d3.scaleLinear().range([d3.min(data, function(d) { return d.TIME; }), d3.max(data, function(d) { return d.TIME; })]);
    var y = d3.scaleLinear().range([0,1]);

    x.domain([0, d3.max(data, function(d) { return d.TIME; })]);
    y.domain([0, d3.max(data, function(d) { return d.collar_ACC_X; })]);
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
  //console.log(data1);

  if (count == 0) {
    console.log("0");
    dataset1 = data1;
    dataset2 = data2;


    removePathsFromScene();
    remove_path=[];
  }

  if (count > 0) {
    var geometry = new THREE.CircleGeometry(0.00025, 32);
    var material1 = new THREE.MeshBasicMaterial({ color: "#d95f02" });
    var circle1 = new THREE.Mesh(geometry, material1);
    var material2 = new THREE.MeshBasicMaterial({ color: "#7570b3" });
    var circle2 = new THREE.Mesh(geometry, material2);
    circle1.name="paths1"+String(count);
    circle2.name="paths2"+String(count);
    // console.log("Rolled up data");
    // console.log(sampledData);
    if (dataset1[count-1]['Latitude']!=""){
    circle1.position.set(dataset1[count-1]['Latitude'] * 20, 0.01875, (dataset1[count-1]['Longitude'] - 36) * 20);
App.scene.addObject(circle1);
remove_path.push(circle1.name);
  }
  if (dataset2[count-1]['Latitude']!=""){
    circle2.position.set(dataset2[count-1]['Latitude'] * 20, 0.01875, (dataset2[count-1]['Longitude'] - 36) * 20);
App.scene.addObject(circle2);
remove_path.push(circle2.name);
  }


    //  App.scene.render();
  }
  if (dataset1[count]['Latitude']!=""){
    sheep1.visible=true;
  sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
  if (dataset1[count]['collar_MAG_Y']!=""){
  var direction=getDirection(dataset1[count]);
  //Magnetometer Readings
  var angle=direction*Math.PI/180;
  //console.log(angle);
  sheep1.rotation.y=(angle*1);}
}
else{
  sheep1.visible=false;
}
if (dataset2[count]['Latitude']!=""){
  sheep2.visible=true;
  sheep2.position.set(dataset2[count]['Latitude'] * 20, 0, (dataset2[count]['Longitude'] - 36) * 20);
  if (dataset2[count]['collar_MAG_Y']!=""){
  var direction=getDirection(dataset2[count]);

  var angle=direction*Math.PI/180;
//  console.log(angle);
  sheep2.rotation.y=(angle*1);
  App.scene.lookAt(sheep2.position);}
}
else{
  sheep2.visible=false;
}


  count = count + 1;
  //console.log(count);
  for (var j = 0; j < 100000000; j++) { }
  window.requestAnimationFrame(moveSheep);

}
var count_remove;
function removePathsFromScene() {

  var i;
  console.log(remove_path);

  for (i = 0; i < remove_path.length; i++) {
      App.scene.remove(App.scene.findobj(remove_path[i]));
}

}

function getDirection(data){
  var direction;
  if(data['collar_MAG_Y']>0){
    direction=90-(Math.atan(data['collar_MAG_X']/data['collar_MAG_Y'])*(180/Math.PI));
  }
  else if (data['collar_MAG_Y']<0) {
      direction=270-(Math.atan(data['collar_MAG_X']/data['collar_MAG_Y'])*180/Math.PI);
  }
  else  {
    if(data['collar_MAG_X']<0){
      direction=180;
    }
    else{
      direction=0;
    }
  }
  return direction;
}

function moveSheepAlone(data1,sliderVal) {
  if (count == 0) {
    dataset1 = data1;
    removePathsFromScene();
    remove_path=[];

  }

  if (count > 0) {
    var geometry = new THREE.CircleGeometry(0.00025, 32);
    var material1 = new THREE.MeshBasicMaterial({ color: "#d95f02" });
    var circle1 = new THREE.Mesh(geometry, material1);
    var material2 = new THREE.MeshBasicMaterial({ color: "#7570b3" });
    var circle2 = new THREE.Mesh(geometry, material2);
    circle1.name="paths1"+String(count);

    if (dataset1[count-1]['Latitude']!=""){
    circle1.position.set(dataset1[count-1]['Latitude'] * 20, 0.01875, (dataset1[count-1]['Longitude'] - 36) * 20);
    App.scene.addObject(circle1);
    remove_path.push(circle1.name);
  }

  }
  sheep1.visible=true;
  sheep2.visible=false;
  if (dataset1[count]['Latitude']!=""){
    sheep1.visible=true;
  sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
  if (dataset1[count]['collar_MAG_Y']!=""){
  var direction=getDirection(dataset1[count]);
  //Magnetometer Readings
  var angle=direction*Math.PI/180;
  //console.log(angle);
  sheep1.rotation.y=(angle*1);}
}
else{
  sheep1.visible=false;
}

  App.scene.lookAt(sheep1.position);


  count = count + 1;
  //console.log(count);
  for (var j = 0; j < 10000000; j++) { }
  window.requestAnimationFrame(moveSheepAlone);

}

function changeAnimals(){
  define_data();
}
