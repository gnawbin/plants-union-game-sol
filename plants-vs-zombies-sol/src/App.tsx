import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import GameCanvas from './components/game/GameCanvas';
import styled from 'styled-components';
import { preloadImages } from './utils/assetLoader';

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #282c34;
`;

function App() {
  useEffect(() => {
    preloadImages();
  }, []);

  return (
    <Provider store={store}>
      <AppContainer>
        <GameCanvas />
      </AppContainer>
    </Provider>
  );
}

export default App;
