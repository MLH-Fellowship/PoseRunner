import React, { Component } from 'react';
import styles from '../assets/StartScreen.module.css';
import { Link } from 'react-router-dom';

class EndScreen extends Component {

  render(){
    return (
      <div className={styles.startPage}>
        <div className={styles.css_typing}>
          <p>
            Game over!
          </p>
        </div>
        <div className={styles.test}>
          <p>​You finished with a score of {window.sessionStorage.getItem("currentScore")}.</p>
        </div>
        <div className={styles.test}>
          <p> Your high score is {window.sessionStorage.getItem("highScore")}. </p>
        </div>
        <Link to="/" className={styles.fe_pulse}> PLAY AGAIN </Link>
      </div>
    )
  } 
}

export default EndScreen;