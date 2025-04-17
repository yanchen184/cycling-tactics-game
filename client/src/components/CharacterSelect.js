import React, { useState, useEffect } from 'react';

/**
 * Character selection screen component
 * Allows player to select characters in snake draft format
 */
function CharacterSelect({ availableCharacters, game, onConfirmSelection, onBack }) {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0); // 0 = player, 1 = opponent
  const [selectionPhase, setSelectionPhase] = useState(0);
  const [aiOpponent, setAiOpponent] = useState(true);
  
  // Selection order based on snake draft (1-2-2-1)
  const selectionOrder = [0, 1, 1, 0, 0, 1];
  
  // Initialize selection phase when component mounts
  useEffect(() => {
    setCurrentPlayer(selectionOrder[0]);
  }, []);
  
  // Handle AI opponent selection automatically
  useEffect(() => {
    if (aiOpponent && currentPlayer === 1) {
      setTimeout(() => {
        // AI makes a random selection from available characters
        const availableIds = availableCharacters
          .filter(char => !selectedCharacters.includes(char.id))
          .map(char => char.id);
        
        if (availableIds.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableIds.length);
          handleCharacterSelect(availableIds[randomIndex]);
        }
      }, 1000); // Delay for 1 second to simulate thinking
    }
  }, [currentPlayer, aiOpponent, availableCharacters, selectedCharacters]);
  
  /**
   * Handle character selection
   * @param {number} characterId - ID of the selected character
   */
  const handleCharacterSelect = (characterId) => {
    // Check if it's the player's turn and character is not already selected
    if (currentPlayer === 0 || !aiOpponent) {
      if (selectedCharacters.includes(characterId)) {
        return; // Character already selected
      }
      
      // Add character to selected list
      setSelectedCharacters([...selectedCharacters, characterId]);
      
      // Move to next selection phase
      const nextPhase = selectionPhase + 1;
      setSelectionPhase(nextPhase);
      
      // Check if all characters have been selected
      if (nextPhase >= selectionOrder.length) {
        // Selection complete
        const playerCharacters = availableCharacters.filter(char => 
          selectedCharacters.includes(char.id) && 
          selectionOrder[selectedCharacters.indexOf(char.id)] === 0
        );
        
        onConfirmSelection(playerCharacters);
      } else {
        // Set next player
        setCurrentPlayer(selectionOrder[nextPhase]);
      }
    }
  };
  
  /**
   * Check if a character is selected
   * @param {number} characterId - ID of the character to check
   * @returns {boolean} True if character is selected
   */
  const isCharacterSelected = (characterId) => {
    return selectedCharacters.includes(characterId);
  };
  
  /**
   * Get selection info text
   * @returns {string} Selection phase info
   */
  const getSelectionInfo = () => {
    if (selectionPhase >= selectionOrder.length) {
      return "選擇完成！";
    }
    
    const playerText = currentPlayer === 0 ? "您的選擇" : "對手選擇";
    return `第 ${selectionPhase + 1} 輪選擇: ${playerText}`;
  };
  
  /**
   * Get selection status for a character
   * @param {number} characterId - ID of the character to check
   * @returns {string} Selection status text
   */
  const getSelectionStatus = (characterId) => {
    if (!isCharacterSelected(characterId)) {
      return "";
    }
    
    const index = selectedCharacters.indexOf(characterId);
    const selectedBy = selectionOrder[index] === 0 ? "您" : "對手";
    return `${selectedBy}的選擇`;
  };
  
  return (
    <div className="character-select-screen">
      <h2>選擇角色</h2>
      <p className="selection-info">{getSelectionInfo()}</p>
      
      <div className="character-grid">
        {availableCharacters.map(character => (
          <div 
            key={character.id}
            className={`character-card ${isCharacterSelected(character.id) ? 'selected' : ''}`}
            onClick={() => handleCharacterSelect(character.id)}
          >
            <div className="character-image">
              {/* Placeholder for character image */}
              {character.name.charAt(0)}
            </div>
            <div className="character-name">{character.name}</div>
            <div className="character-type">{character.type}</div>
            <div className="selection-status">{getSelectionStatus(character.id)}</div>
          </div>
        ))}
      </div>
      
      <div className="selection-controls">
        <button onClick={onBack}>返回</button>
        {selectionPhase >= selectionOrder.length && (
          <button className="primary" onClick={() => {
            const playerCharacters = availableCharacters.filter(char => 
              selectedCharacters.includes(char.id) && 
              selectionOrder[selectedCharacters.indexOf(char.id)] === 0
            );
            onConfirmSelection(playerCharacters);
          }}>
            開始遊戲
          </button>
        )}
      </div>
    </div>
  );
}

export default CharacterSelect;