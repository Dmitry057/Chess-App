import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import  Store from './store';
import Board from './components/board';
import TakenPieces from './components/taken-pieces';
import Moves from './components/moves';

import { BLACK, WHITE } from '~/chess/board';

const App = () => (
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'self';font-src 'self'; img-src 'self' data: https:; style-src 'self' ; script-src 'self'">
	<Provider store={Store}>
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <TakenPieces color={WHITE} />
          <Board />
          <TakenPieces color={BLACK} />
        </div>
        <div className="col-md-2">
          <Moves />
        </div>
      </div>
    </div>
	</Provider>
  </meta>
);

ReactDOM.render(<App />, document.getElementById('appRoot'));
