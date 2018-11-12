"use strict";

/* Get or create the application global variable */
var App = App || {};
var gps_data={};
/* IIFE to initialize the main entry of the application*/
var sheepfield1;
var sheepfield2;
(function() {

  // setup the pointer to the scope 'this' variable
  var self = this;
  // Defining data

  var loader = new THREE.FileLoader();
  var lat={};
  var long={};
  var timestamp={};
  var gps_data=[];
  var i=0;

  //load a text file and output the result to the console


  /* Entry point of the application */
  App.start = function() {
    // create a new scene
    App.scene = new Scene({
      container: "scene"
    });

    // initialize the FIELD system
    var sheepSystem1 = new SheepSystem();

    sheepSystem1.initialize();


    //add the FIELD system to the scene
     sheepfield1=sheepSystem1.getFieldSystem();
      var sheepSystem2 = new SheepSystem();
      sheepSystem2.initialize();
     sheepfield2=sheepSystem2.getFieldSystem();
     console.log(sheepfield1);
     console.log(sheepfield2);
  //  console.log(sheepfield);
 //var  gps_data=sheepSystem.loadAllData("data/gps_processed_C2.csv");
//App.scene.addObject(sheepfield);
//console.log(sheepfield);
App.scene.addObject(sheepfield1);
App.scene.addObject(sheepfield2);
App.scene.render();
define_data("data/gps_processed_C2.csv");
//moveSheep();
 // d3.queue()
 //   .defer(d3.csv, "data/gps_processed_C2.csv")
 //   //.defer(d3.tsv, "/data/animals.tsv")
 //   .await(analyze);
 //
 // function analyze(error, data) {
 //   if(error) { console.log(error); }
 //  // console.log(data);
 //
 //   for (i = 0; i < data.length; i++) {
 //     console.log(sheepfield.position);
 //  //for (var j = 0; j < 1000000; j++) {}
 //  //animate(data[i]['Latitude']*10, 0 , (data[i]['Longitude']-36)*10);
 //
 //  //App.scene.rendersheep(sheepfield,data[i]['Latitude']*10,0,(data[i]['Longitude']-36)*10);
 //    sheepfield.position.set(data[i]['Latitude']*10, 0 , (data[i]['Longitude']-36)*10);
 //    //App.scene.render();
 //    for (var j = 0; j < 10000000; j++) {}
 //
 //   }


 // render the scene
//  App.scene.render();
 //}




  //
  //   App.scene.addObject(sheepfield);
  //
  // // render the scene
  //  App.scene.render();

    //sheepfield.translateX(2)

  };

})();
var count=0;
var dataset1=[];
var dataset2=[];


function define_data(file){
  d3.queue()
    .defer(d3.csv, "data/gps_processed_C2.csv")
    .defer(d3.csv, "data/gps_processed_C3.csv")
    //.defer(d3.tsv, "/data/animals.tsv")

    .await(analyze);

  function analyze(error, data,data1) {
    if(error) { console.log(error); }
   // console.log(data);

   //self.dataset=data;
   moveSheep(data,data1);

 }

}
function addtovariable(data){


}
function moveSheep(data,data1){
  if (count==0){
  dataset1=data;
  dataset2=data1;}
  //console.log(count);


   sheepfield1.position.set(dataset1[count]['Latitude']*15, 0 , (dataset1[count]['Longitude']-36)*15);
   sheepfield2.position.set(dataset2[count]['Latitude']*5, 0 , (dataset2[count]['Longitude']-36)*5);
   //sheepfield.translateX(0.1);
   //console.log(count);
   count=count+1;
   for (var j = 0; j < 10000000; j++) {}
  window.requestAnimationFrame(moveSheep);

}
