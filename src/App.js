import React from 'react';
import Game from './Game';
import StartScreen from './StartScreen';
import EndScreen from './EndScreen';

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      startGame: false,
      end: false
    }
  }

  startGamePlay = () =>{
    this.setState({startGame: true});
  }

  showEndScreen = () => {
    this.setState({end: true});
  }

  restartGame = () => {
    window.location.reload();
  }

  render(){
    return(
      <>
        {!this.state.startGame? <StartScreen start={this.startGamePlay}/> : 
        !this.state.end? <Game showEnd= {this.showEndScreen}/> : 
        <EndScreen restart= {this.restartGame}/>}
      </>
    )
  }
}

export default App;