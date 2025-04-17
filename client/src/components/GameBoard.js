import React, { useState, useEffect } from 'react';

/**
 * Game board component - Main gameplay interface
 */
function GameBoard({ game, track, playerData, onExitGame }) {
  const [gameState, setGameState] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [activeAction, setActiveAction] = useState(null);
  const [gameLog, setGameLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  
  // Initialize game state when component mounts
  useEffect(() => {
    if (game) {
      updateGameState();
      
      // Add initial game log entry
      addToGameLog("遊戲開始！準備在終點線前擊敗對手。");
    }
  }, [game]);
  
  // Handle AI opponent turns automatically
  useEffect(() => {
    if (game && gameState.currentTurn === 1 && playerData.opponentType === 'ai') {
      // Slight delay for AI to make its move
      const aiTimer = setTimeout(() => {
        executeAiMove();
      }, 1500);
      
      return () => clearTimeout(aiTimer);
    }
  }, [gameState.currentTurn, game, playerData.opponentType]);
  
  /**
   * Update local game state from game instance
   */
  const updateGameState = () => {
    if (game) {
      const state = game.getGameState();
      setGameState(state);
      setIsPlayerTurn(state.currentTurn === 0);
    }
  };
  
  /**
   * Add entry to game log
   * @param {string} message - Log message
   */
  const addToGameLog = (message) => {
    setGameLog(prevLog => [message, ...prevLog]);
  };
  
  /**
   * Handle character selection
   * @param {Object} character - Selected character
   */
  const handleCharacterSelect = (character) => {
    if (isPlayerTurn) {
      setSelectedCharacter(character);
      setActiveAction(null);
    }
  };
  
  /**
   * Handle action button click
   * @param {string} action - Action type
   */
  const handleActionSelect = (action) => {
    if (isPlayerTurn && selectedCharacter) {
      setActiveAction(action);
    }
  };
  
  /**
   * Execute player action
   * @param {Object} actionParams - Action parameters
   */
  const executeAction = (actionParams) => {
    if (!isPlayerTurn || !selectedCharacter || !activeAction) {
      return;
    }
    
    // Execute action in game
    const result = game.executeAction(0, activeAction, {
      characterId: selectedCharacter.id,
      ...actionParams
    });
    
    // Log the result
    addToGameLog(result.message || `${selectedCharacter.name} 執行了 ${activeAction} 動作`);
    
    // Update game state
    updateGameState();
    
    // Reset selections
    setSelectedCharacter(null);
    setActiveAction(null);
  };
  
  /**
   * Execute AI opponent move
   */
  const executeAiMove = () => {
    // Simple AI just makes random moves for now
    const aiPlayer = 1;
    const aiCharacters = gameState.selectedCharacters?.[aiPlayer] || [];
    
    if (aiCharacters.length > 0) {
      // Select random character
      const randomCharIndex = Math.floor(Math.random() * aiCharacters.length);
      const selectedChar = aiCharacters[randomCharIndex];
      
      // Select random action
      const actions = ['move', 'swap', 'ability', 'rest'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      // Prepare action params based on action type
      let actionParams = { characterId: selectedChar.id };
      
      if (randomAction === 'move') {
        actionParams.spaces = Math.floor(Math.random() * 3) + 1; // 1-3 spaces
      } else if (randomAction === 'swap') {
        // Find another character to swap with
        const otherChars = aiCharacters.filter(c => c.id !== selectedChar.id);
        if (otherChars.length > 0) {
          const targetChar = otherChars[Math.floor(Math.random() * otherChars.length)];
          actionParams.targetCharacterId = targetChar.id;
        } else {
          // Fall back to move if no swap target
          actionParams.spaces = Math.floor(Math.random() * 3) + 1;
        }
      }
      
      // Execute the AI action
      const result = game.executeAction(aiPlayer, randomAction, actionParams);
      
      // Log the result
      addToGameLog(`對手的 ${selectedChar.name} ${result.message || '執行了一個動作'}`);
      
      // Update game state
      updateGameState();
    }
  };
  
  /**
   * Render active action panel based on selected action
   * @returns {JSX.Element} Action panel component
   */
  const renderActionPanel = () => {
    if (!selectedCharacter) {
      return <p>請選擇一名單車手來執行動作。</p>;
    }
    
    if (!activeAction) {
      return (
        <div>
          <p>選擇要執行的動作：</p>
          <div className="action-buttons">
            <button 
              className="action-button"
              onClick={() => handleActionSelect('move')}
            >
              踩踏
            </button>
            <button 
              className="action-button"
              onClick={() => handleActionSelect('swap')}
            >
              換位
            </button>
            <button 
              className="action-button"
              onClick={() => handleActionSelect('ability')}
            >
              技能
            </button>
            <button 
              className="action-button"
              onClick={() => handleActionSelect('rest')}
            >
              休息
            </button>
          </div>
        </div>
      );
    }
    
    // Render specific action panel based on active action
    switch(activeAction) {
      case 'move':
        return (
          <div>
            <p>移動距離：</p>
            <div className="action-buttons">
              <button 
                className="action-button"
                onClick={() => executeAction({ spaces: 1 })}
              >
                1 格
              </button>
              <button 
                className="action-button"
                onClick={() => executeAction({ spaces: 2 })}
              >
                2 格
              </button>
              <button 
                className="action-button"
                onClick={() => executeAction({ spaces: 3 })}
              >
                3 格
              </button>
            </div>
            <button onClick={() => setActiveAction(null)}>返回</button>
          </div>
        );
        
      case 'swap':
        return (
          <div>
            <p>選擇要交換位置的隊友：</p>
            <div className="action-buttons">
              {gameState.selectedCharacters?.[0]
                .filter(char => char.id !== selectedCharacter.id)
                .map(char => (
                  <button 
                    key={char.id}
                    className="action-button"
                    onClick={() => executeAction({ targetCharacterId: char.id })}
                  >
                    {char.name}
                  </button>
                ))
              }
            </div>
            <button onClick={() => setActiveAction(null)}>返回</button>
          </div>
        );
        
      case 'ability':
        return (
          <div>
            <p>使用技能：</p>
            <div className="action-buttons">
              {selectedCharacter.abilities?.map((ability, index) => (
                <button 
                  key={index}
                  className="action-button"
                  onClick={() => executeAction({ abilityIndex: index })}
                >
                  {ability.name}
                </button>
              )) || <p>無可用技能</p>}
            </div>
            <button onClick={() => setActiveAction(null)}>返回</button>
          </div>
        );
        
      case 'rest':
        return (
          <div>
            <p>確定要休息恢復體力嗎？</p>
            <div className="action-buttons">
              <button 
                className="action-button primary"
                onClick={() => executeAction({})}
              >
                確定
              </button>
              <button 
                className="action-button"
                onClick={() => setActiveAction(null)}
              >
                取消
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="game-board">
      <div className="game-header">
        <h2>風馳電掣</h2>
        <div>
          <span>回合：{gameState.turnNumber || 1}</span>
          <span className="weather-display">天氣：{gameState.weather || '晴朗'}</span>
        </div>
        <button onClick={onExitGame}>退出</button>
      </div>
      
      <div className="track-display">
        {/* Render track visualization here */}
        <p>賽道可視化區域</p>
        
        {/* Render character positions on track */}
        <div className="track-positions">
          {/* Map positions and characters */}
        </div>
      </div>
      
      <div className="player-area">
        <h3>{isPlayerTurn ? '您的回合' : '對手回合'}</h3>
        
        <div className="player-formation">
          {gameState.selectedCharacters?.[0]?.map(character => (
            <div 
              key={character.id}
              className={`cyclist-card ${selectedCharacter?.id === character.id ? 'active' : ''}`}
              onClick={() => handleCharacterSelect(character)}
            >
              <div className="cyclist-avatar">
                {character.name.charAt(0)}
              </div>
              <div className="cyclist-name">{character.name}</div>
              <div className="cyclist-position">位置: {character.position === 0 ? '領先' : 
                             character.position === 1 ? '中間' : '後衛'}</div>
              <div className="stamina-bar">
                <div 
                  className="stamina-fill" 
                  style={{ width: `${(character.currentStamina / character.stats.stamina) * 100}%` }}
                ></div>
              </div>
              <div className="stamina-text">
                體力: {Math.round(character.currentStamina)}/{character.stats.stamina}
              </div>
            </div>
          ))}
        </div>
        
        <div className="action-panel">
          {renderActionPanel()}
        </div>
      </div>
      
      <div className="game-log">
        <h4>遊戲日誌</h4>
        {gameLog.map((entry, index) => (
          <div key={index} className="log-entry">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;