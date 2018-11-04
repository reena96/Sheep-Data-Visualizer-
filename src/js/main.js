"use strict";

/* Get or create the application global variable */
var App = App || {};

/* IIFE to initialize the main entry of the application*/
(function() {

  // setup the pointer to the scope 'this' variable
  var self = this;

  /* Entry point of the application */
  App.start = function() {
    // create a new scene
    App.scene = new Scene({
      container: "scene"
    });

    // initialize the FIELD system
    var sheepSystem = new SheepSystem();
    sheepSystem.initialize();

    //add the FIELD system to the scene
   var  sheepfield=sheepSystem.getFieldSystem();
  //  console.log(sheepfield);
    App.scene.addObject(sheepfield);

    // render the scene


    App.scene.render();

  };

})();
