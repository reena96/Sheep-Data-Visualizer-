"use strict";

/* Get or create the application global variable */
var App = App || {};
var gps_data = {};
/* IIFE to initialize the main entry of the application*/
var sheep1;
var sheep2;
var lineArr1 = [];
var lineArr2 = [];
var actArr1 = [];
var actArr2 = [];
var count = 0;
var remove_path = [];
var chart1;
var chart2;
var path_svgContainer;
var path_rectangle;
var g;
var x, y, xAxis, yAxis, gX, gY, line;
var colorDict = {
  "stand up": "#068b0c", // dark green
  "stand down": "#04f10e", // light green
  "walk up": "#1B07AD", // dark blue
  "walk down": "#04B5FC", // light blue
  "ramble up": "#FC04E9", // dark pink
  "ramble down": "#FFB6C1", // light pink
  "trot": "#cc6600", // brown
  "canter_right lead": "FCDE04", // dark yellow
  "canter_left lead": "#FFFF99", // Light yellow
  "canter_unk": "#cc0000", // red
  "Unknown": "black"
};
var chart;
var paused = false;
var sheepSelected = 0;
var playingCharts = 0;
var pause_btn, play_btn;

(function() {

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
  App.start = function() {
    // create a new scene
    App.scene = new Scene({
      container: "scene"
    });
    var p_width = d3.select('#path').node().clientWidth;
    path_svgContainer = d3.select("#path").append("svg")
      .attr("width", "100%")
      .attr("height", "100%");
    g = path_svgContainer.append("g");
    g.attr("transform", "translate(40 ,0)");
    path_rectangle = g
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", p_width)
      .attr("height", 310)
      .style("fill", "#D3D3D3")
      .attr("pointer-events", "all")
      .call(d3.zoom()
        .scaleExtent([0, 12])
        .on("zoom", zoom));

    x = d3.scaleLinear()
      .domain([0.27, 0.4])
      .range([0, p_width]);
    y = d3.scaleLinear()
      .domain([36.8, 37])
      .range([310, 0]);

    xAxis = d3.axisBottom(x);
    yAxis = d3.axisLeft(y);

    gX = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + 310 + ")")
      .call(xAxis);
    gY = g.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis)



    // initialize the FIELD system

    var sheepSystem1 = new SheepSystem();
    sheepSystem1.initialize("2");
    sheep1 = sheepSystem1.getSheepSystem();
    sleep(10).then(() => {
      var sheepSystem2 = new SheepSystem();
      sheepSystem2.initialize("3");
      sheep2 = sheepSystem2.getSheepSystem();


      sheep1.scale.set(0.000625, 0.000625, 0.000625);
      sheep2.scale.set(0.000625, 0.000625, 0.000625);


      App.scene.addObject(sheep1);
      App.scene.addObject(sheep2);
      //Ground
      var ground_material = Physijs.createMaterial(
        new THREE.MeshStandardMaterial({
          color: "#cfdbdb"
        }), 0, .9 // low restitution
      );
      ground_material.side = THREE.DoubleSide;
      ground_material.transparent = true;
      // Ground
      var ground = new Physijs.BoxMesh(new THREE.BoxGeometry(40, 0, 40), ground_material, 0 // mass
      );
      ground.position.set(-0.5, -0.5, -0.5);

      ground.receiveShadow = true;
      App.scene.addObject(ground);
      App.scene.render();
      define_data();
      //console.log();
      var animal_select = document.getElementById("selectAnimal")
      animal_select.addEventListener("click", function() {
        console.log("Animals Select Input");
        var startTimeInput = document.getElementById("StartTime");
        count = startTimeInput.value - 1534395958;
        path_svgContainer.selectAll("circle").remove();
        sheep1.position.set(0, 0, 0);
        sheep2.position.set(0, 0, 0);
        define_data();
        //count = 0;
      });


      var startTimeInput = document.getElementById("StartTime");
      startTimeInput.oninput = function() {
        path_svgContainer.selectAll("circle").remove();
        console.log("Start Time Slider");
        console.log(startTimeInput.value);
        count = startTimeInput.value - 1534395958;
        sheep1.position.set(0, 0, 0);
        sheep2.position.set(0, 0, 0);
        if (paused == true) {
          paused = false;
          pause_btn.style("opacity", 1);
          play_btn.style("opacity", 0.2);
          chart.halt(paused);
          chart1.halt(paused);
          chart2.halt(paused);
          playingCharts = 2;
        }

        define_data();
      }


    })
  };

})();
var count = 0;
var dataset1 = [];
var dataset2 = [];

var sampledData1;

function define_data() {
  path_svgContainer.selectAll("circle").remove();
  lineArr1 = [];
  lineArr2 = [];

  //console.log("define_data");
  var length = 0;
  if (document.getElementById("both").selected == true) {
    d3.queue()
      .defer(d3.csv, "data/mergedc2.csv")
      .defer(d3.csv, "data/mergedc3.csv")
      .await(analyzeboth);

    function analyzeboth(error, data1, data2) {
      //console.log(data1);
      if (error) {
        console.log(error);
      }

      // Sampling Data
      var slider = document.getElementById("sampleRate");
      var output = document.getElementById("rate");
      output.innerHTML = slider.value;
      //console.log(output.innerHTML);

      slider.oninput = function() {
        console.log("Sample Rate Slider");
        output.innerHTML = this.value;
        var startTimeInput = document.getElementById("StartTime");

        count = startTimeInput.value - 1534395958;
        console.log(count);

        console.log("Slider Value now");

        var sliderVal = parseInt(this.value);
        count = 0;
        path_svgContainer.selectAll("circle").remove();
        d3.select("svg").remove();
        var sampledData1 = sampleData(data1, sliderVal);
        var sampledData2 = sampleData(data2, sliderVal);
        drawLineGraphAcc(sampledData1, sampledData2, 1);
        console.log("Here1");
        removePathsFromScene();
        remove_path = [];
        moveSheep(sampledData1, sampledData2, sliderVal, 1);
        length = sampledData1.length;
        drawActivityGraph(sampledData1, sampledData2, 0, length);

      }

      sheep1.visible = true;
      sheep2.visible = true;
      removePathsFromScene();
      remove_path = [];
      moveSheep(data1, data2, 5, 1);

      if (playingCharts != 2) {
        drawLineGraphAcc(data1, data2, 2);
        length = data1.length;
        drawActivityGraph(data1, data2, 0, length);
      } else {
        playingCharts = 0;
      }
    }
  } else {
    if (document.getElementById("sheep2").selected == true) {
      console.log("sheep2");
      d3.queue()
        .defer(d3.csv, "data/mergedc2.csv")
        .await(analyze);
      sheepSelected = 2;
    } else {
      d3.queue()
        .defer(d3.csv, "data/mergedc3.csv")
        .await(analyze);
      sheepSelected = 3;
    }

    function analyze(error, data1) {
      if (error) {
        console.log(error);
      }

      // Sampling Data
      var slider = document.getElementById("sampleRate");
      var output = document.getElementById("rate");
      output.innerHTML = slider.value;
      //console.log(output.innerHTML);

      slider.oninput = function() {
        output.innerHTML = this.value;

        console.log("Slider Value now");
        var sliderVal = parseInt(this.value);
        //count = 0;
        var sampledData1 = sampleData(data1, sliderVal);
        drawLineGraphAcc(sampledData1, null, 1);
        removePathsFromScene();
        remove_path = [];
        moveSheepAlone(sampledData1, sliderVal, 1);

      }
      removePathsFromScene();
      remove_path = [];
      moveSheepAlone(data1, 5, 1);
      if (playingCharts != 2) {
        drawLineGraphAcc(data1, null, 1);
        length = data1.length;
        drawActivityGraph(data1, null, sheepSelected, length);
      } else {
        playingCharts = 0;
      }
    }
  }
}

function drawActivityGraph(data1, data2, sheepSelected, length) {

  var act_width = d3.select('#activity-chart-div').node().clientWidth;
  chart = realTimeChartMulti()
    // .title("Time Series Activity Chart")
    .yTitle("Sheep Activity")
    .xTitle("Time")
    .yDomain(["Sheep ID2", "Sheep ID3"]) // initial y domain (note array)
    .border(true)
    .width(act_width)
    .height(250);

  // console.log(data1);
  // console.log(data2);
  // console.log(length);
  var selection = d3v3.select("#chartDiv");
  if (!selection.empty()) {
    selection.remove();
  }

  // invoke the chart
  var chartDiv = d3v3.select("#activity-chart-div").append("div")
    .attr("id", "chartDiv");

  // event handler for halt checkbox

  pause_btn = d3v3.select("#pause");
  play_btn = d3v3.select("#play");
  pause_btn.on("click", function() {
    // var state = d3v3.select(this).property("checked");
    if (paused == false) {
      paused = true;
      pause_btn.style("opacity", 0.2);
      play_btn.style("opacity", 1);
      chart.halt(paused);
      chart1.halt(paused);
      chart2.halt(paused);
      playingCharts = 0;
    }


  });

  d3v3.select("#play").on("click", function() {
    // var state = d3v3.select(this).property("checked");
    if (paused == true) {
      paused = false;
      pause_btn.style("opacity", 1);
      play_btn.style("opacity", 0.2);
      chart.halt(paused);
      chart1.halt(paused);
      chart2.halt(paused);
      playingCharts = 2;
      define_data();
    }

  });

  chartDiv.call(chart);

  var sheepID = "Sheep ID";
  if (sheepSelected == 0) {
    for (let idx = count; idx < length; idx++) {
      createSample(data1, idx, chart, 2);
      createSample(data2, idx, chart, 3);
    }
  } else {
    for (let idx = count; idx < length; idx++) {
      chart.yDomain([sheepID + sheepSelected]); // initial y domain (note array)
      // chartDiv.call(chart);
      createSample(data1, idx, chart, sheepSelected);
    }
  }

}

var d, kenyaDate;
function getKenyaTime(timestamp) {
  d = new Date(timestamp * 1000);
  kenyaDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (3600000 * 3));
  return kenyaDate;
}

function createSample(data, index, chart, actor) {

  // console.log(data[index]);
  // create randomized timestamp for this category data item
  if (data[index] != null) {
    var now = getKenyaTime(Number(data[index].TIME));
    var action = data[index].activity + "";
    // console.log(action);
    var color = colorDict[action];


    var j = 0;
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
      size: 50,
    };
    // console.log(obj);
    // send the datum to the chart
    chart.datum(obj);

  }
}

// function updateActivityData(dataset1, dataset2, select) {

//   //console.log(dataset[count]);
//   if (select == 2) {
//     var actData1 = {
//       //time: now,
//       time: Number(dataset1[count].TIME),
//       color: color,
//       opacity: 1,
//       category: "Sheep ID" + actor,
//       //type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
//       type: "rect",
//       size: 70,
//     };
//     var actData2 = {
//       //time: now,
//       time: dataset2[count].TIME,
//     };

//     actArr1.push(actData1);
//     if (actArr1.length > 30) {
//       actArr1.shift();
//     }
//     d3.select("#chart1").datum(actArr1).call(chart1);

//     actArr2.push(actData2);
//     if (actArr2.length > 30) {
//       actArr2.shift();
//     }

//     d3.select("#chart2").datum(actArr2).call(chart2);
//   } else {
//     var actData1 = {
//       //time: now,
//       time: dataset1[count].TIME,
//     };
//     actArr1.push(actData1);
//     if (lineArr1.length > 30) {
//       actArr1.shift();
//     }
//     d3.select("#chart1").datum(actArr1).call(chart1);

//   }
//   //count=count+1;
// }

function sampleData(arr, n) {
  var result = [];
  var object;
  for (var i = 0; i < arr.length; i = i + n) {
    // console.log(arr.length);
    object = {
      TIMESTAMP: arr[i].TIME,
      Latitude: arr[i].Latitude,
      Longitude: arr[i].Longitude,
      bracelet_ACC_X: arr[i].bracelet_ACC_X,
      bracelet_ACC_Y: arr[i].bracelet_ACC_Y,
      bracelet_ACC_Z: arr[i].bracelet_ACC_Z,
      bracelet_GYRO_X: arr[i].bracelet_GYRO_X,
      bracelet_GYRO_Y: arr[i].bracelet_GYRO_Y,
      bracelet_GYRO_Z: arr[i].bracelet_GYRO_Z,
      collar_ACC_X: arr[i].collar_ACC_X,
      collar_ACC_Y: arr[i].collar_ACC_Y,
      collar_ACC_Z: arr[i].collar_ACC_Z,
      collar_GYRO_X: arr[i].collar_GYRO_X,
      collar_GYRO_Y: arr[i].collar_GYRO_Y,
      collar_GYRO_Z: arr[i].collar_GYRO_Z,
      collar_MAG_X: arr[i].collar_MAG_X,
      collar_MAG_Y: arr[i].collar_MAG_Y,
      collar_MAG_Z: arr[i].collar_MAG_Z,
    };
    result.push(object);
  }
  return result
}

function sampleDataAcc(arr, n) {

  var result = [];
  var object;
  for (var i = 0; i < arr.length; i = i + n) {
    // console.log(arr.length);
    object = {
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

function drawLineGraphAcc(data1, data2, select) {

  d3.select("#chart1").selectAll("svg").remove();
  d3.select("#chart2").selectAll("svg").remove();
  console.log("drawLine");
  var dataset = [];
  //var count=2;

  var MAX_LENGTH = 100;
  var duration = 1;

  if (select == 2) {
    chart1 = realTimeLineChart();
    chart2 = realTimeLineChart();

    function seedData(data1, data2) {
      //console.log(data);
      for (var i = 0; i < 1; ++i) {
        lineArr1.push({
          time: data1[i].TIME,
          //  time: new Date(now.getTime() - ((MAX_LENGTH - i) * duration)),
          x: data1[i].collar_ACC_X,
          y: data1[i].collar_ACC_Y,
          z: data1[i].collar_ACC_Z
        });
        lineArr2.push({
          time: data2[i].TIME,
          //  time: new Date(now.getTime() - ((MAX_LENGTH - i) * duration)),
          x: data2[i].collar_ACC_X,
          y: data2[i].collar_ACC_Y,
          z: data2[i].collar_ACC_Z
        });
      }
    }


    seedData(data1, data2);

    // var timer_time = new Date(+data2[1].TIME * 1000);
    // console.log("timer_time");
    // console.log(timer_time);
    d3.select("#chart1").datum(lineArr1).call(chart1);
    chart1.width(+d3.select("#chart1").style("width").replace(/(px)/g, ""));
    d3.select("#chart1").call(chart1);

    d3.select("#chart2").datum(lineArr2).call(chart2);
    chart2.width(+d3.select("#chart2").style("width").replace(/(px)/g, ""));
    d3.select("#chart2").call(chart2);
  } else {
    chart1 = realTimeLineChart();

    function seedData(data1) {
      //console.log(data);
      for (var i = 0; i < 1; ++i) {
        lineArr1.push({
          time: data1[i].TIME,
          //  time: new Date(now.getTime() - ((MAX_LENGTH - i) * duration)),
          x: data1[i].collar_ACC_X,
          y: data1[i].collar_ACC_Y,
          z: data1[i].collar_ACC_Z
        });
      }
    }
    seedData(data1);
    d3.select("#chart1").datum(lineArr1).call(chart1);
    chart1.width(+d3.select("#chart1").style("width").replace(/(px)/g, ""));
    d3.select("#chart1").call(chart1);
  }

}

function moveSheep(data1, data2, sliderVal, initialize) {
  if (paused) return;
  if (document.getElementById("both").selected == true) {
    // console.log("Move Sheep");
    //console.log(count);
    sleep(10).then(() => {
      if (initialize == 1) {
        //console.log("0");
        dataset1 = data1;
        dataset2 = data2;
        sheep1.children[0].children[1].children[2].material.color.set(colorDict[(dataset1[count]['activity'])]);
        sheep2.children[0].children[1].children[2].material.color.set(colorDict[(dataset2[count]['activity'])]);
        initialize = 0;
      }

      if (count > 0) {
        var geometry = new THREE.CircleGeometry(0.00025, 32);
        var material1 = new THREE.MeshBasicMaterial({
          color: "#d95f02"
        });
        var circle1 = new THREE.Mesh(geometry, material1);
        var material2 = new THREE.MeshBasicMaterial({
          color: "#7570b3"
        });
        var circle2 = new THREE.Mesh(geometry, material2);
        circle1.name = "paths1" + String(count);
        circle2.name = "paths2" + String(count);
        // console.log("Rolled up data");
        // console.log(sampledData);
        if (dataset1[count - 1]['Latitude'] != "") {
          circle1.position.set(dataset1[count - 1]['Latitude'] * 20, 0.01875, (dataset1[count - 1]['Longitude'] - 36) * 20);
          App.scene.addObject(circle1);
          remove_path.push(circle1.name);
        }
        if (dataset2[count - 1]['Latitude'] != "") {
          circle2.position.set(dataset2[count - 1]['Latitude'] * 20, 0.01875, (dataset2[count - 1]['Longitude'] - 36) * 20);
          App.scene.addObject(circle2);
          remove_path.push(circle2.name);
        }
        // if (dataset1[count-1]['activity']!=dataset1[count-1]['activity']){
        //   sheep1.children[0].children[1].children[2].material.color.set(getActivityColor(dataset1[count]['activity']));
        // }
        // if (dataset2[count-1]['activity']!=dataset2[count-1]['activity']){
        //
        //   sheep2.children[0].children[1].children[2].material.color.set(getActivityColor(dataset2[count]['activity']));
        // }
        sheep1.children[0].children[1].children[2].material.color.set(colorDict[dataset1[count]['activity']]);
        sheep2.children[0].children[1].children[2].material.color.set(colorDict[dataset2[count]['activity']]);
        //  App.scene.render();
      }
      if (dataset1[count]['Latitude'] != "") {
        sheep1.visible = true;
        sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
        g.append("circle")
          .attr("cx", x(dataset1[count]['Latitude']))
          .attr("cy", y((dataset1[count]['Longitude'])))
          .attr("r", 1)
          .style("fill", "#d95f02");
        if (dataset1[count]['collar_MAG_Y'] != "") {
          var direction = getDirection(dataset1[count]);
          //Magnetometer Readings
          var angle = direction * Math.PI / 180;
          //console.log(angle);
          sheep1.rotation.y = (angle * 1);
        }
      } else {
        sheep1.visible = false;
      }
      if (dataset2[count]['Latitude'] != "") {
        sheep2.visible = true;
        sheep2.position.set(dataset2[count]['Latitude'] * 20, 0, (dataset2[count]['Longitude'] - 36) * 20);
        g.append("circle")
          .attr("cx", x(dataset2[count]['Latitude']))
          .attr("cy", y((dataset2[count]['Longitude'])))
          .attr("r", 1)
          .style("fill", "#7570b3");
        if (dataset2[count]['collar_MAG_Y'] != "") {
          var direction = getDirection(dataset2[count]);

          var angle = direction * Math.PI / 180;
          //  console.log(angle);
          sheep2.rotation.y = (angle * 1);
          App.scene.lookAt(sheep1.position);
        }
      } else {
        sheep2.visible = false;
      }


      count = count + 1;
      //console.log(count);
      updateData(dataset1, dataset2, 2);
      // for (var j = 0; j < 100000000; j++) {}

      window.requestAnimationFrame(moveSheep);
    });
  }
}
var count_remove;

function removePathsFromScene() {

  var i;
  //console.log(remove_path);

  for (i = 0; i < remove_path.length; i++) {
    App.scene.remove(App.scene.findobj(remove_path[i]));
  }

}

function getDirection(data) {
  var direction;
  if (data['collar_MAG_Y'] > 0) {
    direction = 90 - (Math.atan(data['collar_MAG_X'] / data['collar_MAG_Y']) * (180 / Math.PI));
  } else if (data['collar_MAG_Y'] < 0) {
    direction = 270 - (Math.atan(data['collar_MAG_X'] / data['collar_MAG_Y']) * 180 / Math.PI);
  } else {
    if (data['collar_MAG_X'] < 0) {
      direction = 180;
    } else {
      direction = 0;
    }
  }
  return direction;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function moveSheepAlone(data1, sliderVal, initialize) {
  if (paused) return;
  if (document.getElementById("sheep2").selected == true || document.getElementById("sheep3").selected == true) { // (document.getElementById("sheep3").selected == true)  {
    console.log("Move Sheep Alone");
    sleep(10).then(() => {
      // Do something after the sleep!
      if (initialize == 1) {
        dataset1 = data1;
        initialize = 0;
      }

      if (count > 0) {
        var geometry = new THREE.CircleGeometry(0.00025, 32);
        var material1 = new THREE.MeshBasicMaterial({
          color: "#d95f02"
        });
        var circle1 = new THREE.Mesh(geometry, material1);
        var material2 = new THREE.MeshBasicMaterial({
          color: "#7570b3"
        });
        var circle2 = new THREE.Mesh(geometry, material2);
        circle1.name = "paths1" + String(count);

        if (dataset1[count - 1]['Latitude'] != "") {
          circle1.position.set(dataset1[count - 1]['Latitude'] * 20, 0.01875, (dataset1[count - 1]['Longitude'] - 36) * 20);
          App.scene.addObject(circle1);
          remove_path.push(circle1.name);
        }

      }

      if (dataset1[count]['Latitude'] != "") {
        sheep1.visible = true;
        sheep1.position.set(dataset1[count]['Latitude'] * 20, 0, (dataset1[count]['Longitude'] - 36) * 20);
        if (dataset1[count]['collar_MAG_Y'] != "") {
          var direction = getDirection(dataset1[count]);
          //Magnetometer Readings
          var angle = direction * Math.PI / 180;
          //console.log(angle);
          sheep1.rotation.y = (angle * 1);
        }
      } else {
        sheep1.visible = false;
      }
      g.append("circle")
        .attr("cx", x(dataset1[count]['Latitude']))
        .attr("cy", y((dataset1[count]['Longitude'])))
        .attr("r", 2)
        .style("fill", "#d95f02");


      sheep1.children[0].children[1].children[2].material.color.set(colorDict[dataset1[count]['activity']]);

      //console.log(sheep1.position);
      App.scene.lookAt(sheep1.position);


      count = count + 1;
      //console.log(count);
      updateData(dataset1, null, 1);
      // for (var j = 0; j < 100000000; j++) {}
      window.requestAnimationFrame(moveSheepAlone);
    });

  }
}

function changeAnimals() {

  var startTimeInput = document.getElementById("StartTime");
  count = startTimeInput.value - 1534395958;
  define_data();

}

function updateData(dataset1, dataset2, select) {

  //console.log(dataset[count]);
  if (select == 2) {
    var now = getKenyaTime(Number(dataset1[count].TIME));
    var lineData1 = {
      //time: now,
      time: now,
      x: dataset1[count].collar_ACC_X,
      y: dataset1[count].collar_ACC_Y,
      z: dataset1[count].collar_ACC_Z
    };

    var now = getKenyaTime(Number(dataset2[count].TIME));
    var lineData2 = {
      //time: now,
      time: now,
      x: dataset2[count].collar_ACC_X,
      y: dataset2[count].collar_ACC_Y,
      z: dataset2[count].collar_ACC_Z
    };

    lineArr1.push(lineData1);
    if (lineArr1.length > 30) {
      lineArr1.shift();
    }
    d3.select("#chart1").datum(lineArr1).call(chart1);

    lineArr2.push(lineData2);
    if (lineArr2.length > 30) {
      lineArr2.shift();
    }

    d3.select("#chart2").datum(lineArr2).call(chart2);
  } else {
    var now = getKenyaTime(Number(dataset1[count].TIME));
    var lineData1 = {
      //time: now,
      time: now,
      x: dataset1[count].collar_ACC_X,
      y: dataset1[count].collar_ACC_Y,
      z: dataset1[count].collar_ACC_Z
    };
    lineArr1.push(lineData1);
    if (lineArr1.length > 30) {
      lineArr1.shift();
    }
    d3.select("#chart1").datum(lineArr1).call(chart1);

  }
  var timer_time = getKenyaTime(dataset1[count].TIME).toLocaleString();;
  d3.select("#timer").text(timer_time);
  //count=count+1;
}

function pad(num) {
  return ("0" + num).slice(-2);
}

function getTimeFromDate(timestamp) {
  var date = new Date(timestamp * 1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  return time;
}


function zoom() {
  g.attr("transform", d3.event.transform);
  d3.selectAll('.line').style("stroke-width", 2 / d3.event.transform.k);
  gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
}