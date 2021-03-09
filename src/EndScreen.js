import React, { Component } from 'react';
import styles from './StartScreen.module.css';

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
          <p>​You finished with a score of XX.</p>
        </div>
        <div>
          <p className={styles.howto}> Your previous high score was XX. </p>
        </div>
        <button className={styles.fe_pulse} onClick={this.props.start}> PLAY AGAIN </button>
      </div>
    )
  } 
}

export default EndScreen;