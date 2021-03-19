import React, { Component } from 'react';
import {Link} from "react-router-dom";
import styles from './StartScreen.module.css';

class StartScreen extends Component {

  render(){
    return (
      <div className={styles.startPage}>
        <div className={styles.css_typing}>
          <p>
            PoseRunner
          </p>
        </div>
        <div className={styles.test}>
          <p>​A browser-based endless runner game with a twist.</p>
        </div>
        <div>
          <p className={styles.howto}> How to Play? </p>
        </div>
        <Link to="/game" className={styles.fe_pulse}> PLAY </Link>
      </div>
    )
  } 
}

export default StartScreen;