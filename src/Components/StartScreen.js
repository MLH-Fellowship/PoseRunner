import React, { Component } from 'react';
import * as THREE from 'three';
import styles from '../assets/StartScreen.module.css';
import {Link} from "react-router-dom";

class StartScreen extends Component {

  componentDidMount(){

    let sceneWidth, sceneHeight, scene, camera, renderer, dom, sun;
    let AjObj = this.props.Aj, AjMixer, AjAction;
    let AjLoaded = false;

    init();

    function init() {
      sceneWidth=window.innerWidth;
		  sceneHeight= 300;

      camera = new THREE.PerspectiveCamera( 70, sceneWidth / sceneHeight, 0.01, 100 );
      camera.position.z = 1;
			camera.position.y = 0;
      scene = new THREE.Scene();
      init_LoaderAj();

      addLight();

      renderer = new THREE.WebGLRenderer( { alpha: true } );
      renderer.setSize( window.innerWidth, sceneHeight );
      renderer.setAnimationLoop( animation );
      dom = document.getElementById('character');
		  dom.appendChild(renderer.domElement);
    }

    async function init_LoaderAj(){
			AjObj.scale.set(0.0025,0.0025,0.0025);
			AjObj.position.y = -0.23;
			AjObj.position.z = 0.6;
			AjObj.receiveShadow = true;
			AjObj.castShadow = true;
			AjMixer = new THREE.AnimationMixer(AjObj);
			AjAction = AjMixer.clipAction(AjObj.animations[0]);
			AjAction.play();
			AjMixer.update(0);
			AjObj.updateMatrix();
			scene.add(AjObj);
			AjLoaded = true;
		}

    function addLight(){
			let hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, 1.7)
			scene.add(hemisphereLight);
			sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
			sun.position.set( 0,0,0 );
			sun.castShadow = true;
			scene.add(sun);
			sun.shadow.mapSize.width = 256;
			sun.shadow.mapSize.height = 256;
			sun.shadow.camera.near = 0.5;
			sun.shadow.camera.far = 50 ;
		}

    function animation( time ) {

      if(AjLoaded){
        AjMixer.update(0.01);
      }

      renderer.render( scene, camera );

    }
  }

  render(){
    return (
		<>
      <div className={styles.startPage}>
        <div className={styles.css_typing}>
          <p>
            PoseRunner
          </p>
        </div>
        <div className={styles.test}>
          <p>"Run" through MLH Fellowship in Outer Space, with your Poses!</p>
        </div>
        <div style={{width:"100%", height: "300px", zIndex:999}} id="character"></div>
        <div className={styles.test}>
          <p style={{marginTop: "em"}}> Where there is Will, there is a way!</p>
        </div>
        
        <div style={{ textAlign: "center", width: "100%", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: 100 }}>
            <Link to="/game" className={styles.fe_pulse}> Run w/o Poses! </Link>
            <Link to="/calibrate" onClick={() => this.props.handlePoseNet(true)} className={styles.fe_pulse}> Run with Poses! </Link>
        </div>
      </div>
		</>
    )
  } 
}

export default StartScreen;