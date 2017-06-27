import _ from 'lodash'
var THREE = require('three');
var GPUParticleSystem = require('./../../libs/three/GPUParticleSystem');

import config from './../../config'

class ParticleSystem {
	constructor(parent, color, guiFolder) {
		this.parent = parent;
		this.systems = [];
		this.color = color;
		this.guiFolder = guiFolder;
		this.targets = [/*"hips",
		"rightupleg", "rightleg",*/ "rightfoot",
		/*"leftupleg", "leftleg",*/ "leftfoot",
		/*"spine", "spine3",*/ "head",
		/*"rightarm", "rightforearm",*/ "righthand",
		/*"leftarm", "leftforearm", */"lefthand"
		];

		// options passed during each spawned
		this.options = {
			positionRandomness: 0.05,
			velocity: new THREE.Vector3(),
			velocityRandomness: 0.05,
			color: this.color,
			colorRandomness: 0.01,
			turbulence: 0,
			lifetime: 1,
			size: 15,
			sizeRandomness: 15,
			position: new THREE.Vector3()
		};
		this.spawnerOptions = {
			spawnRate: 400,
			horizontalSpeed: 1.0,
			verticalSpeed: 2.0,
			timeScale: 1
		};

		this.addToDatGui(this.options, this.spawnerOptions, this.guiFolder);
	}

	addToDatGui(options, spawnerOptions, guiFolder) {
		var f = guiFolder.addFolder("ParticleSystem");
		f.add(options, "velocityRandomness", 0, 30).listen();
		f.add(options, "positionRandomness", 0, 30).listen();
		f.add(options, "size", 1, 200).listen();
		f.add(options, "sizeRandomness", 0, 250).listen();
		f.add(options, "colorRandomness", 0, 10).listen();
		f.add(options, "lifetime", .1, 100).listen();
		f.add(options, "turbulence", 0, 10).listen();
		f.add(spawnerOptions, "spawnRate", 10, 3000).listen();
		f.add(spawnerOptions, "timeScale", -2, 2).listen();
	}

	updateParameters(data) {
		switch(data.parameter) {
    		case 'life':
    			this.options.lifetime = data.value*100;
    			break;
    		case 'rate':
				this.spawnerOptions.spawnRate = data.value*3000;
				break;
			case 'size':
				this.options.size = data.value*200;
				break;
			case 'color':
				this.options.colorRandomness = data.value*10;
				break;
    	}
	}

	update(data) {
		var idx = 0;
		data.traverse( function ( d ) {
			if (_.filter(this.targets,function(t){return "robot_"+t == d.name.toLowerCase();}).length>0) {
				if (!this.systems[idx]) {
					this.systems[idx] = new THREE.GPUParticleSystem({
						maxParticles: 3000,
					});

					this.systems[idx].clock = new THREE.Clock(true);
					this.systems[idx].tick = 0;
					this.systems[idx].o = {
						position: new THREE.Vector3()
					};
					this.systems[idx].options = this.options;
					this.systems[idx].spawnerOptions = this.spawnerOptions;

					this.parent.add(this.systems[idx]);
				}

				var oldPos = this.systems[idx].options.position;
				this.systems[idx].options.position = new THREE.Vector3().setFromMatrixPosition( d.matrixWorld );

				// this.systems[idx].spawnerOptions.horizontalSpeed = (this.systems[idx].options.position.x-oldPos.x);
				// this.systems[idx].spawnerOptions.verticalSpeed = (this.systems[idx].options.position.y-oldPos.y);
				// this.systems[idx].options.position.y = Math.sin( tick * this.spawnerOptions.verticalSpeed ) * 10;
				// this.systems[idx].options.position.z = Math.sin( tick * this.spawnerOptions.horizontalSpeed + this.spawnerOptions.verticalSpeed ) * 5;

				// var pos = new THREE.Vector3();
				// pos.x = Math.sin( this.systems[idx].tick * this.systems[idx].spawnerOptions.horizontalSpeed ) * 0.1;
				// pos.y = Math.sin( this.systems[idx].tick * this.systems[idx].spawnerOptions.verticalSpeed ) * 0.05;
				// pos.z = Math.sin( this.systems[idx].tick * this.systems[idx].spawnerOptions.horizontalSpeed + this.systems[idx].spawnerOptions.verticalSpeed ) * 0.25;

				// this.systems[idx].options.position.add(pos);
				
				var delta = this.systems[idx].clock.getDelta() * this.systems[idx].spawnerOptions.timeScale;
				this.systems[idx].tick += delta;

				if (this.systems[idx].tick < 0) this.systems[idx].tick = 0;
				
				if (delta > 0) {
					for (var x = 0; x < this.systems[idx].spawnerOptions.spawnRate * delta; x++) {
						this.systems[idx].spawnParticle(this.systems[idx].options);
					}
				}

				this.systems[idx].update(this.systems[idx].tick);

				idx++;
			}
		}.bind(this));
	}
}

module.exports = ParticleSystem;