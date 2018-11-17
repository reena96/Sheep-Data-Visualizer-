"use strict";

/* Get or create the application global variable */
var App = App || {};


var FieldSystem = function() {

  // setup the pointer to the scope 'this' variable
  var self = this;

  // data container
  var data = [];

  // scene graph group for the particle system
  var sceneObject = new THREE.Group();

  // bounds of the data
  var bounds = {};
  // var bufferGeometry;

  var points, plane;
  var cylinder;
  var currentZ = 0,
    filtereddata;
  var planePoints = [];

  var svg, g;

  // create a field where the sheep will be added
  self.drawField = function() {

  };

  // publicly available functions
  var publiclyAvailable = {

    // load the data and setup the system
    initialize: function(file) {
      //self.loadData(file);
      self.drawField();
    },

    // accessor for the particle system
    getSheepSystem: function() {
      return sceneObject;
    }
  };

  return publiclyAvailable;

};