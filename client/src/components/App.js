import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import CharacterSelect from './CharacterSelect';
import GameBoard from './GameBoard';

// Game version display
const VERSION = '0.1.0';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, character-select, game
  const [game, setGame] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [track, setTrack] = useState(null);
  const [playerData, setPlayerData] = useState({
    playerName: localStorage.getItem('playerName') || '玩家1',
    opponentType: 'ai', // ai or human
  });

  // Initialize game data when component mounts
  useEffect(() => {
    // This will be replaced with actual character and track loading logic
    // when those components are implemented
    setCharacters([
      { id: 1, name: '飆風劍客', type: '全能型車手' },
      { id: 2, name: '山岳之王', type: '爬坡專家' },
      { id: 3, name: '閃電追擊', type: '衝刺手' },
      { id: 4, name: '風之守護', type: '破風手' },
      { id: 5, name: '戰術大師', type: '策略型車手' },
      { id: 6, name: '耐力機器', type: '長距離選手' },
      { id: 7, name: '技巧達人', type: '技術型車手' },
      { id: 8, name: '補給專家', type: '支援型車手' },
      { id: 9, name: '下坡狂人', type: '速降專家' },
      { id: 10, name: '混亂製造者', type: '干擾型車手' }
    ]);
    
    // Create a simple track placeholder
    setTrack({
      name: '隨機賽道',
      length: 30
    });
  }, []);

  const startNewGame = () => {
    // Initialize new game instance (placeholder)
    const newGame = {
      selectedCharacters: [[], []],
      currentTurn: 0,
      turnNumber: 1,
      weather: '晴朗',
      getGameState: () => ({
        currentTurn: 0,
        turnNumber: 1,
        weather: '晴朗',
        selectedCharacters: [[], []],
      }),
      executeAction: () => ({
        success: true,
        message: '動作執行成功'
      })
    };
    setGame(newGame);
    
    // Move to character selection
    setGameState('character-select');
  };

  const startGameWithSelectedCharacters = (selectedCharacters) => {
    // Update game with selected characters
    if (game) {
      game.selectedCharacters[0] = selectedCharacters;
    }
    
    // Move to game screen
    setGameState('game');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  // Render different game screens based on state
  const renderGameScreen = () => {
    switch (gameState) {
      case 'menu':
        return (
          <div className="menu-screen">
            <h1 className="game-title">風馳電掣</h1>
            <div className="version-number">v{VERSION}</div>
            <div className="menu-options">
              <button className="menu-button primary" onClick={startNewGame}>
                開始新遊戲
              </button>
              <button className="menu-button">
                遊戲設置
              </button>
              <button className="menu-button">
                遊戲教學
              </button>
            </div>
          </div>
        );
      
      case 'character-select':
        return (
          <CharacterSelect 
            availableCharacters={characters}
            game={game}
            onConfirmSelection={startGameWithSelectedCharacters}
            onBack={returnToMenu}
          />
        );
      
      case 'game':
        return (
          <GameBoard 
            game={game}
            track={track}
            playerData={playerData}
            onExitGame={returnToMenu}
          />
        );
      
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="App">
      {renderGameScreen()}
    </div>
  );
}

export default App;