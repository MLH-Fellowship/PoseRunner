import React from 'react';
import Game from './Game';
import StartScreen from './StartScreen';
import EndScreen from './EndScreen';
import {Switch, Route} from "react-router-dom";
import { CircularProgress } from '@material-ui/core';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

import Aj from './assets/Aj.fbx';

class App extends React.Component{
  
  constructor(props){
    super(props);
    this.state={
      character: null
    }
  }

  onAjLoad = async (object3d) => {
    if(object3d){
      this.setState({character: object3d});
    }
  }

  loadHandler = async () => {
    let CharLoader = new FBXLoader();
    await CharLoader.load(Aj, this.onAjLoad);
  }

  render(){
    return(
      <Switch>
        <Route path="/" exact>
          {this.state.character?
          <StartScreen Aj={this.state.character}/>:
          <CircularProgress style={{position:'absolute', top: '50%', left:'50%'}}>{this.loadHandler()}</CircularProgress>}
        </Route>
        <Route path="/game" exact>
          {this.state.character?
          <Game player={this.state.character}/>:
          <CircularProgress style={{position:'absolute', top: '50%', left:'50%'}}>{this.loadHandler()}</CircularProgress>}
        </Route>
        <Route path="/over" exact>
          <EndScreen />
        </Route>
      </Switch>
    )
  }
}

export default App;