import React, { Component } from "react";
// We need to import tf to set the TensorFlow's JavaScript backend
// eslint-disable-next-line no-unused-vars
import * as tf from "@tensorflow/tfjs";
import * as THREE from "three";
import Jumping from "../assets/Jump2.fbx";
import deadline from "../assets/logos/hourglass.png";
import insta from "../assets/logos/Insta.jpg";
import youtube from "../assets/logos/Youtube.png";
import anxiety from "../assets/logos/anxiety.jpg";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { estimatePoseOnImage, findAngle, explode, createTreesPool, loadPoseNet, createCube, addPathTree, addWorld, addExplosion, addLight, updateArrows, doExplosionLogic } from './functions/index.js'
class Game extends Component {
	async componentDidMount() {
		var canPlayVideo = false;

		var video = document.querySelector("#videoElement");

		if (this.props.usePoseNet) {
			if (navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then(function (stream) {
						video.srcObject = stream;
					})
					.catch(function (error) {
						// No video stream
						// Or waiting for input stream
					});
			}
			video.addEventListener(
				"loadeddata",
				function () {
					canPlayVideo = true;
				},
				false
			);
			video.width = 640;
			video.height = 480;
		}

		const net = await loadPoseNet();

		let will = this.props.willImg,
			bg = this.props.backGrd,
			txt = this.props.txtr;
		let leftArrow = this.props.leftA,
			rightArrow = this.props.rightA,
			upArrow = this.props.jumpA;
		let sceneWidth,
			sceneHeight,
			camera,
			scene,
			renderer,
			dom,
			sun,
			rollingGroundSphere;
		let sphericalHelper,
			pathAngleValues,
			currentLane,
			clock,
			canJump = true;
		let treesInPath,
			treesPool,
			particleGeometry,
			particles,
			scoreText,
			lifeText,
			score,
			hasCollided = true;
		let rollingSpeed = 0.008;
		let fogIntensity = 0.10;
		let worldRadius = 26.7;
		let leftLane = -1.25;
		let rightLane = 1.25;
		let middleLane = 0;
		let treeReleaseInterval = 0.5;
		let explosionPower = 1.06;
		let canGoLeft = true,
			canGoRight = true;
		let lives = 3;
		let playerInitialPositionY = 2;

		let vertexArr = [];

		let playerObject = this.props.player,
			playerMixer,
			runAnimation,
			jumpAnimation,
			isLoaded = false;

		let LEFT = -0.1,
			RIGHT = 0.1,
			UP = 0.1,
			moveLeft = false,
			moveRight = false,
			moveUp = false,
			leftCube,
			rightCube,
			upCube;

		init();

		function init() {
			// set up the scene
			createScene();

			//call game loop
			update();
		}

		function createScene() {
			score = 0;
			treesInPath = [];
			treesPool = [];
			clock = new THREE.Clock();
			clock.start();
			sphericalHelper = new THREE.Spherical();
			pathAngleValues = [1.52, 1.57, 1.62];
			sceneWidth = window.innerWidth;
			sceneHeight = window.innerHeight;
			scene = new THREE.Scene(); //the 3d scene
			scene.fog = new THREE.FogExp2(0xf0fff0, fogIntensity);
			camera = new THREE.PerspectiveCamera(
				60,
				sceneWidth / sceneHeight,
				0.1,
				1000
			); //perspective camera
			renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); //renderer with transparent backdrop
			renderer.setClearColor(0xfffafa, 1);
			renderer.shadowMap.enabled = true; //enable shadow
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			renderer.setSize(sceneWidth, sceneHeight);
			playerLoad();
			dom = document.getElementById("game");
			dom.appendChild(renderer.domElement);

			var bgLoader = new THREE.TextureLoader().load(bg);
			scene.background = bgLoader;

			treesPool = createTreesPool(treesPool, youtube, insta, anxiety, deadline);
			({ txt = {}, worldRadius, rollingGroundSphere, scene, treesPool = {}, treesInPath, sphericalHelper, pathAngleValues, will } = addWorld(txt, worldRadius, rollingGroundSphere, scene, treesPool, treesInPath, sphericalHelper, pathAngleValues, will));
			({ scene, sun } = addLight(scene, sun));
			({ particleGeometry, particles, scene } = addExplosion(particleGeometry, particles, scene));

			camera.position.z = 7.5;
			camera.position.y = 2.5;
			camera.rotation.x += 0.15;

			({ leftCube, scene } = createCube("left", leftArrow, rightArrow, upArrow, scene));
			({ rightCube, scene } = createCube("right", leftArrow, rightArrow, upArrow, scene));
			({ upCube, scene } = createCube("up", leftArrow, rightArrow, upArrow, scene));

			window.addEventListener("resize", onWindowResize, false); //resize callback
			document.onkeydown = handleKeyDown;

			scoreText = document.createElement("div");
			scoreText.style.position = "absolute";
			scoreText.style.width = 100;
			scoreText.style.height = 100;
			scoreText.innerHTML = "Score: 0";
			scoreText.style.backgroundColor = "yellow";
			scoreText.style.top = 10 + "px";
			scoreText.style.left = 10 + "px";
			document.body.appendChild(scoreText);

			lifeText = document.createElement("div");
			lifeText.style.position = "absolute";
			lifeText.style.width = 100;
			lifeText.style.height = 100;
			lifeText.style.backgroundColor = "yellow";
			lifeText.innerHTML = "Live(s): 3";
			lifeText.style.top = 10 + "px";
			lifeText.style.right = 10 + "px";
			document.body.appendChild(lifeText);
		}

		function playerLoad() {
			let object3d = playerObject;
			playerObject.scale.set(0.0025, 0.0025, 0.0025);
			playerObject.position.y = playerInitialPositionY;
			playerObject.position.z = 6.2;
			playerObject.rotateY(185.25);
			playerObject.receiveShadow = true;
			playerObject.castShadow = true;
			playerMixer = new THREE.AnimationMixer(object3d);
			runAnimation = playerMixer.clipAction(object3d.animations[0]);
			runAnimation.play();

			const jumpLoader = new FBXLoader();
			jumpLoader.load(Jumping, function (object) {
				jumpAnimation = playerMixer.clipAction(object.animations[0], object3d);
			});

			playerMixer.update(0);
			playerObject.updateMatrix();
			scene.add(playerObject);
			currentLane = middleLane;
			isLoaded = true; //prevents error while updating if the character is not loaded
		}

		function handleKeyDown(keyEvent) {
			if (keyEvent.keyCode === 37) {
				//left
				handleArrows("left");
				if (currentLane === middleLane) {
					currentLane = leftLane;
				} else if (currentLane === rightLane) {
					currentLane = middleLane;
				}
			} else if (keyEvent.keyCode === 39) {
				//right
				handleArrows("right");
				if (currentLane === middleLane) {
					currentLane = rightLane;
				} else if (currentLane === leftLane) {
					currentLane = middleLane;
				}
			} else {
				if (keyEvent.keyCode === 38 && canJump === true) {
					//up, jump
					handleArrows("up");
					canJump = false;
					playerObject.position.y += 0.2;
					playOnClick(runAnimation, 0.1, jumpAnimation, 0.1);
				}
			}
		}

		function playOnClick(from, fSpeed, to, tSpeed) {
			to.setLoop(THREE.LoopOnce);
			to.reset();
			to.play();

			from.crossFadeTo(to, fSpeed, true);

			setTimeout(function () {
				// Switch from jumping animation to running animation
				var moveDown = setInterval(function () {
					if (playerObject.position.y < playerInitialPositionY) {
						playerObject.position.y = playerInitialPositionY;
						clearInterval(moveDown);
					}
					playerObject.position.y -= 0.01;
				}, 15);
				from.enabled = true;
				to.crossFadeTo(from, tSpeed, true);
				canJump = true;
			}, to._clip.duration * 1000 - (tSpeed + fSpeed) * 1000);
		}

		function handleArrows(dir) {
			let cube, move;
			if (dir === "left") {
				cube = leftCube;
				move = moveLeft;
			} else if (dir === "right") {
				cube = rightCube;
				move = moveRight;
			} else if (dir === "up") {
				cube = upCube;
				move = moveUp;
			}

			cube.visible = true;
			move = true;
			setTimeout(() => {
				move = false;
				cube.visible = false;
				if (dir === "left") {
					cube.position.x = -0.4;
				} else if (dir === "right") {
					cube.position.x = 0.4;
				} else if (dir === "up") {
					upCube.position.y = 3.6;
				}
			}, 200);
		}

		function validatePose(pose) {
			let left = false;
			let right = false;
			let jump = false;

			const lSh = pose.keypoints[5];
			const rSh = pose.keypoints[6];
			const lEl = pose.keypoints[7];
			const rEl = pose.keypoints[8];
			const lWr = pose.keypoints[9];
			const rWr = pose.keypoints[10];

			if (
				rWr.score > 0.5 &&
				rWr.position.y < rEl.position.y &&
				rWr.position.x > rSh.position.x
			) {
				let rAngle =
					(findAngle(rSh.position, rEl.position, rWr.position) * 180) / Math.PI;
				if (rAngle < 90.0) {
					right = true;
				}
			}
			if (
				lWr.score > 0.5 &&
				lWr.position.y < lEl.position.y &&
				lWr.position.x < lSh.position.x
			) {
				let lAngle =
					(findAngle(lSh.position, lEl.position, lWr.position) * 180) / Math.PI;
				if (lAngle < 90.0) {
					left = true;
				}
			}
			if (
				lWr.score > 0.3 &&
				rWr.score > 0.3 &&
				lWr.position.x > lSh.position.x &&
				rWr.position.x < rSh.position.x
			) {
				jump = true;
			}

			if (jump === true && canJump === true) {
				canJump = false;
				handleArrows("up");
				playOnClick(runAnimation, 0.1, jumpAnimation, 0.1);
				playerObject.position.y += 0.2;
			} else if (left === true && canGoLeft) {
				//left
				canGoLeft = false;
				handleArrows("left");
				if (currentLane === middleLane) {
					currentLane = leftLane;
					canGoLeft = true;
				} else if (currentLane === rightLane) {
					currentLane = middleLane;
					setTimeout(() => {
						canGoLeft = true;
					}, 1000);
				} else {
					canGoLeft = true;
				}
			} else if (right === true && canGoRight) {
				//right
				canGoRight = false;
				handleArrows("right");
				if (currentLane === middleLane) {
					currentLane = rightLane;
					canGoRight = true;
				} else if (currentLane === leftLane) {
					currentLane = middleLane;
					setTimeout(() => {
						canGoRight = true;
					}, 1000);
				} else {
					canGoRight = true;
				}
			}
		}

		function update() {
			// Perf: Following block can be called periodically, and not for
			// every frame

			// BLOCK Start
			if (canPlayVideo) {
				estimatePoseOnImage(video, net).then((poses) => validatePose(poses));
			} else {
				// Waiting for camera input
			}
			// BLOCK End
			rollingGroundSphere.rotation.x += rollingSpeed;
			({ moveLeft, leftCube, LEFT, moveRight, rightCube, RIGHT, moveUp, upCube, UP } = updateArrows(moveLeft, leftCube, LEFT, moveRight, rightCube, RIGHT, moveUp, upCube, UP));
			if (clock.getElapsedTime() > treeReleaseInterval) {
				clock.start();
				({ treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will } = addPathTree(treesPool, treesInPath, sphericalHelper, worldRadius, pathAngleValues, rollingGroundSphere, will));
				if (lives > 0) {
					score += 2 * treeReleaseInterval;
					scoreText.innerHTML = "Score: " + score.toString();
				}
			}
			if (isLoaded) {
				if (playerObject.position.y > 2.3) {
					playerObject.position.y -= 0.005;
				}
				playerObject.position.x = THREE.Math.lerp(
					playerObject.position.x,
					currentLane,
					0.05
				); //smooth transing while changing lanes
				playerMixer.update(0.02); //make Aj walking animation
			}
			doTreeLogic();
			if (particles.visible) {
				({ particles, vertexArr, particleGeometry, explosionPower } = doExplosionLogic(particles, vertexArr, particleGeometry, explosionPower));
			}
			render();
			requestAnimationFrame(update); //request next update
		}

		function doTreeLogic() {
			let oneTree,
				isTree = false;
			let treePos = new THREE.Vector3();
			let treesToRemove = [];
			treesInPath.forEach(async function (element, index) {
				oneTree = treesInPath[index];
				if (oneTree.children.length === 2) isTree = true;
				treePos.setFromMatrixPosition(oneTree.matrixWorld);
				if (treePos.z > 6 && oneTree.visible) {
					//gone out of our view zone
					treesToRemove.push(oneTree);
				} else {
					//check collision
					if (
						hasCollided &&
						isLoaded &&
						((isTree === false &&
							treePos.distanceTo(playerObject.position) <= 0.45) ||
							(isTree === true &&
								treePos.distanceTo(playerObject.position) <= 0.55))
					) {
						({ particles, playerObject, vertexArr, particleGeometry, explosionPower } = explode(particles, playerObject, vertexArr, THREE, particleGeometry, explosionPower));
						lives -= 1;
						lifeText.innerHTML = "Live(s): " + lives.toString();
						hasCollided = false;
						if (lives <= 0) {
							window.sessionStorage.setItem("currentScore", score);
							if (
								!window.sessionStorage.getItem("highScore") ||
								window.sessionStorage.getItem("highScore") < score
							) {
								window.sessionStorage.setItem("highScore", score);
							}
							window.location.href = "/over";
						}
						setTimeout(() => {
							hasCollided = true;
						}, 500);
					}
				}
			});
			let fromWhere;
			treesToRemove.forEach(function (element, index) {
				oneTree = treesToRemove[index];
				fromWhere = treesInPath.indexOf(oneTree);
				treesInPath.splice(fromWhere, 1);
				treesPool.push(oneTree);
				oneTree.visible = false;
			});
		}

		function render() {
			renderer.render(scene, camera); //draw
		}

		function onWindowResize() {
			//resize & align
			sceneHeight = window.innerHeight;
			sceneWidth = window.innerWidth;
			renderer.setSize(sceneWidth, sceneHeight);
			camera.aspect = sceneWidth / sceneHeight;
			camera.updateProjectionMatrix();
		}
	}

	render() {
		return (
			<div>
				<video hidden autoPlay={true} id="videoElement"></video>
				<div style={{ width: "100%", height: "100vh" }} id="game"></div>
			</div>
		);
	}
}

export default Game;
