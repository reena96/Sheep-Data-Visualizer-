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
    var fieldSystem = new FieldSystem();
    //sheepeSystem.initialize('data/058.csv');

    //add the FIELD system to the scene
    App.scene.addObject(fieldSystem.getFieldSystem());

    // render the scene
    App.scene.render();

  };

})();