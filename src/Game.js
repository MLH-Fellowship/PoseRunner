import React, { Component } from 'react';
//const THREE = window.THREE;
import bk from './assets/skies/scottstorm_bk.png';
import up from './assets/skies/scottstorm_up.png';
import dn from './assets/skies/scottstorm_dn.png';
import lf from './assets/skies/scottstorm_lf.png';
import rt from './assets/skies/scottstorm_rt.png';
import ft from './assets/skies/scottstorm_ft.png';
import * as THREE from 'three';
import Running from './assets/Running.fbx';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";

class Game extends Component {

	async componentDidMount() {
		var canPlayVideo = false;

		let loadPoseNet = function () {
			return posenet.load({
				architecture: 'MobileNetV1',
				outputStride: 16,
				inputResolution: { width: 640, height: 480 },
				multiplier: 0.5
			}).then(res => { return res })
		}

		var video = document.querySelector("#videoElement");

		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
				.then(function (stream) {
					video.srcObject = stream;
				})
				.catch(function (err0r) {
					console.log("Something went wrong!");
				});
		}
		if (video) {
			video.addEventListener('loadeddata', function () {
				canPlayVideo = true;
			}, false);
			video.width = 640;
			video.height = 480;
		}

		const net = await loadPoseNet();
    let gameProp = this;
		let sceneWidth, sceneHeight, camera, scene, renderer, dom, sun, rollingGroundSphere, heroSphere;
		let heroRollingSpeed, sphericalHelper, pathAngleValues, currentLane, clock, jumping = false;
		let treesInPath, treesPool, particleGeometry, particles, scoreText, score, hasCollided;
		let rollingSpeed=0.008;
		let worldRadius=26.7;
		let heroRadius=0.1;
		let heroBaseY=2.2;
		let bounceValue=0.2;
		let gravity=0.0041;
		let leftLane=-1.25;
		let rightLane=1.25;
		let middleLane=0;
		let treeReleaseInterval=0.5;
		let particleCount=20;
		let explosionPower =1.06;
		let right = 0;
		// let freezeTime = 0;

		let vertexArr = [];

		let playerObject, playerMixer, playerLoader, action, isLoaded = false;
		
		init();

		function init() {
			// set up the scene
			createScene();

			//call game loop
			update();
		}

		function createScene(){
			hasCollided=false;
			score=0;
			treesInPath=[];
			treesPool=[];
			clock=new THREE.Clock();
			clock.start();
			heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
			sphericalHelper = new THREE.Spherical();
			pathAngleValues=[1.52,1.57,1.62];
			sceneWidth=window.innerWidth;
			sceneHeight=window.innerHeight;
			scene = new THREE.Scene();//the 3d scene
			scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );
			camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
			renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
			renderer.setClearColor(0xfffafa, 1); 
			renderer.shadowMap.enabled = true;//enable shadow
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			renderer.setSize( sceneWidth, sceneHeight );
			dom = document.getElementById('game');
			dom.appendChild(renderer.domElement);
			var cubeTextureLoader = new THREE.CubeTextureLoader();
			/* cubeTextureLoader.setPath( 'assets/skies/' ); */
			var cubeTexture = cubeTextureLoader.load( [
				ft, bk,
				up, dn,
				rt, lf
			], ()=>{
				scene.background = cubeTexture;
			} );
			scene.background = cubeTexture;
			init_Loader();

			createTreesPool();
			addWorld();
			//addHero();
			addLight();
			addExplosion();
			
			camera.position.z = 7.5;
			camera.position.y = 3.15;
			
			window.addEventListener('resize', onWindowResize, false);//resize callback

			document.onkeydown = handleKeyDown;
			
			// scoreText = document.createElement('div');
			// scoreText.style.position = 'absolute';
			// //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
			// scoreText.style.width = 100;
			// scoreText.style.height = 100;
			// //scoreText.style.backgroundColor = "blue";
			// scoreText.innerHTML = "0";
			// scoreText.style.top = 50 + 'px';
			// scoreText.style.left = 10 + 'px';
			// document.body.appendChild(scoreText);
			
			// let infoText = document.createElement('div');
			// infoText.style.position = 'absolute';
			// infoText.style.width = 100;
			// infoText.style.height = 100;
			// infoText.style.backgroundColor = "yellow";
			// infoText.innerHTML = "UP - Jump, Left/Right - Move";
			// infoText.style.top = 10 + 'px';
			// infoText.style.left = 10 + 'px';
			// document.body.appendChild(infoText);
		}

		/**
		 * Function to load assests
		 */
		function init_Loader(){
			playerLoader = new FBXLoader();
			playerLoader.load(Running, playerLoad);
			jumping=false;
			currentLane=middleLane;
		}

		function playerLoad(object3d){
			playerObject = object3d;
			playerObject.scale.set(0.0025,0.0025,0.0025);
			playerObject.position.y = 2.3;
			playerObject.position.z = 6;
			playerObject.rotateY(185.25);
			playerObject.receiveShadow = true;
			playerObject.castShadow = true;
			playerMixer = new THREE.AnimationMixer(object3d);
			action = playerMixer.clipAction(object3d.animations[0]);
			action.play();
			playerMixer.update(0);
			playerObject.updateMatrix();
			scene.add(playerObject);
			isLoaded = true; //prevents error while updating if the character is not loaded
		}

		function addExplosion(){
			particleGeometry = new THREE.BufferGeometry();
			let pnt = 50;
			let positions = [];
			const n = 2, n2 = n / 2;
			for ( let i = 0; i < pnt; i ++ ) {
				const x = Math.random() * n - n2;
				const y = Math.random() * n - n2;
				const z = Math.random() * n - n2;

				positions.push( x, y, z );
			}
			const vertices = new Float32Array(positions);
			particleGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			let pMaterial = new THREE.ParticleBasicMaterial({
				color: 0x006400,
				size: 0.1
			});
			particles = new THREE.Points( particleGeometry, pMaterial );
			scene.add( particles );
			particles.visible=true;
			console.log(particleGeometry.getAttribute("position"));
		}

		function createTreesPool(){
			let maxTreesInPool=10;
			let newTree;
			for(let i=0; i<maxTreesInPool;i++){
				newTree=createTree();
				treesPool.push(newTree);
			}
		}

		function handleKeyDown(keyEvent){
			//if(jumping)return;
			let validMove=true;
			if ( keyEvent.keyCode === 37) {//left
				if(currentLane == middleLane){
					currentLane = leftLane;
				}else if(currentLane == rightLane){
					currentLane = middleLane;
				}else{
					validMove=false;	
				}
			} else if ( keyEvent.keyCode === 39) {//right
				right = 0.3;
				if(currentLane==middleLane){
					currentLane=rightLane;
				}else if(currentLane==leftLane){
					currentLane=middleLane;
				}else{
					validMove=false;	
				}
			}else{
				if ( keyEvent.keyCode === 38){//up, jump
					playerObject.position.y += 0.25;
				}
				validMove=false;
			}
			//heroSphere.position.x=currentLane;
			// if(validMove){
			// 	jumping=true;
			// 	bounceValue=0.07;
			// }
		}

		function addWorld(){
			let sides=100;
			let tiers=40;
			let sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
			let sphereMaterial = new THREE.MeshStandardMaterial( { color: 0x06b011 ,flatShading:THREE.FlatShading} )
			rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
			rollingGroundSphere.receiveShadow = true;
			rollingGroundSphere.castShadow=false;
			rollingGroundSphere.rotation.z=-Math.PI/2;
			scene.add( rollingGroundSphere );
			rollingGroundSphere.position.y=-24.4;
			rollingGroundSphere.position.z=2;
			addWorldTrees();
		}

		function addLight(){
			let hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
			scene.add(hemisphereLight);
			sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
			sun.position.set( 12,6,-7 );
			sun.castShadow = true;
			scene.add(sun);
			//Set up shadow properties for the sun light
			sun.shadow.mapSize.width = 256;
			sun.shadow.mapSize.height = 256;
			sun.shadow.camera.near = 0.5;
			sun.shadow.camera.far = 50 ;
		}

		function addPathTree(){
			let options=[0,1,2];
			let lane= Math.floor(Math.random()*3);
			addTree(true,lane);
			options.splice(lane,1);
			if(Math.random()>0.5){
				lane= Math.floor(Math.random()*2);
				addTree(true,options[lane]);
			}
		}

		function addWorldTrees(){
			let numTrees=36;
			let gap=6.28/36;
			for(let i=0;i<numTrees;i++){
				addTree(false,i*gap, true);
				addTree(false,i*gap, false);
			}
		}

		function addTree(inPath, row, isLeft){
			let newTree;
			if(inPath){
				if(treesPool.length == 0)return;
				newTree=treesPool.pop();
				newTree.visible = true;
				//console.log("add tree");
				treesInPath.push(newTree);
				sphericalHelper.set( worldRadius - 0.3, pathAngleValues[row], - rollingGroundSphere.rotation.x+4 );
			}else{
				newTree=createTree();
				let forestAreaAngle = 0; //[1.52,1.57,1.62];
				if(isLeft){
					forestAreaAngle=1.68+Math.random()*0.1;
				}else{
					forestAreaAngle=1.46-Math.random()*0.1;
				}
				sphericalHelper.set( worldRadius - 0.3, forestAreaAngle, row );
			}
			newTree.position.setFromSpherical( sphericalHelper );
			let rollingGroundVector = rollingGroundSphere.position.clone().normalize();
			let treeVector = newTree.position.clone().normalize();
			newTree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
			newTree.rotation.x += (Math.random()*(2*Math.PI/10))+-Math.PI/10;
			
			rollingGroundSphere.add(newTree);
		}

		function createTree(){
			let sides=8;
			let tiers=6;
			let treeGeometry = new THREE.ConeGeometry( 0.27, 1, sides, tiers);
			let treeMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,flatShading:THREE.FlatShading  } );
			let treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
			treeTop.castShadow=true;
			treeTop.receiveShadow=false;
			treeTop.position.y=0.9;
			// treeTop.rotation.y=(Math.random()*(Math.PI));
			let treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.5);
			let trunkMaterial = new THREE.MeshStandardMaterial( { color: 0x886633,flatShading:THREE.FlatShading  } );
			let treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
			treeTrunk.position.y=0.25;
			let tree =new THREE.Object3D();
			tree.add(treeTrunk);
			tree.add(treeTop);
			return tree;
		}

		function findAngle(A, B, C) {
			var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(A.y - B.y, 2));
			var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(C.y - B.y, 2));
			var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(A.y - C.y, 2));
			return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
		}

		// function decrement() {
		// 	freezeTime = freezeTime - 1;
		// }

		function validatePose(pose) {
			// if (pose === null || freezeTime > 0) {
			// 	console.log("Pose is null", freezeTime);
			// 	return;
			// }

			let left = false;
			let right = false;
			let jump = false;

			const lSh = pose.keypoints[5];
			const rSh = pose.keypoints[6];
			const lEl = pose.keypoints[7];
			const rEl = pose.keypoints[8];
			const lWr = pose.keypoints[9];
			const rWr = pose.keypoints[10];

			if (rWr.score > 0.5 && rWr.position.y < rEl.position.y && rWr.position.x > rSh.position.x) {
				let rAngle = (findAngle(rSh.position, rEl.position, rWr.position) * 180) / Math.PI
				if (rAngle < 90.0) {
					right = true;
				}
			}
			if (lWr.score > 0.5 && lWr.position.y < lEl.position.y && lWr.position.x < lSh.position.x) {
				let lAngle = (findAngle(lSh.position, lEl.position, lWr.position) * 180) / Math.PI
				if (lAngle < 90.0) {
					left = true;
				}
			}
			if (lWr.score > 0.3 && rWr.score > 0.3 && lWr.position.x > lSh.position.x && rWr.position.x < rSh.position.x) {
				jump = true;
			}

			if (jump === true) {
				console.log("Jump");
				// Doing the Jump animation
				// freezeTime = 1;
				// setInterval(decrement, 1000);
				playerObject.position.y += 0.25;
			}
			else if (left === true) {//left
				console.log("Left");
				if (currentLane === middleLane) {
					currentLane = leftLane;
					// freezeTime = 1;
					// setInterval(decrement, 1000);
				} else if (currentLane === rightLane) {
					currentLane = middleLane;
					// freezeTime = 1;
					// setInterval(decrement, 1000);
				}
			} else if (right === true) {//right
				console.log("Right");
				if (currentLane === middleLane) {
					currentLane = rightLane;
					// freezeTime = 1;
					// setInterval(decrement, 1000);
				} else if (currentLane === leftLane) {
					currentLane = middleLane;
					// freezeTime = 1;
					// setInterval(decrement, 1000);
				}
			}
		}

		async function estimatePoseOnImage(imageElement) {
			// if (freezeTime > 0) {
			// 	return null;
			// }

			// estimate poses
			const poses = await net.estimateSinglePose(imageElement, { flipHorizontal: true });

			return poses;
		}


		function update() {
			// Perf: Following block can be called periodically, and not for
			// every frame

			// BLOCK Start
			if (canPlayVideo) {
				estimatePoseOnImage(video).then(poses => validatePose(poses));
			} else {
				console.log("Waiting for camera input.");
			}
			// BLOCK End

			//stats.update();
				//animate
				rollingGroundSphere.rotation.x += rollingSpeed;
				// if(playerObject.position.y<=heroBaseY){
				// 	jumping=false;
				// 	bounceValue=0.007//(Math.random()*0.04)+0.005;
				// }
				// playerObject.position.y+=bounceValue;
				// playerObject.position.x=THREE.Math.lerp(playerObject.position.x,currentLane, 2*clock.getDelta());//clock.getElapsedTime());
				// bounceValue-=gravity;	
				if(clock.getElapsedTime()>treeReleaseInterval){
					clock.start();
					addPathTree();
						if(!hasCollided){
						// score+=2*treeReleaseInterval;
						// scoreText.innerHTML=score.toString();
						}
				}
				if(isLoaded){
					if(playerObject.position.y > 2.3){
						playerObject.position.y -= 0.005
					}
					playerObject.position.x = THREE.Math.lerp(playerObject.position.x, currentLane, 0.05); //smooth transing while changing lanes
					playerMixer.update(0.02); //make Aj walking animation
				}
				doTreeLogic();
				doExplosionLogic();
				render();
			requestAnimationFrame(update);//request next update
		}

		function doTreeLogic(){
			let oneTree;
			let treePos = new THREE.Vector3();
			let treesToRemove=[];
			treesInPath.forEach( function ( element, index ) {
				oneTree=treesInPath[ index ];
				treePos.setFromMatrixPosition( oneTree.matrixWorld );
				if(treePos.z>6 &&oneTree.visible){ //gone out of our view zone
					treesToRemove.push(oneTree);
				}else{//check collision
					if(treePos.distanceTo(playerObject.position)<= 0.65){
						hasCollided=true;
						//gameProp.props.showEnd();
						explode();
					}
				}
			});
			let fromWhere;
			treesToRemove.forEach( function ( element, index ) {
				oneTree=treesToRemove[ index ];
				fromWhere=treesInPath.indexOf(oneTree);
				treesInPath.splice(fromWhere,1);
				treesPool.push(oneTree);
				oneTree.visible=false;
				//console.log("remove tree");
			});
		}

		function doExplosionLogic(){
			if(!particles.visible)return;
			// for (let i = 0; i < particleCount; i ++ ) {
			// 	particleGeometry.vertices[i].multiplyScalar(explosionPower);
			// }
			// if(vertexArr.length !=  0){
			// 	vertexArr = vertexArr.map(ele => {
			// 		return ele * explosionPower
			// 	});
			// 	console.log(vertexArr);
			// }
			// particleGeometry.setFromPoints(vertexArr);
			vertexArr = [];
			for (let i = 0; i < 20; i ++ ) {
				let vertex = new THREE.Vector3();
				vertex.x = -0.4+Math.random();
				vertex.y = -0.2+Math.random();
				vertex.z = -0.2+Math.random();
				vertexArr.push(vertex);
			}
			//console.log(vertexArr);
			particleGeometry.setFromPoints(vertexArr);

			if(explosionPower>1.005){
				explosionPower-=0.0015;
			}else{
				particles.visible=false;
				console.log("Not explode");
			}
			particleGeometry.verticesNeedUpdate = true;
		}

		function explode(){
			particles.position.y=2;
			particles.position.z=4.8;
			particles.position.x=playerObject.position.x;
			vertexArr = [];
			for (let i = 0; i < 20; i ++ ) {
				let vertex = new THREE.Vector3();
				vertex.x = -0.4+Math.random();
				vertex.y = -0.2+Math.random();
				vertex.z = -0.2+Math.random();
				vertexArr.push(vertex);
			}
			//console.log(vertexArr);
			particleGeometry.setFromPoints(vertexArr);
			explosionPower=1.07;
			particles.visible=true;
		}

		function render(){
				renderer.render(scene, camera);//draw
		}

		function gameOver () {
			// cancelAnimationFrame( globalRenderID );
			// window.clearInterval( powerupSpawnIntervalID );
		}
		function onWindowResize() {
			//resize & align
			sceneHeight = window.innerHeight;
			sceneWidth = window.innerWidth;
			renderer.setSize(sceneWidth, sceneHeight);
			camera.aspect = sceneWidth/sceneHeight;
			camera.updateProjectionMatrix();
		}

	}

  render(){
		return (
	  	<div>
			<video hidden autoPlay={true} id="videoElement"></video>
			<div style={{ width: "100%", height: "100vh" }} id="game"></div>
	  </div>
    )
  }
}

export default Game;
