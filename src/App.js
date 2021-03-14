import React from 'react';
import Game from './Game';
import StartScreen from './StartScreen';

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      startGame: false
    }
  }

  startGamePlay = () =>{
    this.setState({startGame: true});
  }

  render(){
    return(
      <>
      {!this.state.startGame? <StartScreen start={this.startGamePlay}/> : <Game />}
      </>
    )
  }
}

export default App;