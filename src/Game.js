import React, { Component } from 'react';
//const THREE = window.THREE;
import * as THREE from 'three';
import Running from './assets/Running.fbx';
import Jumping from './assets/Jump2.fbx';
import bk from './assets/skies/scottstorm_bk.png';
import up from './assets/skies/scottstorm_up.png';
import dn from './assets/skies/scottstorm_dn.png';
import lf from './assets/skies/scottstorm_lf.png';
import rt from './assets/skies/scottstorm_rt.png';
import ft from './assets/skies/scottstorm_ft.png';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

class Game extends Component {

	constructor(props){
		super(props);
	}

	componentDidMount(){
		let gameProp = this;
		let sceneWidth, sceneHeight, camera, scene, renderer, dom, sun, rollingGroundSphere, heroSphere;
		let heroRollingSpeed, sphericalHelper, pathAngleValues, currentLane, clock, canJump = true;
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
		let lives = 5;

		let vertexArr = [];

		let playerObject, playerMixer, playerLoader, run, jump, isLoaded = false;
		
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
			renderer = new THREE.WebGLRenderer({alpha:true, antialias: true});//renderer with transparent backdrop
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
			
			scoreText = document.createElement('div');
			scoreText.style.position = 'absolute';
			//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
			scoreText.style.width = 100;
			scoreText.style.height = 100;
			//scoreText.style.backgroundColor = "blue";
			scoreText.innerHTML = "0";
			scoreText.style.top = 50 + 'px';
			scoreText.style.left = 10 + 'px';
			document.body.appendChild(scoreText);
			
			let infoText = document.createElement('div');
			infoText.style.position = 'absolute';
			infoText.style.width = 100;
			infoText.style.height = 100;
			infoText.style.backgroundColor = "yellow";
			infoText.innerHTML = "UP - Jump, Left/Right - Move";
			infoText.style.top = 10 + 'px';
			infoText.style.left = 10 + 'px';
			document.body.appendChild(infoText);
		}

		/**
		 * Function to load assests
		 */
		function init_Loader(){
			playerLoader = new FBXLoader();
			playerLoader.load(Running, playerLoad);
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
			run = playerMixer.clipAction(object3d.animations[0]);
			run.play();

			const jumpLoader = new FBXLoader();
			jumpLoader.load(Jumping, function(object) {
				jump = playerMixer.clipAction(object.animations[0], object3d);
			})

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
				if ( keyEvent.keyCode === 38 && canJump === true){//up, jump
					canJump = false;
					playerObject.position.y += 0.25;
					playOnClick(run, 0.1, jump, 0.1);
				}
				validMove=false;
			}
			//heroSphere.position.x=currentLane;
			// if(validMove){
			// 	jumping=true;
			// 	bounceValue=0.07;
			// }
		}

		function playOnClick(from, fSpeed, to, tSpeed) {
			to.setLoop(THREE.LoopOnce);
			to.reset();
			to.play();

			from.crossFadeTo(to, fSpeed, true);

			setTimeout(function () {
				// Switch from jumping animation to running animation
				from.enabled = true;
				to.crossFadeTo(from, tSpeed, true);
				canJump = true;
			}, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
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

		function update(){
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
					if(lives > 0){
						score+=2*treeReleaseInterval;
						scoreText.innerHTML=score.toString();
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
					if(isLoaded && treePos.distanceTo(playerObject.position)<= 0.65){
						hasCollided=true;
						explode();
						lives -= 1;
						console.log(lives);
						if(lives <= 0){
							window.location.href="/over";
						}
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
      <div style={{width:"100%", height:"100vh"}}id="game"></div>
    )
  }
}

export default Game;
