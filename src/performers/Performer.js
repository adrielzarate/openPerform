// Parent should be a Three Scene, updateFromPN recieves data from PerceptionNeuron.js


require('three/examples/js/loaders/FBXLoader.js');
require('three/examples/js/loaders/OBJLoader.js');
require('three/examples/js/loaders/ColladaLoader.js');

const sceneLoader = require('./../libs/three/loaders/SceneLoader.js');

require('./../libs/BufferGeometryMerge.js');

import TWEEN from 'tween.js';

import Common from './../util/Common';

import PerformerEffects from './../effects/performer';

import _ from 'lodash';
import dat from 'dat-gui';

class Performer {
  constructor(parent, inputId, performerId, type, leader, color, visible, actions, inputManager, outputManager) {
    this.inputManager = inputManager;
    this.outputManager = outputManager;

    this.actions = actions;

    this.dataBuffer = [];
    this.delay = 0;
    this.origScale = 1;
    this.scale = 1;
    
    this.styleInt = null;
    this.modelGeos = {};
    this.colladaScenes = {};
    this.animationMixers = [];

    this.parent = parent;
    this.inputId = inputId;
    this.type = type;
    this.leader = leader;

    this.performer = null;
    this.name = 'Performer ' + performerId;
    
    this.offset = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    // console.log('!!!!!!!', this.type);
    if (this.type === 'clone_bvh' || this.type === 'clone_perceptionNeuron') {
      this.offset = new THREE.Vector3((parseInt(performerId) - 1), 0, 0);
      this.name = 'Clone ' + (parseInt(performerId) - 1);
    }
    this.color = color;
    
    this.prefix = 'robot_';

    this.wireframe = false;
    this.visible = true;
    this.tracking = false;

    this.styles = ['default', 'boxes', 'spheres', 'planes', 'robot', 'discs', 'hands', 'heads'];
    this.styleId = 0;
    this.style = this.styles[this.styleId];
    this.intensity = 1;

    this.material = 'Phong';
    this.materials = ['Basic', 'Lambert', 'Phong', 'Standard'];

    this.displayType = { value: 'bvhMeshGroup', label: 'Mesh Group' };
    this.displayTypes = [
      { value: 'bvhMeshGroup', label: 'Mesh Group' },
      // { value: 'abstractLines', label: 'Abstract Lines' },
      // { value: 'stickFigure', label: 'Stick Figure' },
      
      // { value: 'riggedMesh', label: 'Rigged Model' },
    ];

    // this.loadColladaModels([
    //  {
    //    id:'oxygen',
    //    url: '/models/dae/oxygen_atom.dae'
    //  }
    // ]);

    // this.loadFBXModels([
    //  {
    //    id:'oxygen',
    //    url: '/models/fbx/oxygen_atom.fbx'
    //  }
    // ]);

    this.loadObjModels([
      {
        id: 'hand',
        url: '/models/obj/hand.obj',
      },
      {
        id: 'head',
        url: '/models/obj/head.obj',
      },
      /* {
        id:'chair',
        url: '/models/obj/chair.obj'
      },
      {
        id:'heart',
        url: '/models/obj/heart.obj'
      } */
    ]);

    this.scene = null;
    this.modelShrink = 100;

    this.bvhStructure = {
      hips: {
        rightupleg: {
          rightleg: {
            rightfoot: {},
          },
        },
        leftupleg: {
          leftleg: {
            leftfoot: {},
          },
        },
        spine: {
          spine1: {
            spine2: {
              spine3: {
                neck: {
                  head: {},
                },
                rightshoulder: {
                  rightarm: {
                    rightforearm: {
                      righthand: {
                        righthandthumb1: {
                          righthandthumb2: {
                            righthandthumb3: {},
                          },
                        },
                        rightinhandindex: {
                          righthandindex1: {
                            righthandindex2: {
                              righthandindex3: {},
                            },
                          },
                        },
                        rightinhandmiddle: {
                          righthandmiddle1: {
                            righthandmiddle2: {
                              righthandmiddle3: {},
                            },
                          },
                        },
                        rightinhandring: {
                          righthandring1: {
                            righthandring2: {
                              righthandring3: {},
                            },
                          },
                        },
                        rightinhandpinky: {
                          righthandpinky1: {
                            righthandpinky2: {
                              righthandpinky3: {},
                            },
                          },
                        },
                      },
                    },
                  },
                },
                leftshoulder: {
                  leftarm: {
                    leftforearm: {
                      lefthand: {
                        lefthandthumb1: {
                          lefthandthumb2: {
                            lefthandthumb3: {},
                          },
                        },
                        leftinhandindex: {
                          lefthandindex1: {
                            lefthandindex2: {
                              lefthandindex3: {},
                            },
                          },
                        },
                        leftinhandmiddle: {
                          lefthandmiddle1: {
                            lefthandmiddle2: {
                              lefthandmiddle3: {},
                            },
                          },
                        },
                        leftinhandring: {
                          lefthandring1: {
                            lefthandring2: {
                              lefthandring3: {},
                            },
                          },
                        },
                        leftinhandpinky: {
                          lefthandpinky1: {
                            lefthandpinky2: {
                              lefthandpinky3: {},
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    this.bvhKeys = Common.getKeys(this.bvhStructure, '');

    this.hiddenParts = [
      // "hips"
    ];

    console.log('New Performer: ', this.inputId);

    this.effects = [/* 'constructor', */'vogue', 'cloner', /* 'datatags', */'trails', /*'particleSystem', 'midiStream'*/];

    // this.gui = new dat.GUI({ autoPlace: true });
    // this.guiFolder = this.gui.addFolder(this.name + ' Effects');
    // this.guiFolder.open()

    this.performerEffects = new PerformerEffects(this.parent, parseInt(this.color, 16));

    // this.addEffects(this.effects[0]);//defaults

    this.scaleInterval = null;
    this.colorInterval = null;
  }

  loadColladaModels(models) {
    _.each(models, (m) => {
      this.loadColladaModel(m.id, m.url, (model) => {
        // object.geometry = model.geometry;
      });
    });
  }

  loadColladaModel(id, url, callback) {
    const loader = new THREE.ColladaLoader();
    // console.log(loader);
    loader.callbackProgress = function (progress, result) {
      // console.log(progress);
    };
    loader.load(url, (result) => {
      const colladaScene = result.scene;
      // colladaScene.traverse( function ( object ) {
      this.setColladaScenes(id, colladaScene);
      callback(this.getColladaScenes(id));
      // }.bind(this) );
    });
  }

  loadFBXModels(models) {
    _.each(models, (m) => {
      this.loadFBXModel(m.id, m.url, (model) => {
        // object.geometry = model.geometry;
      });
    });
  }

  loadFBXModel(id, url, callback) {
    if (this.getModelGeo(id) !== undefined) { console.log('Geometry already exists.'); return this.getModelGeo(id); }

    const manager = new THREE.LoadingManager();
    manager.onProgress = (item, loaded, total) => {
      // console.log( item, loaded, total );
    };
    const onProgress = (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        // console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
      }
    };
    const onError = (xhr) => {
      console.error(xhr);
    };
    const loader = new THREE.FBXLoader(manager);
    // console.log(loader);
    loader.load(url, (object) => {
      object.mixer = new THREE.AnimationMixer(object);

      this.animationMixers.push(object.mixer);
      const action = object.mixer.clipAction(object.animations[0]);
      action.play();

      this.setColladaScenes(id, object);
      callback(this.getColladaScenes(id));
    }, onProgress, onError);
  }

  loadObjModels(models) {
    _.each(models, (m) => {
      this.loadObjModel(m.id, m.url, (model) => {
        // object.geometry = model.geometry;
      });
    });
  }

  loadObjModel(id, url, callback) {
    if (this.getModelGeo(id) !== undefined) { console.log('Geometry already exists.'); return this.getModelGeo(id); }

    // console.log("Loading...", typeof this.getModelGeo(id));

    const manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
      // console.log( item, loaded, total );
    };

    const onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        // console.log( Math.round(percentComplete, 2) + '% downloaded' );
      }
    };

    const onError = function (xhr) {};

    const loader = new THREE.OBJLoader(manager);
    // console.log(loader);
    loader.load(url, (object) => {
      let singleGeo = null;
      object.traverse((child) => {
        // console.log(child.name, child.type);
        if (child instanceof THREE.Mesh) {
          if (!singleGeo) {
            singleGeo = child.geometry;
          } else {
            child.updateMatrix();
            singleGeo.merge(child.geometry, child.matrix);
          }
        }
      });
      this.setModelGeo(id, singleGeo);
      callback(this.getModelGeo(id));
    }, onProgress, onError);
  }

  loadPerformer(source, type, hide, size, style, intensity) {
    switch (type) {
      case 'bvhMeshGroup':
        this.loadSceneBody(source, './models/json/avatar.json', hide, size, style, intensity);
        break;
      case 'riggedMesh':
        this.loadColladaBody(source, './models/dae/neuron-bones.dae', hide, size, style, intensity);
        break;
      case 'abstractLines':
        this.createAbstractLines(source, '', hide, size, style, intensity);
        break;
      case 'stickFigure':
        this.createStickFigure(source, '', hide, size, style, intensity);
        break;
    }
  }

  loadColladaBody(source, filename, hide, size, style, intensity) {
    this.prefix = 'robot_';

    this.setPerformer({
      meshes: {},
      newMeshes: [],
      keys: {},
      scene: null,
    });


    const loadingManager = new THREE.LoadingManager(() => {
      this.parent.add(this.getScene());
    });

    const loader = new THREE.ColladaLoader(loadingManager);

    loader.callbackProgress = function (progress, result) {
      // console.log(progress);
    };

    loader.load(filename, (result) => {
      const meshes = {};
      const newMeshes = {};
      const keys = {};
      let s = result.scene;

      // console.log(result.scene);
      s.traverse((object) => {
        //  // console.log(object.name + ": " + object.type);
        switch (object.type) {
          case 'SkinnedMesh':
            s = object;
      //      meshes[this.prefix+object.name.toLowerCase()] = object;
      //      keys[this.prefix+object.name.toLowerCase()] = this.prefix+object.name.toLowerCase();
      //      break;
        }
      });

      s.scale.set(size, size, size);
      // console.log(s.skeleton);

      _.each(s.skeleton.bones, (b) => {
        meshes[this.prefix + b.name.toLowerCase()] = b;
        b.srcScale = 0.1;
        newMeshes[this.prefix + b.name.toLowerCase()] = b;
        keys[this.prefix + b.name.toLowerCase()] = this.prefix + b.name.toLowerCase();
      });

      // console.log(meshes);
      // console.log(keys);

      this.setScene(s);
      window.s = s;
      this.parent.add(s);

      this.setPerformer({
        meshes,
        newMeshes,
        keys,
        scene: this.getScene(),
      });
    });
  }

  loadSceneBody(source, filename, hide, size, style, intensity) {
    this.prefix = 'robot_';
    const loader = new THREE.SceneLoader();

    loader.callbackProgress = (progress, result) => {
      // console.log(progress);
    };
    
    loader.load(filename, (result) => {
      result.scene.visible = false;
      console.log(result.scene);
      this.setScene(result.scene);
      
      this.getScene().scale.set(size, size, size);
      
      this.setPerformer(this.parseBVHGroup(source, hide, style, intensity));
      const s = this.getScene();
      s.position.copy(this.getOffset().clone());
      this.parent.add(s);
      // this.addEffects([
        // this.effects[4],
      //   // this.effects[6] // Midi Streamer
      // ]);// defaults
    });
  }

  createStickFigure(source, filename, hide, size, style, intensity) {
  }

  createAbstractLines(source, filename, hide, size, style, intensity) {
    // this.setScene(result.scene);
    // this.parent.add(s);

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
    var indices = [];
    var positions = [];
    var colors = [];
    
    positions.push( 0, 0, 0 );
    colors.push( Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1 );
    indices.push( 0, 0 + 1 );
    positions.push( 10, 0, 0 );
    colors.push( Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1 );
    indices.push( 1, 1 + 1 );
    
    geometry.setIndex( indices );
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.computeBoundingSphere();
    var mesh = new THREE.LineSegments( geometry, material );
    
    // this.setScene(mesh);
    // this.parent.add(mesh);

    const scene = new THREE.Object3D();
    scene.add(mesh);
    this.setScene(scene);
    console.log(source);
    switch (source) {
      default:
        case 'bvh':
        case 'clone_bvh':
          this.getScene().scale.set(size, size, size);
          break;
    }

    this.setPerformer({
      keys: this.bvhKeys,
      meshes: {},
      newMeshes: {},
      scene: scene,
    });
    const s = this.getScene();
    s.position.copy(this.getOffset().clone());
    this.parent.add(s);
    this.addEffects([
      /*this.effects[2], */
      // this.effects[6] // Midi Streamer
    ]);// defaults
  }

  setPerformer(performer) {
    this.performer = performer;
  }

  getPerformer() {
    return this.performer;
  }

  clearPerformer() {
    this.clearScene();
    this.setPerformer(null);
  }

  setType(type) {
    console.log(type);
    if (this.getType() !== type) {
      this.displayType = type;
      this.clearPerformer();
    }
  }

  getType(type) {
    return this.displayType;
  }

  getTypes(type) {
    return this.displayTypes;
  }

  clearScene() {
    this.parent.remove(this.getScene());
    this.scene = null;
  }

  setScene(scene) {
    this.scene = scene;
    this.scene.distances = {};
    this.scene.outputManager = this.outputManager;
  }

  getScene() {
    return this.scene;
  }

  getWireframe() {
    return this.wireframe;
  }

  getMaterialColor() {
    return this.color;
  }

  setMaterialColor(color) {
    this.color = color;
    this.updateMaterialColor();
  }

  updateMaterialColor() {
    _.each(this.getPerformer().meshes, (parent) => {
      parent.traverse((object) => {
        if (object.hasOwnProperty('material')) {
          object.material.color.set(parseInt(this.getMaterialColor(), 16));
        }
      });
    });
  }

  getStyleInt() {
    return this.styleInt;
  }

  setStyleInt(styleInt) {
    this.styleInt = styleInt;
  }

  getIntensity() {
    return this.intensity;
  }

  setIntensity(intensity) {
    this.intensity = intensity;
  }

  getStyles() {
    return this.styles;
  }

  getStyle() {
    return this.style;
  }

  getStyleId() {
    return this.styleId;
  }

  setStyleId(id) {
    this.styleId = id;
  }

  getNextStyle() {
    const styles = this.getStyles();
    let id = this.getStyleId();
    id++;
    if (id > styles.length - 1) {
      id = 0;
    }
    this.setStyleId(id);
    return styles[id];
  }

  getPrevStyle() {
    const styles = this.getStyles();
    let id = this.getStyleId();
    id--;
    if (id < 0) {
      id = styles.length - 1;
    }
    this.setStyleId(id);
    return styles[id];
  }

  setStyle(style) {
    this.style = style;
  }

  getHiddenParts() {
    return this.hiddenParts;
  }

  toggleVisible(val) {
    this.setVisible(!this.getVisible());
  }

  getVisible() {
    return this.visible;
  }

  setVisible(val) {
    this.visible = val;
    this.getScene().visible = val;
  }

  getMaterial() {
    return this.material;
  }

  setMaterial(val) {
    this.material = val;
  }

  getMaterials() {
    return this.materials;
  }

  generateMaterial() {
    let material = new THREE.MeshBasicMaterial(); 
    switch (this.getMaterial().toLowerCase()) {
      case 'lambert':
        material = new THREE.MeshLambertMaterial();
        break;
      default:
      case 'phong':
        material = new THREE.MeshPhongMaterial();
        break;
      case 'standard':
        material = new THREE.MeshStandardMaterial();
        break;
    }
    material.wireframe = this.getWireframe();
    material.color.set(parseInt(this.getMaterialColor(), 16));
    return material;
  }

  updateMaterial() {
    _.each(this.getPerformer().meshes, (parent) => {
      parent.traverse((object) => {
        if (object.hasOwnProperty('material')) {
          object.material = this.generateMaterial(this.getMaterial());
          object.material.needsUpdate = true;
        }
      });
    });
  }

  toggleTracking(val) {
    this.setTracking(!this.getTracking());
  }

  getTracking() {
    return this.tracking;
  }

  setTracking(val) {
    this.tracking = val;
  }

  clearTracking(val) {
    this.tracking = false;
  }

  updateIntensity(intensity) {
    this.setIntensity(intensity);
    // this.parseBVHGroup("bvh", this.getHiddenParts(), this.getStyle(), intensity);
    _.each(this.getPerformer().newMeshes, (mesh) => {
      mesh.scale.set(mesh.srcScale * intensity, mesh.srcScale * intensity, mesh.srcScale * intensity);
    });
  }

  updateStyle(style) {
    this.setStyle(style);
    this.getScene().visible=false;
    this.parseBVHGroup('bvh', this.getHiddenParts(), style, this.getIntensity());
  }

  parseBVHGroup(source, hide, style, intensity) {
    const meshes = {};
    const newMeshes = [];
    const keys = {};

    if (this.getStyleInt()) {
      clearInterval(this.getStyleInt());
      this.setStyleInt(null);
    }
    this.setStyleInt(setTimeout(
      () => {
        this.getScene().traverse((object) => {
          if (object.name.toLowerCase().match(/robot_/g)) {
            if (meshes[object.name.toLowerCase()] == undefined) {
              meshes[object.name.toLowerCase()] = object;
            }
            
            if (_.some(hide, el => _.includes(object.name.toLowerCase(), el))) {
              object.visible = false;
            } else {
              object.visible = this.visible;
            }

            object.castShadow = true;
            object.receiveShadow = true;
          }
          if (object.hasOwnProperty('material')) {
            object.material = this.generateMaterial(this.material);
            object.material.needsUpdate = true;
          }
          if (object instanceof THREE.Mesh) {
            switch (source) {
              case 'bvh':
              case 'clone_bvh':
                object.scale.set(2, 2, 2);
                break;
            }

            if (!object.srcBox) {
              object.geometry.computeBoundingBox();
              object.srcBox = object.geometry.boundingBox;
            }

            if (!object.srcSphere) {
              object.geometry.computeBoundingSphere();
              object.srcSphere = object.geometry.boundingSphere;
            }
            object.rotation.x = 0;
            switch (style) {
              case 'spheres':
                var scale = 0.075*6;// Common.mapRange(intensity, 1, 10, 0.01, 3)
                object.geometry = new THREE.SphereGeometry(
                  object.srcSphere.radius * scale,
                  10, 10,
                );
                object.srcScale = 1;
                break;

              case 'planes':
                var scale = 2;// Common.mapRange(intensity, 1, 10, 0.01, 1)
                object.geometry = new THREE.BoxGeometry(
                  1,
                  object.srcSphere.radius * scale, object.srcSphere.radius * scale,
                );
                object.srcScale = 1;
                break;

              case 'boxes':
                var scale = 0.125*6;// Common.mapRange(intensity, 1, 10, 0.01, 5)
                object.geometry = new THREE.BoxGeometry(
                  object.srcSphere.radius * scale,
                  object.srcSphere.radius * scale,
                  object.srcSphere.radius * scale,
                );
                object.srcScale = 1;
                break;

              case 'robot':
                var scale = 0.5*2;// Common.mapRange(intensity, 1, 10, 0.01, 2)
                object.geometry = new THREE.BoxGeometry(
                  object.srcBox.max.x * scale,
                  object.srcBox.max.z * scale,
                  object.srcBox.max.y * scale,
                );
                object.srcScale = 1;
                break;

              case 'discs':
                var scale = 0.5*2;// Common.mapRange(intensity, 1, 10, 0.01, 2)
                object.geometry = new THREE.CylinderGeometry(
                  object.srcBox.max.x * scale,
                  object.srcBox.max.x * scale,
                  object.srcBox.max.y * scale,
                  10,
                );
                object.srcScale = 1;
                break;

              case 'oct':
                var scale = 0.1*2;// Common.mapRange(intensity, 1, 10, 0.01, 2)
                object.geometry = new THREE.TetrahedronGeometry(object.srcSphere.radius * scale, 1);
                object.geometry.needsUpdate = true;
                object.srcScale = 1;
                break;

              case 'hands':
                object.geometry = this.getModelGeo('hand');
                object.geometry.needsUpdate = true;
                object.srcScale = object.srcSphere.radius * 0.01;
                object.scale.set(object.srcScale*7, object.srcScale*7, object.srcScale*7);
                break;

              case 'heads':
                object.geometry = this.getModelGeo('head');
                object.geometry.needsUpdate = true;
                object.rotation.x = Math.PI;
                object.srcScale = object.srcSphere.radius * 0.1;
                object.scale.set(object.srcScale*10, object.srcScale*10, object.srcScale*10);
                break;

              case 'hearts':
                object.geometry = this.getModelGeo('heart');
                object.geometry.needsUpdate = true;
                object.srcScale = object.srcSphere.radius * 0.001;
                object.scale.set(object.srcScale, object.srcScale, object.srcScale);
                break;

              case 'chairs':
                object.geometry = this.getModelGeo('chair');
                object.geometry.needsUpdate = true;
                object.srcScale = object.srcSphere.radius * 0.001;
                object.scale.set(object.srcScale, object.srcScale, object.srcScale);
                break;

              case 'oxygen':
                object = this.getColladaScenes('oxygen');
                object.srcScale = object.srcSphere.radius * 0.1;
                object.scale.set(object.srcScale, object.srcScale, object.srcScale);
                break;

              case 'lines':
                var l = 0;
                var longest = null;
                if (object.srcBox.max.x > l) { l = object.srcBox.max.x; longest = 'x'; }
                if (object.srcBox.max.y > l) { l = object.srcBox.max.y; longest = 'y'; }
                if (object.srcBox.max.z > l) { l = object.srcBox.max.z; longest = 'z'; }

                l = new THREE.Vector3();
                l[longest] = object.srcBox.max[longest];

                // console.log(l);

                var lineGeo = new THREE.Geometry();
                lineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
                lineGeo.vertices.push(l);

                var lineMat = new THREE.LineBasicMaterial({
                  color: 0xffffff,
                  linewidth: 10,
                });

                object = new THREE.Line(lineGeo, lineMat);
                object.srcScale = 1;
                break;
            }

            object.castShadow = true;
            object.receiveShadow = true;
            newMeshes.push(object);
          }
        });
      },
      250,
    ));
  this.getScene().visible=true;
    return {
      keys: this.bvhKeys,
      meshes,
      newMeshes,
      scene,
    };
  }

  getModelGeo(id) {
    // console.log("Fetching geometry: ", id, this.modelGeos[id]);
    return this.modelGeos[id];
  }

  setModelGeo(id, model) {
    this.modelGeos[id] = model;
    // console.log("Adding geometry: " + id, this.modelGeos);
  }

  getColladaScenes(id) {
    // console.log("Fetching Animated Mesh: ", id, this.colladaScenes[id]);
    return this.colladaScenes[id];
  }

  setColladaScenes(id, mesh) {
    this.colladaScenes[id] = mesh;
    // console.log("Adding Animated Mesh: " + id, this.colladaScenes);
  }

  updateParameters(data) {
    switch (data.parameter) {
        case 'rate':
          this.performerEffects.updateParameters(data);
          break;
        case 'life':
        this.performerEffects.updateParameters(data);
          break;
      }
  }

  addEffects(effects) {
    _.each(effects, (effect) => {
      this.addEffect(effect);
    });
  }

  removeEffects(effects) {
    _.each(effects, (effect) => {
      this.removeEffect(effect);
    });
  }

  addEffect(effect) {
    this.performerEffects.add(effect);
  }

  removeEffect(effect) {
    this.performerEffects.remove(effect);
  }

  getScene() {
    return this.scene;
  }

  resetOffset() {
    this.offset = new THREE.Vector3();
    
    const s = this.getScene();
    s.position.copy(new THREE.Vector3());
  }

  getOffset() {
    return this.offset;
  }

  setOffset(val) {
    this.offset = val.clone();
    
    const s = this.getScene();
    s.position.copy(val.clone());
  }

  setPosition(val) {
    this.offset = new THREE.Vector3();
    
    const s = this.getScene();
    s.position.copy(val.clone());
  }

  resetPosition() {
    this.offset = new THREE.Vector3();
    
    const s = this.getScene();
    s.position.set(0, 0, 0);
  }

  setScale(val) {
    this.scale = this.origScale + val;  
    const s = this.getScene();
    s.scale.set(this.scale, this.scale, this.scale)
  }

  getRotation() {
    return this.rotation;
  }

  setRotation(val) {
    this.rotation = val;
    const s = this.getScene();
    s.rotation.copy(this.rotation.clone());
  }

  resetRotation() {
    this.offset = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Vector3(0, 0, 0);
    const s = this.getScene();
    s.rotation.set(0, 0, 0);
    s.position.set(0, 0, 0);
  }

  getDelay() {
    return this.delay;
  }

  setDelay(val) {
    this.delay = val;
    this.clearDataBuffer();
  }

  getDataBuffer() {
    return this.dataBuffer;
  }

  clearDataBuffer() {
    this.dataBuffer = [];
  }

  setDataBuffer(buffer) {
    this.dataBuffer = buffer;
  }

  randomizeAll(switchTime) {
    // var parts = ['head', 'leftshoulder', 'rightshoulder', 'leftupleg',  'rightupleg'];
    
    _.each(this.bvhKeys, (part) => {
      this.scalePart(part, Common.mapRange(Math.random(), 0, 1, 0.25, 3), switchTime);
    });
    if (this.scaleInterval) {
      clearInterval(this.scaleInterval);
    }
    this.scaleInterval = setInterval(() => {
      _.each(parts, (part) => {
        this.scalePart(part, Common.mapRange(Math.random(), 0, 1, 0.25, 3), switchTime);
      });
    }, switchTime);
  }

  setColor(color) {
    this.getScene().traverse((part) => {
      if (part.hasOwnProperty('material')) {
        part.material.color.set(parseInt(color, 16));
        part.material.needsUpdate = true;
      }
    });
  }

  randomizeColors(switchTime) {
    this.getScene().traverse((part) => {
      if (part.hasOwnProperty('material')) {
        // part.material = new THREE.MeshPhongMaterial();
        part.material.wireframe = this.wireframe;
        part.material.color.set(this.colors[Common.mapRange(Math.random(), 0, 1, 0, this.colors.length - 1)]);

        part.material.needsUpdate = true;
      }
    });
    if (this.colorInterval) {
      clearInterval(this.colorInterval);
    }
    this.colorInterval = setInterval(() => {
      this.getScene().traverse((part) => {
        if (part.hasOwnProperty('material')) {
          // part.material = new THREE.MeshPhongMaterial();
          part.material.wireframe = this.wireframe;
          part.material.color.set(this.colors[Common.mapRange(Math.random(), 0, 1, 0, this.colors.length - 1)]);

          part.material.needsUpdate = true;
        }
      });
    }, switchTime);
  }

  randomizeLimbs(switchTime) {
    const parts = ['head', 'leftshoulder', 'rightshoulder', 'leftupleg', 'rightupleg'];
    _.each(parts, (part) => {
      this.scalePart(part, Common.mapRange(Math.random(), 0, 1, 0.75, 1.5), switchTime);
    });
    if (this.scaleInterval) {
      clearInterval(this.scaleInterval);
    }
    this.scaleInterval = setInterval(() => {
      _.each(parts, (part) => {
        this.scalePart(part, Common.mapRange(Math.random(), 0, 1, 0.75, 1.5), switchTime);
      });
    }, switchTime);
  }

  resetScale() {
    if (this.scaleInterval) {
      clearInterval(this.scaleInterval);
    }

    _.each(this.bvhKeys, (partname) => {
      const part = this.getPerformer().meshes[`robot_${partname}`];
      part.scale.set(1, 1, 1);
    });
  }

  scalePart(partname, scale, animTime) {
    const part = this.getPerformer().meshes[`robot_${partname}`];
    const s = { x: part.scale.x };
    if (part) {
      const tween = new TWEEN.Tween(s)
        .to({ x: scale }, animTime)
        .onUpdate(() => {
          part.scale.set(s.x, s.x, s.x);
        })
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }
  }

  hidePart(partname) {
    const part = this.getPerformer().meshes[`robot_${partname}`];
    if (part) {
      part.visible = false;
    }
  }

  rotatePart(partname, rotation) {
    const part = this.getPerformer().meshes[`robot_${partname}`];

    if (part) {
      part.rotation.set(rotation.x, rotation.y, rotation.z);
    }
  }

  unParentPart(partname, freeze) {
    const part = this.getPerformer().meshes[`robot_${partname}`];

    if (part) {
      part.position.add(this.getPerformer().meshes.robot_hips.position);
      part.parent = this.getScene();

      if (freeze) {
        switch (partname) {
          case 'leftshoulder':
            var parts = ['robot_leftshoulder',
              'robot_leftarm', 'robot_leftforearm', 'robot_lefthand',
              'robot_lefthandthumb1', 'robot_lefthandthumb2', 'robot_lefthandthumb3',
              'robot_leftinhandindex', 'robot_lefthandindex1', 'robot_lefthandindex2', 'robot_lefthandindex3',
              'robot_leftinhandmiddle', 'robot_lefthandmiddle1', 'robot_lefthandmiddle2', 'robot_lefthandmiddle3',
              'robot_leftinhandring', 'robot_lefthandring1', 'robot_lefthandring2', 'robot_lefthandring3',
              'robot_leftinhandpinky', 'robot_lefthandpinky1', 'robot_lefthandpinky2', 'robot_lefthandpinky3'];
            this.getPerformer().meshes = _.omit(this.getPerformer().meshes, parts);
            break;
          case 'rightshoulder':
            var parts = ['robot_rightshoulder',
              'robot_rightarm', 'robot_rightforearm', 'robot_righthand',
              'robot_righthandthumb1', 'robot_righthandthumb2', 'robot_righthandthumb3',
              'robot_rightinhandindex', 'robot_righthandindex1', 'robot_righthandindex2', 'robot_righthandindex3',
              'robot_rightinhandmiddle', 'robot_righthandmiddle1', 'robot_righthandmiddle2', 'robot_righthandmiddle3',
              'robot_rightinhandring', 'robot_righthandring1', 'robot_righthandring2', 'robot_righthandring3',
              'robot_rightinhandpinky', 'robot_righthandpinky1', 'robot_righthandpinky2', 'robot_righthandpinky3'];
            this.getPerformer().meshes = _.omit(this.getPerformer().meshes, parts);
            break;
          case 'leftupleg':
            var parts = ['robot_leftupleg', 'robot_leftleg', 'robot_leftfoot'];
            this.getPerformer().meshes = _.omit(this.getPerformer().meshes, parts);
            break;
          case 'rightupleg':
            var parts = ['robot_rightupleg', 'robot_rightleg', 'robot_rightfoot'];
            this.getPerformer().meshes = _.omit(this.getPerformer().meshes, parts);
            break;
          case 'head':
            var parts = ['robot_head'];
            this.getPerformer().meshes = _.omit(this.getPerformer().meshes, parts);
            break;
        }
      }
    }
  }

  showWireframe() {
    this.wireframe = true;
    _.each(this.getPerformer().meshes, (parent) => {
      parent.traverse((object) => {
        if (object.hasOwnProperty('material')) {
          object.material.wireframe = this.wireframe;
        }
      });
    });
  }

  hideWireframe() {
    this.wireframe = false;
    _.each(this.getPerformer().meshes, (parent) => {
      parent.traverse((object) => {
        if (object.hasOwnProperty('material')) {
          object.material.wireframe = this.wireframe;
        }
      });
    });
  }

  toggleWireframe() {
    this.wireframe = !this.wireframe;
    _.each(this.getPerformer().meshes, (parent) => {
      parent.traverse((object) => {
        if (object.hasOwnProperty('material')) {
          object.material.wireframe = this.wireframe;
        }
      });
    });
  }

  distanceBetween(part1, part2) {
    var part1 = this.getPerformer().meshes[`robot_${part1}`]; // find first body part by name
    var part2 = this.getPerformer().meshes[`robot_${part2}`]; // find second body part by name
    if (part1 && part2) { // do they both exist?
      const joint1Global = new THREE.Vector3().setFromMatrixPosition(part1.matrixWorld);// we need the global position
      const joint2Global = new THREE.Vector3().setFromMatrixPosition(part2.matrixWorld);// we need the global position
      return joint1Global.distanceTo(joint2Global);// how far apart are they?
    }
    return 0;
  }

  calculateDistances(data) {
    this.head = new THREE.Vector3();
    this.head.set(  
      _.filter(data, ['name', 'head'])[0].position.x,
      _.filter(data, ['name', 'head'])[0].position.y,
      _.filter(data, ['name', 'head'])[0].position.z,
    );

    this.lefthand = new THREE.Vector3();
    this.lefthand.set(
      _.filter(data, ['name', 'lefthand'])[0].position.x,
      _.filter(data, ['name', 'lefthand'])[0].position.y,
      _.filter(data, ['name', 'lefthand'])[0].position.z,
    );
    this.righthand = new THREE.Vector3();
    this.righthand.set(
      _.filter(data, ['name', 'righthand'])[0].position.x,
      _.filter(data, ['name', 'righthand'])[0].position.y,
      _.filter(data, ['name', 'righthand'])[0].position.z,
    );

    this.leftfoot = new THREE.Vector3();
    this.leftfoot.set(
      _.filter(data, ['name', 'leftfoot'])[0].position.x,
      _.filter(data, ['name', 'leftfoot'])[0].position.y,
      _.filter(data, ['name', 'leftfoot'])[0].position.z,
    );
    
    this.rightfoot = new THREE.Vector3();
    this.rightfoot.set(
      _.filter(data, ['name', 'rightfoot'])[0].position.x,
      _.filter(data, ['name', 'rightfoot'])[0].position.y,
      _.filter(data, ['name', 'rightfoot'])[0].position.z,
    );

    return {
      hands: this.lefthand.distanceTo(this.righthand),
      feet: this.leftfoot.distanceTo(this.rightfoot),
      leftHalf: this.lefthand.distanceTo(this.leftfoot),
      rightHalf: this.righthand.distanceTo(this.rightfoot),
      leftCross: this.lefthand.distanceTo(this.rightfoot),
      rightCross: this.righthand.distanceTo(this.leftfoot),
      leftHeadToe: this.head.distanceTo(this.leftfoot),
      rightHeadToe: this.head.distanceTo(this.rightfoot),
    };
  }

  update(data) {
    const d = _.cloneDeep(data);
    this.dataBuffer.push(d);
    if (this.dataBuffer.length > (this.delay * 60)) { // Number of seconds * 60 fps
      this.updateFromPN(this.dataBuffer.shift());
    }
    this.performerEffects.update(this.getScene(), d, this.calculateDistances(d));
  }

  updateFromPN(data) {
    for (let i = 0; i < data.length; i++) {
      const jointName = this.prefix + data[i].name.toLowerCase();
      if (this.getPerformer() == null) {
        let size = 1 / this.modelShrink;
        this.origScale = size;

        console.log(this.type);
        switch (this.type) {
          case 'bvh':
          case 'clone_bvh':
            size = (1 / this.modelShrink) / 2;
            this.origScale = size;
            break;
        }
        this.loadPerformer(
          this.type,
          this.getType().value,
          this.hiddenParts,
          size,
          this.style,
          this.intensity,
        );
      } else if (this.getPerformer().meshes[jointName]) {
        // console.log(this.getPerformer().meshes[jointName]);
        this.getPerformer().meshes[jointName].position.set(
          data[i].position.x,
          data[i].position.y,
          data[i].position.z,
        );

        this.getPerformer().meshes[jointName].quaternion.copy(data[i].quaternion);
      }
    }
  }
}

module.exports = Performer;
