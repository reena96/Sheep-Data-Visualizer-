"use strict";

/* Get or create the application global variable */
var App = App || {};

/* Create the scene class */
var Scene = function (options) {

  // setup the pointer to the scope 'this' variable
  var self = this;

  // scale the width and height to the screen size
  var width = d3.select('.fieldDiv').node().clientWidth;
  var height = width * 0.4;

  // width = window.innerWidth,
  // height = window.innerHeight;

  // create the scene
  self.scene = new THREE.Scene();

  // setup the camera
  self.camera = new THREE.PerspectiveCamera(0.5, width / height, 0.1, 100);
  self.camera.position.set(10, 50, 10);
  //self.camera.lookAt(10, 100, 30);
  var axesHelper = new THREE.AxesHelper(5);
  self.scene.add(axesHelper);

  // var light = new THREE.DirectionalLight(0xffffff, 1.5);
  // // Position the light out from the scene, pointing at the origin
  // light.position.set(0, 2, 20);
  // light.lookAt(0, 0, 0);
  // Add a directional light to show off the objects
  const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
  self.scene.add(light);

  const directLight1 = new THREE.DirectionalLight(0xffd798, 0.8);
  directLight1.castShadow = true;
  directLight1.position.set(9.5, 8.2, 8.3);
  self.scene.add(directLight1);

  const directLight2 = new THREE.DirectionalLight(0xc9ceff, 0.5);
  directLight2.castShadow = true;
  directLight2.position.set(-15.8, 5.2, 8);
  self.scene.add(directLight2);

  // add the light to the camera and the camera to the scene
  //self.camera.add(light);
  self.scene.add(self.camera);

  // create the renderer
  self.renderer = new THREE.WebGLRenderer();
  self.renderer = new THREE.WebGLRenderer({ alpha: true });
  self.renderer.setPixelRatio(window.devicePixelRatio);
  self.renderer.setSize(width, height);
  self.renderer.shadowMap.enabled = true;
  self.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // set the size and append it to the document
  self.renderer.setSize(width, height);
  document.getElementById(options.container).appendChild(self.renderer.domElement);


  /* add the checkboard floor to the scene */
  //add camera controls
  self.controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
  // self.controls.maxZoom = 0.2;  //min zoom and max zoom DO NOT WORK WITH Perspective camera
  // self.controls.minZoom = 0.2;
  self.controls.enableKeys = false;
  // self.controls.minPolarAngle = Math.PI/5; // radians
  // self.controls.maxPolarAngle = Math.PI/(1.97);
  self.controls.minPolarAngle = 1.51;
  self.controls.maxPolarAngle = 1.57;
  // var angleRadians = Math.atan2(remote.y - origin.y, remote.x - origin.x);
  self.controls.enableRotate = true;
  self.controls.zoomSpeed = 0.1;
  self.controls.rotateSpeed = 0.1;
  self.controls.panSpeed = 0.1;
  self.controls.minDistance = 21;
  self.controls.maxDistance = 36;
  self.controls.minAzimuthAngle = 0.25; // radians (check angle by controls.getAzimuthalAngle())
  self.controls.maxAzimuthAngle = 0.4; // radians


  self.public = {

    resize: function () {

    },

    addObject: function (obj) {
      self.scene.add(obj);
    },

    render: function () {
      requestAnimationFrame(self.public.render);
      self.controls.update();
      // console.log("current azimuthal angle");
      // console.log(self.controls.getAzimuthalAngle());
      // console.log("current Polar angle");
      // console.log(self.controls.getPolarAngle());
      self.renderer.render(self.scene, self.camera);
    },

    findobj: function (obj) {
      return self.scene.getObjectByName(obj)
    },
    remove: function (obj) {

      self.scene.remove(obj);
    },
    lookAt: function (obj) {
    //  console.log(self.camera.position);

      self.controls.target=obj;
      self.camera.position.set(10, 10, 10);
      self.controls.update();
      //self.controls.object.position.set(10, 10, 10);
      //self.camera.updateProjectionMatrix();
    }

  };

  return self.public;
};
