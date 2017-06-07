import _ from 'lodash'

var THREE = require('three');

import config from './../config'

class IslandEnvironment {
	constructor(renderer, parent, guiFolder) {
		this.parent = parent;
		this.guiFolder = guiFolder;

		this.floorSize = 50;
		this.numLines = 50;

        this.tick = 0;

		this.gridFloor;
		this.hemiLight;
		this.dirLight;

		var f = this.guiFolder.addFolder("Island");
		f.add(this, "floorSize", 1, 100).step(1).name("Size").onChange(this.redrawGrid.bind(this));
		f.add(this, "numLines", 1, 100).step(1).name("# Lines").onChange(this.redrawGrid.bind(this));

		this.initFloor(this.floorSize, this.numLines);
		this.initLights();

		for (var i=0; i < 4; i++) {
            var mountain1 = new this.initMountain();
            this.env.add(mountain1.threegroup);
            mountain1.threegroup.position.x = Math.random() * 700 - 350;
            mountain1.threegroup.position.z = Math.random() * 700 - 350;
        }


		this.parent.fog = new THREE.Fog(0xece9ca, 500, 2000);
	}

	initFloor(floorSize, numLines) {
        // this.gridFloor = new THREE.GridHelper( floorSize/2, numLines);
        // this.gridFloor.castShadow = true;
        // this.gridFloor.receiveShadow = true;
        //
        // this.floorMat  = new THREE.MeshPhongMaterial( { color: 0xD6A958 } );
        //
        // this.floor = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 6, 6 ), this.floorMat );
        // this.floor.receiveShadow = true;
        // this.floor.castShadow = true;
        // this.floor.rotation.x = -Math.PI/2;
        //
        // this.parent.add(this.floor);


        this.env = new THREE.Group();

        var waterGeo = new THREE.BoxGeometry(1000, 1000, 100, 22, 22);
        for (var i = 0; i < waterGeo.vertices.length; i++) {
            var vertex = waterGeo.vertices[i];
            if (vertex.z > 0)
                vertex.z += Math.random() * 2 - 1;
            vertex.x += Math.random() * 5 - 2.5;
            vertex.y += Math.random() * 5 - 2.5;

            vertex.wave = Math.random() * 100;
        }

        waterGeo.computeFaceNormals();
        waterGeo.computeVertexNormals();

        var floor = new THREE.Mesh(waterGeo, new THREE.MeshPhongMaterial({
            color: 0x6092c1,
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
        }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -105;
        floor.receiveShadow = true;
        floor.name = "Floor"
        this.env.floor = floor;

        this.env.add(floor);

        var islandGeo = new THREE.PlaneGeometry(700, 700, 60, 60);
        var zeroVector = new THREE.Vector3();

        var mods = [];
        var modVector;
        var modAmount = 0;//Math.floor(Math.random() * 6 + 1)

        for (var j = 0; j < modAmount; j++) {
            var modVector = new THREE.Vector3(Math.random() * 350, Math.random() * 350, 0);
            modVector.radius = Math.random() * 400;
            modVector.dir = Math.random() * 1 - .6 + modVector.radius / 5000;
            mods.push(modVector)
        }
        var midY = 0;
        for (var i = 0; i < islandGeo.vertices.length; i++) {
            var vertex = islandGeo.vertices[i];
            //if(vertex.distanceTo(zeroVector) < 300)
            // {

            vertex.z = -vertex.distanceTo(zeroVector) * .15 + 15 + Math.random() * 3 - 6;

            for (var j = 0; j < mods.length; j++) {
                var modVector = mods[j];

                if (vertex.distanceTo(modVector) < modVector.radius)
                    vertex.z += vertex.distanceTo(modVector) / 2 * modVector.dir;

            }

            //}

            vertex.y += Math.random() * 20 - 10;
            vertex.x += Math.random() * 20 - 10;
            midY += vertex.z;

        }

        midY = midY / islandGeo.vertices.length;

        islandGeo.computeFaceNormals();
        islandGeo.computeVertexNormals();
        // var island = new THREE.Mesh(islandGeo, new THREE.MeshLambertMaterial({
        var island = new THREE.Mesh(islandGeo, new THREE.MeshPhongMaterial({
            color: 0x9bb345,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide,
            wireframe: false
        }));
        island.rotation.x = -Math.PI / 2;
        island.position.y = -14;
        island.receiveShadow = true;
        island.castShadow = true;
        island.name = "island"
        this.env.island = island;
        this.env.add(island);



        this.parent.add(this.env);


//        this.parent.add( this.gridFloor );
	}


	initLights(scene, camera) {
		// this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		// this.hemiLight.color.setHSL( 0.6250011825856442, 60.75949367088608, 30.980392156862745 );
		// this.hemiLight.groundColor.setHSL( 4.190951334017909e-8, 33.68421052631579, 37.254901960784316 );
		// this.hemiLight.position.set( 0, 500, 0 );
		// this.parent.add( this.hemiLight );
        //
		// this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		// this.dirLight.position.set( -1, 0.75, 1 );
		// this.dirLight.position.multiplyScalar( 50);
		// this.dirLight.name = 'dirlight';
        //
		// this.parent.add( this.dirLight );
        //
		// this.dirLight.castShadow = true;
        //
		// this.dirLight.shadow.mapSize.width = this.dirLight.shadow.mapSize.height = 1024 * 2;
        //
		// var d = 300;
        //
		// this.dirLight.shadow.camera.left = -d;
		// this.dirLight.shadow.camera.right = d;
		// this.dirLight.shadow.camera.top = d;
		// this.dirLight.shadow.camera.bottom = -d;
        //
		// this.dirLight.shadow.camera.far = 3500;
		// this.dirLight.shadow.bias = -0.0001;
		// this.dirLight.shadow.darkness = 0.35;
        //
		// this.dirLight.shadow.camera.visible = true;

        this.light = new THREE.HemisphereLight(0xffffff, 0xb3858c, .65);

        this.shadowLight = new THREE.DirectionalLight(0xffe79d, .7);
        this.shadowLight.position.set(80, 120, 50);
        this.shadowLight.castShadow = true;
        this.shadowLight.shadowDarkness = .3;
        this.shadowLight.shadowMapWidth = 2048;
        this.shadowLight.shadowMapHeight = 2048;

        this.backLight = new THREE.DirectionalLight(0xffffff, .4);
        this.backLight.position.set(200, 100, 100);
        this.backLight.shadowDarkness = .1;
        //backLight.castShadow = true;

        this.parent.add(this.backLight);
        this.parent.add(this.light);
        this.parent.add(this.shadowLight);
	}

    initMountain() {

        this.greyMat = new THREE.MeshPhongMaterial({
            color: 0xa99a9d,
            shading: THREE.FlatShading,
            wireframe: false,
            side: THREE.DoubleSide
        });

        this.threegroup = new THREE.Group();

        /* var boxGeom = new THREE.CylinderGeometry(20 + Math.random() * 50, 76 + Math.random() * 200, Math.random() * 400 + 50, 20, 20, false);
         */
        var zeroVector = new THREE.Vector3();
        var size = Math.random() * 200 + 100;
        var heightScale = Math.random() * .5 + 2;
        var boxGeom = new THREE.PlaneGeometry(size, size, 8 + Math.floor(Math.random() * 3), 8 + Math.floor(Math.random() * 3));

        for (var i = 0; i < boxGeom.vertices.length; i++) {

            var vertex = boxGeom.vertices[i];
            // vertex.x =0;
            vertex.z = (-vertex.distanceTo(zeroVector) * .5) * heightScale + 15 + Math.random() * 3 - 6;

            vertex.y += Math.random() * 10 - 5;
            vertex.x += Math.random() * 10 - 5;
            vertex.z += Math.random() * 20 - 10;

        }
        boxGeom.computeFaceNormals();
        boxGeom.computeVertexNormals();

        this.boxMesh = new THREE.Mesh(boxGeom, this.greyMat);
        var box = new THREE.Box3().setFromObject(this.boxMesh);
        console.log(box);
        this.boxMesh.position.y = Math.random() * 15 + 10;
        this.boxMesh.rotation.x = -Math.PI / 2;
        this.threegroup.add(this.boxMesh);

        this.threegroup.traverse(function(object) {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

    }

	remove() {
        this.parent.remove( this.env );
        this.guiFolder.removeFolder("Island");
	}

	redrawGrid() {
		this.parent.remove( this.gridFloor );
		this.initFloor(this.floorSize, this.numLines);
	}

	update() {
        if (this.env && this.env.floor) {
            for (var i = 0; i < this.env.floor.geometry.vertices.length; i++) {
                var vertex = this.env.floor.geometry.vertices[i];
                if (vertex.z > 0)
                    vertex.z += Math.sin(this.tick * .015 + vertex.wave) * 0.04;

                //   vertex.x += Math.cos(tick*.01) * vertex.wave;
                //vertex.y += Math.sin(tick*.01) * vertex.wave;

            }
            this.env.floor.geometry.verticesNeedUpdate = true;
        }
    }
}

module.exports = IslandEnvironment;