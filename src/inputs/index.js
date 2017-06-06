/* This class interfaces with various input
methods and handles response data and
callbacks to the threejs environment.
The input list is defined in config/index.js*/

var THREE = require('three');
import _ from 'lodash'
import TWEEN from 'tween'

import config from './../config'

import Myo from './Myo'
import KinectTransport from './KinectTransport'
import KeyboardController from './KeyboardController'
import NeuroSky from './NeuroSky'
import PerceptionNeuron from './PerceptionNeuron'
import Gamepads from './Gamepads'

class InputManager {
	constructor(inputList, threeScene, parent) {
		this.inputs = {};
		this.scene = threeScene; //bridge to threejs environment 
		this.parent = parent; //bridge to react environment

		//connect all inputs in the input list
		_.forEach(inputList, this.connectInputs.bind(this)); //input list defined in config/index.js
	}

	connectInputs(type) {
		switch (type) { //input list defined in config/index.js
		case 'keyboard':
			this.inputs[type] = new KeyboardController();
			this.initKeyboardCallbacks();
			break;
		case 'kinecttransport':
			this.inputs[type] = new KinectTransport();
			this.initKinectTransportCallbacks();
			break;
		case 'myo':
			this.inputs[type] = new Myo();
			this.initMyoCallbacks();
			break;
		case 'neurosky':
			this.inputs[type] = new NeuroSky();
			this.initNeuroSkyCallbacks();
			break;
		case 'perceptionNeuron':
			this.inputs[type] = new PerceptionNeuron('ws://'+window.location.hostname+':' + config.perceptionNeuron.port);
			this.initPerceptionNeuronCallbacks();
			break;
		case 'gamepads':
			this.inputs[type] = new Gamepads('ws://'+window.location.hostname+':' + config.gamepads.ports.outgoing);
			break;
		};
	}

	registerCallback(input, event, callback) {
		if (this.inputs[input]) {
			this.inputs[input].on(event, callback);
		}
	}

	initPerceptionNeuronCallbacks() {
		this.registerCallback('perceptionNeuron', 'message', this.parent.updatePerformers);
	}

	initNeuroSkyCallbacks() { //https://github.com/elsehow/mindwave
		this.registerCallback('mindwave', 'data', function(data) { console.log(data); });
	}

	initMyoCallbacks() { //https://github.com/thalmiclabs/myo.js/blob/master/docs.md
		this.registerCallback('myo', 'imu', function(data) { console.log(data); });
	}

	initKinectTransportCallbacks() { //Reuires Kinect Transport app.
		/*https://github.com/stimulant/MS-Cube-SDK/tree/research/KinectTransport
		Returns either depth or bodies object.*/
		this.registerCallback('kinecttransport', 'depth', this.scene.viewKinectTransportDepth.bind(this.scene));
		this.registerCallback('kinecttransport', 'bodies', this.scene.viewKinectTransportBodies.bind(this.scene));
	}

	initKeyboardCallbacks() { // Uses mousetrap: https://github.com/ccampbell/mousetrap
		this.registerCallback('keyboard', 'space', this.parent.toggleOverlay);
		this.registerCallback('keyboard', 'f', this.parent.toggleFullscreen);
		
		this.registerCallback('keyboard', '1', function() { this.switchEnvironment("grid"); }.bind(this.scene));
		this.registerCallback('keyboard', '2', function() { this.switchEnvironment("gradient"); }.bind(this.scene));

		//Camera positions
		this.registerCallback('keyboard', 'r', this.scene.toggleRotation.bind(this.scene));

		this.registerCallback('keyboard', 'q', function() {
			this.cameraControl.fly_to(
				config.camera.closeShot.position,
				new THREE.Vector3(0,0,0),
				config.camera.closeShot.look,
				TWEEN.Easing.Quadratic.InOut,
				'path',
				3000,
				10,
				function(){ console.log("Camera moved!"); }
			);
		}.bind(this.scene));

		this.registerCallback('keyboard', 'w', function() {
			this.cameraControl.fly_to(
				config.camera.mediumShot.position,
				new THREE.Vector3(0,0,0),
				config.camera.mediumShot.look,
				TWEEN.Easing.Quadratic.InOut,
				'path',
				3000,
				10,
				function(){ console.log("Camera moved!"); }
			);
		}.bind(this.scene));

		this.registerCallback('keyboard', 'e', function() {
			this.cameraControl.fly_to(
				config.camera.wideShot.position,
				new THREE.Vector3(0,0,0),
				config.camera.wideShot.look,
				TWEEN.Easing.Quadratic.InOut,
				'path',
				3000,
				10,
				function(){ console.log("Camera moved!"); }
			);
		}.bind(this.scene));

		this.registerCallback('keyboard', 'a', function() {
			this.cameraControl.jump(
				config.camera.closeShot.position,
				config.camera.closeShot.look
			);
		}.bind(this.scene));

		this.registerCallback('keyboard', 's', function() {
			this.cameraControl.jump(
				config.camera.mediumShot.position,
				config.camera.mediumShot.look
			);
		}.bind(this.scene));

		this.registerCallback('keyboard', 'd', function() {
			this.cameraControl.jump(
				config.camera.wideShot.position,
				config.camera.wideShot.look
			);
		}.bind(this.scene));
	}
}

module.exports = InputManager;