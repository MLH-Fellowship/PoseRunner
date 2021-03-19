import React from 'react';
import Game from './Game';
import StartScreen from './StartScreen';
import EndScreen from './EndScreen';
import {Switch, Route} from "react-router-dom";

class App extends React.Component{
  
  render(){
    return(
      <Switch>
        <Route path="/" exact>
          <StartScreen />
        </Route>
        <Route path="/game" exact>
          <Game />
        </Route>
        <Route path="/over" exact>
          <EndScreen />
        </Route>
      </Switch>
    )
  }
}

export default App;