import React, { Component } from 'react';
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
        <button className={styles.fe_pulse} onClick={this.props.start}> PLAY </button>
      </div>
    )
  } 
}

export default StartScreen;