// Utility functions for saving and loading game progress

export const saveGameProgress = (gameData) => {
  try {
    localStorage.setItem('elendorGameSave', JSON.stringify(gameData));
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
};

export const loadGameProgress = () => {
  try {
    const savedData = localStorage.getItem('elendorGameSave');
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
};

export const deleteSaveGame = () => {
  try {
    localStorage.removeItem('elendorGameSave');
    return true;
  } catch (error) {
    console.error('Error deleting save:', error);
    return false;
  }
}; 