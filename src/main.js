import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js';

import Stats from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/libs/stats.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/controls/OrbitControls.js';
import { MD2CharacterComplex } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/misc/MD2CharacterComplex.js ';
import { Gyroscope } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/misc/Gyroscope.js';

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container, stats;
var camera, scene, renderer;

var characters = [];
var nCharacters = 0;

var cameraControls;

var controls = {

	moveForward: false,
	moveBackward: false,
	moveLeft: false,
	moveRight: false

};

var clock = new THREE.Clock();

class App {

	// init();
	// animate();
	
	// EVENT HANDLERS

	onWindowResize() {

		SCREEN_WIDTH = window.innerWidth;
		SCREEN_HEIGHT = window.innerHeight;

		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

		camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
		camera.updateProjectionMatrix();

	}

	onKeyDown( event ) {

		event.stopPropagation();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ 	controls.moveForward = true; break;

			case 40: /*down*/
			case 83: /*S*/ 	 controls.moveBackward = true; break;

			case 37: /*left*/
			case 65: /*A*/ controls.moveLeft = true; break;

			case 39: /*right*/
			case 68: /*D*/ controls.moveRight = true; break;

			//case 67: /*C*/     controls.crouch = true; break;
			//case 32: /*space*/ controls.jump = true; break;
			//case 17: /*ctrl*/  controls.attack = true; break;

		}

	}

	onKeyUp( event ) {

		event.stopPropagation();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ controls.moveForward = false; break;

			case 40: /*down*/
			case 83: /*S*/ 	 controls.moveBackward = false; break;

			case 37: /*left*/
			case 65: /*A*/ 	 controls.moveLeft = false; break;

			case 39: /*right*/
			case 68: /*D*/ controls.moveRight = false; break;

			//case 67: /*C*/     controls.crouch = false; break;
			//case 32: /*space*/ controls.jump = false; break;
			//case 17: /*ctrl*/  controls.attack = false; break;

		}

	}

	//


	init() {

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		// CAMERA

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
		camera.position.set( 0, 150, 1300 );

		// SCENE

		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xffffff );
		scene.fog = new THREE.Fog( 0xffffff, 1000, 4000 );

		scene.add( camera );

		// LIGHTS

		scene.add( new THREE.AmbientLight( 0x222222 ) );

		var light = new THREE.DirectionalLight( 0xffffff, 2.25 );
		light.position.set( 200, 450, 500 );

		light.castShadow = true;

		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 512;

		light.shadow.camera.near = 100;
		light.shadow.camera.far = 1200;

		light.shadow.camera.left = - 1000;
		light.shadow.camera.right = 1000;
		light.shadow.camera.top = 350;
		light.shadow.camera.bottom = - 350;

		scene.add( light );
		// scene.add( new CameraHelper( light.shadow.camera ) );


		//  GROUND

		var gt = new THREE.TextureLoader().load( "three/examples/textures/terrain/grasslight-big.jpg" );
		var gg = new THREE.PlaneBufferGeometry( 16000, 16000 );
		var gm = new THREE.MeshPhongMaterial( { color: 0xffffff, map: gt } );

		var ground = new THREE.Mesh( gg, gm );
		ground.rotation.x = - Math.PI / 2;
		ground.material.map.repeat.set( 64, 64 );
		ground.material.map.wrapS = THREE.RepeatWrapping;
		ground.material.map.wrapT = THREE.RepeatWrapping;
		ground.material.map.encoding = THREE.sRGBEncoding;
		// note that because the ground does not cast a shadow, .castShadow is left false
		ground.receiveShadow = true;

		scene.add( ground );

		// RENDERER

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		container.appendChild( renderer.domElement );

		//

		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// STATS

		stats = new Stats();
		container.appendChild( stats.dom );

		// EVENTS

		window.addEventListener( 'resize', onWindowResize, false );
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		// CONTROLS

		cameraControls = new OrbitControls( camera, renderer.domElement );
		cameraControls.target.set( 0, 50, 0 );
		cameraControls.update();

		// CHARACTER

		var configOgro = {

			baseUrl: "models/md2/ogro/",

			body: "ogro.md2",
			skins: [ "grok.jpg", "ogrobase.png", "arboshak.png", "ctf_r.png", "ctf_b.png", "darkam.png", "freedom.png",
						"gib.png", "gordogh.png", "igdosh.png", "khorne.png", "nabogro.png",
						"sharokh.png" ],
			weapons: [[ "weapon.md2", "weapon.jpg" ]],
			animations: {
				move: "run",
				idle: "stand",
				jump: "jump",
				attack: "attack",
				crouchMove: "cwalk",
				crouchIdle: "cstand",
				crouchAttach: "crattack"
			},

			walkSpeed: 350,
			crouchSpeed: 175

		};

		var nRows = 1;
		var nSkins = configOgro.skins.length;

		nCharacters = nSkins * nRows;

		for ( var i = 0; i < nCharacters; i ++ ) {

			var character = new MD2CharacterComplex();
			character.scale = 3;
			character.controls = controls;
			characters.push( character );

		}

		var baseCharacter = new MD2CharacterComplex();
		baseCharacter.scale = 3;

		baseCharacter.onLoadComplete = function () {

			var k = 0;

			for ( var j = 0; j < nRows; j ++ ) {

				for ( var i = 0; i < nSkins; i ++ ) {

					var cloneCharacter = characters[ k ];

					cloneCharacter.shareParts( baseCharacter );

					// cast and receive shadows
					cloneCharacter.enableShadows( true );

					cloneCharacter.setWeapon( 0 );
					cloneCharacter.setSkin( i );

					cloneCharacter.root.position.x = ( i - nSkins / 2 ) * 150;
					cloneCharacter.root.position.z = j * 250;

					scene.add( cloneCharacter.root );

					k ++;

				}

			}

			var gyro = new Gyroscope();
			gyro.add( camera );
			gyro.add( light, light.target );

			characters[ Math.floor( nSkins / 2 ) ].root.add( gyro );

		};

		baseCharacter.loadParts( configOgro );

	}

	animate() {

		requestAnimationFrame( animate );
		render();

		stats.update();

	}

	render() {

		var delta = clock.getDelta();

		for ( var i = 0; i < nCharacters; i ++ ) {

			characters[ i ].update( delta );

		}

		renderer.render( scene, camera );

	}
}

export { App }