/**
 * Base Game class defining the interface for all games in the platform
 * Child classes must override relevant methods to provide game-specific functionality
 */
class Game {
    /**
     * Creates a new game instance
     */
    constructor() {
      this.scene = null;
      this.initialized = false;
    }
    
    /**
     * Initializes the game with the given THREE.js scene
     * 
     * @param {THREE.Scene} scene 
     */
    initialize(scene) {
      this.scene = scene;
      this.initialized = true;
    }
    
    /**
     * Updates the game state for each animation frame
     * Should be implemented by child classes
     * 
     * @param {number} time - Current timestamp from requestAnimationFrame
     */
    update(time) {
      // To be implemented by child classes
    }
    
    /**
     * Processes a command from the code execution interface
     * 
     * @param {Object} command - Command object with action and parameters
     * @returns {boolean} Whether the command was successfully handled
     */
    processCommand(command) {
      console.log('Base game received command:', command);
      return false; // Not handled by default
    }
    
    /**
     * Returns the current game state for serialization or network transmission
     * 
     * @returns {Object} State object with type, gameId and state properties
     */
    getState() {
      return {
        type: 'game_state',
        gameId: this.getGameId(),
        state: {}
      };
    }
    
    /**
     * Returns the unique identifier for this game type
     * Must be overridden by child classes
     * 
     * @returns {string} Game identifier
     */
    getGameId() {
      return 'base_game';
    }
    
    /**
     * Resets the game to its initial state
     */
    reset() {
      // To be implemented by child classes
    }
    
    /**
     * Cleans up resources when switching to another game
     */
    cleanup() {
      // Child classes should override this to remove objects from the scene
    }
    
    /**
     * Returns help content for this game, used in UI
     * 
     * @returns {string} HTML-formatted help content
     */
    getHelpContent() {
      return '';
    }
  }
  
  export default Game;