import WebSocketManager from './WebSocketManager.js';
import CodeInterface from './CodeInterface.js';
import RubiksCubeGame from '../games/RubiksCube/RubiksCubeGame.js';

/**
 * Main platform for managing games, code execution, and WebSocket communication
 */
class GamesPlatform {
    /**
     * Creates a new games platform
     */
    constructor() {
        this.games = {};                    // Registry of available games
        this.currentGame = null;            // Currently active game
        this.currentGameId = null;          // ID of current game
        this.wsManager = new WebSocketManager(this);
        this.codeInterface = null;
        this.scene = null;                  // Three.js scene
        
        // Command processing properties
        this.pendingCommands = [];
        this.isProcessingCommands = false;
        
        // Move queue properties
        this.moveQueue = [];
        this.isExecutingQueue = false;
        this.stopAfterCurrentMove = false;
        
        // Code execution properties
        this.isExecutingCode = false;
        this.isExecutingLocalJS = false;
        this.isExecutingRemoteCode = false;
        this.currentCodeLanguage = null;
        this.lastActivityTime = 0;
    }
    
    /**
     * Initializes the platform with the given scene
     * @param {THREE.Scene} scene - The THREE.js scene
     */
    initialize(scene) {
        this.scene = scene;
        
        // Create the code interface
        this.codeInterface = new CodeInterface(this);
        
        // Create game registry
        this.initializeGameRegistry();
        
        // Set up animation loop
        this.animate();
    }
    
    /**
     * Initializes the game registry
     */
    initializeGameRegistry() {
        // This will be populated with game registrations
        console.log('Game registry initialized');
    }
    
    /**
     * Connects to a WebSocket server
     * @param {string} url - WebSocket server URL
     */
    connectToServer(url) {
        this.wsManager.connect(url);
        console.log(`Attempting to connect to WebSocket server at: ${url}`);
    }
    
    /**
     * Registers a game with the platform
     * @param {string} gameId - Unique game identifier
     * @param {class} gameClass - Game class constructor
     */
    registerGame(gameId, gameClass) {
        this.games[gameId] = gameClass;
        console.log(`Game registered: ${gameId}`);
    }
    
    /**
     * Loads a game by ID
     * @param {string} gameId - Game ID to load
     * @returns {boolean} Whether the game was loaded successfully
     */
    loadGame(gameId) {
        if (!this.games[gameId]) {
            console.error(`Game not found: ${gameId}`);
            return false;
        }
        
        // Clean up current game
        if (this.currentGame) {
            this.currentGame.cleanup();
        }
        
        // Create and initialize new game
        this.currentGame = new this.games[gameId]();
        this.currentGameId = gameId;
        this.currentGame.initialize(this.scene);
        
        // Update the code interface with the game's help content
        if (this.codeInterface) {
            this.codeInterface.updateHelpContent(
                this.currentGame.getHelpContent()
            );
        }
        
        // Send initial state to server
        this.sendGameState();
        
        console.log(`Game loaded: ${gameId}`);
        return true;
    }
    
    /**
     * Returns the ID of the current game
     * @returns {string} Current game ID
     */
    getCurrentGameId() {
        return this.currentGameId;
    }
    
    /**
     * Executes code in the specified language
     * @param {string} code - Code to execute
     * @param {string} language - Programming language
     */
    executeCode(code, language) {
        if (!this.currentGame) {
            this.handleNoGameLoaded();
            return;
        }
        
        if (!this.wsManager.connected) {
            this.handleNotConnected();
            return;
        }
        
        // Reset the stop flag when starting new execution
        this.stopAfterCurrentMove = false;
        
        // Set flags to track execution state
        this.isExecutingCode = true;
        this.currentCodeLanguage = language;
        
        if (language === 'javascript') {
            // For JavaScript, we can execute locally
            this.executeJavaScriptLocally(code);
        } else {
            // For other languages, send to server
            this.executeRemoteCode(code, language);
        }
    }
    
    /**
     * Handles case when no game is loaded
     */
    handleNoGameLoaded() {
        if (this.codeInterface) {
            this.codeInterface.log('No game loaded', 'error');
            this.codeInterface.onExecutionComplete();
        }
    }
    
    /**
     * Handles case when not connected to server
     */
    handleNotConnected() {
        if (this.codeInterface) {
            this.codeInterface.log('Not connected to server', 'error');
            this.codeInterface.onExecutionComplete();
        }
    }
    
    
    /**
     * Executes code on the remote server
     * @param {string} code - Code to execute
     * @param {string} language - Programming language
     */
    executeRemoteCode(code, language) {
        //This ensures the button stays in "Stop Execution" state
        this.isExecutingRemoteCode = true;
        
        // Track start time for debugging
        this.remoteExecutionStartTime = Date.now();
        
        if (this.codeInterface) {
            this.codeInterface.addDebugInfo(`Starting remote execution (${language})`);
        }
        
        this.wsManager.sendCodeExecutionRequest(
            code, 
            language,
            (result) => this.handleCodeExecutionResult(result)
        );
    }
    
    /**
     * Executes JavaScript code locally
     * @param {string} code - JavaScript code to execute
     */
    executeJavaScriptLocally(code) {
        if (!this.currentGame) return;
        
        // Set a flag to track JavaScript execution
        this.isExecutingLocalJS = true;
        
        // Reset the stop flag when starting new execution
        this.stopAfterCurrentMove = false;
        
        // Keep track of the last move time to detect completion
        this.lastActivityTime = Date.now();
        
        try {
            // Wrap code in async function for await support
            const wrappedCode = `
                (async () => {
                    try {
                        // Track when the execution starts
                        window._jsExecutionStarted = Date.now();
                        window._jsExecutionFinished = false;
                        
                        ${code}
                        
                        // Signal that the code has reached the end
                        // But DON'T mark as fully completed yet
                        window._jsExecutionReachedEnd = true;
                        console.log("[DEBUG] JavaScript code reached end of execution block");
                    } catch (error) {
                        console.error("Error in JavaScript execution:", error);
                        if (this.codeInterface) {
                            this.codeInterface.log(\`Error: \${error.message}\`, 'error');
                        }
                        window._jsExecutionFinished = true;
                    } finally {
                        // Signal that code block has finished
                        // But NOT that all animations are complete
                        console.log("[DEBUG] Finally block reached in JavaScript execution");
                        
                        // Don't set _jsExecutionCompleted here
                        // We'll wait for all moves to complete
                    }
                })();
            `;
            
            // Create sandbox with game command handlers
            const sandbox = this.createExecutionSandbox();
            
            // Reset the completion flags
            window._jsExecutionStarted = null;
            window._jsExecutionReachedEnd = false;
            window._jsExecutionCompleted = false;
            window._jsExecutionFinished = false;
            
            // Execute code in the sandbox
            const executeFunction = new Function(...Object.keys(sandbox), wrappedCode);
            executeFunction(...Object.values(sandbox));
            
            // Set up a completion detector
            this.setupCompletionDetector();
            
        } catch (error) {
            this.handleLocalExecutionError(error);
        }
    }
    
    /**
     * Creates a sandbox environment for code execution
     * @returns {Object} Sandbox object with console and game-specific API
     */
    createExecutionSandbox() {
        // Game-specific API
        const gameSandbox = this.createGameSpecificSandbox();
        
        // Create sandbox with console handlers
        return {
            console: {
                log: (msg) => {
                    console.log(msg); // Also log to browser console for debugging
                    
                    if (this.codeInterface) {
                        this.codeInterface.log(msg);
                    }
                    
                    this.wsManager.sendConsoleOutput({
                        type: 'log',
                        message: msg
                    });
                    
                },
                error: (msg) => {
                    console.error(msg); // log to browser console
                    
                    if (this.codeInterface) {
                        this.codeInterface.log(msg, 'error');
                    }
                    this.wsManager.sendConsoleOutput({
                        type: 'error',
                        message: msg
                    });
                },
                warn: (msg) => {
                    console.warn(msg); // log to browser console
                    
                    if (this.codeInterface) {
                        this.codeInterface.log(msg, 'warning');
                    }
                    this.wsManager.sendConsoleOutput({
                        type: 'warning',
                        message: msg
                    });
                }
            },
            // Game-specific API
            ...gameSandbox
        };
    }
    
    /**
     * Handles errors in local code execution
     * @param {Error} error - Error object
     */
    handleLocalExecutionError(error) {
        console.error('Error executing JavaScript code:', error);
        if (this.codeInterface) {
            this.codeInterface.log(`Error: ${error.message}`, 'error');
            this.codeInterface.onExecutionComplete();
        }
        this.isExecutingLocalJS = false;
    }
    
    /**
     * Waits for all moves to complete before finalizing execution
     */
    waitForMovesToComplete() {
        const checkAllMovesComplete = () => {
            // Check if there are any ongoing rotations or queued moves
            if (this.isExecutingQueue || this.moveQueue.length > 0 || 
                (this.currentGame && this.currentGame.isRotating)) {
                
                setTimeout(checkAllMovesComplete, 200);
            } else {
                window._jsExecutionCompleted = true;
            }
        };
        
        // Start checking
        setTimeout(checkAllMovesComplete, 300);
    }
    
    /**
     * Sets up a detector to determine when JavaScript execution is complete
     */
    setupCompletionDetector() {
        // Clear any existing detector
        if (this.completionDetectorInterval) {
            clearInterval(this.completionDetectorInterval);
        }
        
        // Track time since last activity
        this.lastActivityTime = Date.now();
        
        // Check for completion periodically
        this.completionDetectorInterval = setInterval(() => {
            const now = Date.now();
            
            // Update last activity time if there's a move in progress
            if (this.isExecutingQueue || this.moveQueue.length > 0 || 
                (this.currentGame && this.currentGame.isRotating)) {
                this.lastActivityTime = now;
                return; // Don't proceed with completion checks if moves are in progress
            }
            
            // Check if explicitly marked as completed
            if (window._jsExecutionCompleted) {
                this.finishJavaScriptExecution();
                return;
            }
            
            // Check if code has reached the end and no pending activity
            if (window._jsExecutionReachedEnd) {
                // Wait longer after the last activity before completing
                if (now - this.lastActivityTime > 1500) {
                    this.finishJavaScriptExecution();
                    return;
                }
            }
            
            // Failsafe: if more than 15 seconds passed since last activity, assume completion
            const maxInactivityTime = 15000; // 15 seconds
            if (window._jsExecutionStarted && (now - this.lastActivityTime > maxInactivityTime)) {
                this.finishJavaScriptExecution();
            }
            
        }, 300); // Check every 300ms
    }
    
    /**
     * Finishes JavaScript execution and updates UI
     */
    finishJavaScriptExecution() {
        // Do one final check to make sure all moves are complete
        if (this.isExecutingQueue || this.moveQueue.length > 0 || 
            (this.currentGame && this.currentGame.isRotating)) {
            
            // Try again after a short delay
            setTimeout(() => this.finishJavaScriptExecution(), 500);
            return;
        }
        
        // Clear the completion detector
        if (this.completionDetectorInterval) {
            clearInterval(this.completionDetectorInterval);
            this.completionDetectorInterval = null;
        }
        
        // Only complete once
        if (!this.isExecutingLocalJS) {
            return;
        }
        
        // Mark execution as complete
        this.isExecutingLocalJS = false;
        
        // Update UI if needed
        if (this.codeInterface) {
            this.codeInterface.onExecutionComplete();
            
            // Force button state after a delay to ensure all animations complete
            if (window.forceButtonState) {
                setTimeout(() => window.forceButtonState('execute'), 500);
            }
        }
        console.log(this.sendGameState());
    }
    
    /**
     * Creates a game-specific sandbox based on the current game
     * @returns {Object} Game-specific API object
     */
    createGameSpecificSandbox() {
        // Default empty sandbox
        const sandbox = {};
        
        // Add game-specific API based on current game
        if (this.currentGameId === 'rubiks_cube') {
            sandbox.cube = this.createRubiksCubeAPI();
        }
        
        return sandbox;
    }

    /**
     * Creates the Rubik's Cube API for code execution
     * @returns {Object} Rubik's Cube API object
     */
    createRubiksCubeAPI() {
        // Initialize the move queue if not already initialized
        if (!this.moveQueue) {
            this.moveQueue = [];
        }
        this.isExecutingQueue = false;
        this.stopAfterCurrentMove = false;
        
        // Function to queue a move and return a promise
        const queueMove = (face, direction) => {
            // Update the activity time whenever a move is queued
            this.lastActivityTime = Date.now();
            
            // If we're already stopping, don't queue new moves
            if (this.stopAfterCurrentMove) {
                return Promise.resolve(false);
            }
            
            return new Promise(resolve => {
                // Add the move to the queue with its resolve function
                this.moveQueue.push({ face, direction, resolve });
                
                // Start processing if not already doing so
                if (!this.isExecutingQueue) {
                    this.processNextMove();
                }
            });
        };
        
        // Create an object with all the API methods
        return {
            R: () => queueMove('R', 'clockwise'),
            RPrime: () => queueMove('R', 'counterclockwise'),
            U: () => queueMove('U', 'clockwise'),
            UPrime: () => queueMove('U', 'counterclockwise'),
            F: () => queueMove('F', 'clockwise'),
            FPrime: () => queueMove('F', 'counterclockwise'),
            B: () => queueMove('B', 'clockwise'),
            BPrime: () => queueMove('B', 'counterclockwise'),
            L: () => queueMove('L', 'clockwise'),
            LPrime: () => queueMove('L', 'counterclockwise'),
            D: () => queueMove('D', 'clockwise'),
            DPrime: () => queueMove('D', 'counterclockwise'),
            
            // Add executeSequence method for convenience
            executeSequence: async (moves) => {
                if (!Array.isArray(moves) || moves.length === 0) {
                    return;
                }
                
                for (const move of moves) {
                    if (typeof move === 'string' && this.cube[move]) {
                        // Each move returns whether to continue (false if stopping)
                        const shouldContinue = await this.cube[move]();
                        if (!shouldContinue) {
                            break;
                        }
                    }
                }
            }
        };
    }
    
    /**
     * Processes the next move in the queue
     */
    processNextMove() {
        // If queue is empty or we're finished with stopping execution
        if (!this.moveQueue || this.moveQueue.length === 0) {
            this.isExecutingQueue = false;
            
            // If we were stopping execution, complete the process now
            if (this.stopAfterCurrentMove) {
                this.stopAfterCurrentMove = false;
                
                // Clear any remaining items in the queue (just to be safe)
                this.moveQueue = [];
                
                if (this.codeInterface) {
                    this.codeInterface.log('Execution stopped after completing current move', 'info');
                    this.codeInterface.onExecutionComplete();
                }
            }
            return;
        }
        
        this.isExecutingQueue = true;
        const moveInfo = this.moveQueue.shift();
        const { face, direction, resolve } = moveInfo;
        
        // Execute the command
        const command = { action: 'rotate', face, direction };
        if (this.currentGame && this.currentGame.processCommand) {
            this.currentGame.processCommand(command);
            
            // Check every 100ms if the rotation is complete
            this.checkMoveCompletion(resolve);
        } else {
            // Resolve with failure if there's a resolver
            if (resolve) {
                resolve(false);
            }
            
            // Move to the next command anyway
            setTimeout(() => this.processNextMove(), 50);
        }
    }
    
    /**
     * Checks if a move has completed and processes the next move when done
     * @param {Function} resolve - Promise resolve function
     */
    checkMoveCompletion(resolve) {
        const checkComplete = () => {
            if (this.currentGame && this.currentGame.isRotating) {
                setTimeout(checkComplete, 100);
            } else {
                // Update the activity time when a move completes
                this.lastActivityTime = Date.now();
                
                // IMPORTANT: Resolve the promise BEFORE processing the next move
                if (resolve) {
                    resolve(true); // Signal success to the waiting promise
                }
                
                // If we're stopping after this move, clear the queue
                if (this.stopAfterCurrentMove) {
                    this.moveQueue = [];
                }
                
                // Process next move after a short delay
                setTimeout(() => this.processNextMove(), 50);
            }
        };
        
        // Start checking
        setTimeout(checkComplete, 100);
    }
    
    /**
     * Adds a move to the queue without using a promise (for remote execution)
     * @param {string} face - Face to rotate
     * @param {string} direction - Direction of rotation
     */
    queueMoveAction(face, direction) {
        // If moveQueue doesn't exist yet, create it
        if (!this.moveQueue) {
            this.moveQueue = [];
            this.isExecutingQueue = false;
        }
        
        // If we're already stopping, don't queue new moves
        if (this.stopAfterCurrentMove) {
            return;
        }
        
        // Add the move to the queue
        this.moveQueue.push({ face, direction });
        
        // Start processing if not already doing so
        if (!this.isExecutingQueue) {
            this.processNextMove();
        }
    }

    /**
     * Handles code execution results from the server
     * @param {Object} result - Execution result object
     */
    handleCodeExecutionResult(result) {
        if (!result) {
            return;
        }
        
        if (this.codeInterface) {
            this.codeInterface.addDebugInfo(`Got execution result (status: ${result.status || 'none'})`);
        }
        
        // Calculate execution time for debugging
        if (this.remoteExecutionStartTime) {
            const executionTime = Date.now() - this.remoteExecutionStartTime;
            console.log(`Execution time: ${executionTime}ms`);
        }
        
        // Process console output
        this.processConsoleOutput(result);
        
        // Process commands only if we're not stopping execution
        if (result.commands && result.commands.length > 0 && !this.stopAfterCurrentMove) {
            if (this.codeInterface) {
                this.codeInterface.addDebugInfo(`Processing ${result.commands.length} commands`);
            }
            
            // Queue moves in sequence
            this.processServerCommands(result.commands);
        } else {
            if (this.codeInterface) {
                this.codeInterface.addDebugInfo("No commands to process");
            }
            
            // If there are no commands, we need to explicitly complete execution
            if (!result.commands || result.commands.length === 0) {
                this.completeEmptyExecution();
            }
        }
    }
    
    /**
     * Processes console output from execution results
     * @param {Object} result - Execution result object
     */
    processConsoleOutput(result) {
        if (result.output && this.codeInterface) {
            result.output.forEach(item => {
                this.codeInterface.log(item.message, item.type);
            });
        }
    }
    
    /**
     * Completes execution when there are no commands to process
     */
    completeEmptyExecution() {
        if (window.buttonMonitorInterval) {
            clearInterval(window.buttonMonitorInterval);
        }
        
        // Set a flag to prevent button flicker after completion
        window.recentlyCompletedExecution = true;
        
        // Wait a bit, then complete
        setTimeout(() => {
            this.isExecutingRemoteCode = false;
            
            if (this.codeInterface) {
                this.codeInterface.addDebugInfo("No commands - completing after delay");
                this.codeInterface.onExecutionComplete();
            }
            
            // Clear the flag after some time
            setTimeout(() => {
                window.recentlyCompletedExecution = false;
            }, 1000);
        }, 500);
    }

    /**
     * Processes commands received from the server
     * @param {Array} commands - Array of command objects
     */
    processServerCommands(commands) {
        // No commands to process
        if (!commands || commands.length === 0) {
            // Signal completion
            setTimeout(() => {
                if (this.isExecutingRemoteCode) {
                    this.isExecutingRemoteCode = false;
                    
                    if (this.codeInterface) {
                        this.codeInterface.addDebugInfo("No commands - completing");
                        this.codeInterface.onExecutionComplete();
                        
                        // Add a direct call to force button state
                        if (window.forceButtonState) {
                            setTimeout(() => window.forceButtonState('execute'), 200);
                        }
                    }
                }
            }, 500);
            
            return;
        }
        
        // Queue all commands at once
        commands.forEach(command => {
            if (command.action === 'rotate') {
                // Add each rotation command to the queue
                this.queueMoveAction(command.face, command.direction);
            }
        });
        
        // Set up a check to monitor when all commands are processed
        this.monitorCommandCompletion();
    }
    
    /**
     * Monitors when all commands have been processed
     */
    monitorCommandCompletion() {
        const checkIfDone = () => {
            if (this.moveQueue.length === 0 && !this.isExecutingQueue && 
                this.currentGame && !this.currentGame.isRotating) {
                
                // Complete execution
                this.isExecutingRemoteCode = false;
                
                if (this.codeInterface) {
                    this.codeInterface.addDebugInfo("All commands processed - completing");
                    this.codeInterface.onExecutionComplete();
                    
                    // Add a direct call to force button state
                    if (window.forceButtonState) {
                        setTimeout(() => window.forceButtonState('execute'), 200);
                    }
                }
            } else {
                // Still commands in the queue or executing, check again
                setTimeout(checkIfDone, 500);
            }
        };
        
        // Start checking after a delay to ensure queue processing has started
        setTimeout(checkIfDone, 1000);
    }
    
    /**
     * Queues a game command for execution
     * @param {Object} command - Command object
     */
    queueGameCommand(command) {
        this.pendingCommands.push(command);
        
        // Start processing if not already processing
        if (!this.isProcessingCommands) {
            this.processNextCommand();
        }
    }
    
    
    /**
     * Waits for rotation to complete before processing the next command
     */
    waitForRotationToComplete() {
        const checkRotation = () => {
            if (this.currentGame.isRotating) {
                setTimeout(checkRotation, 100);
            } else {
                console.log("Rotation complete, processing next command");
                setTimeout(() => this.processNextCommand(), 100);
            }
        };
        
        setTimeout(checkRotation, 100);
    }
    
    /**
     * Executes a game command immediately
     * @param {Object} command - Command object
     * @returns {boolean} Whether the command was successfully executed
     */
    executeGameCommand(command) {
        if (!this.currentGame) return false;
        console.log("executeGameCommand is called");

        const result = this.currentGame.processCommand(command);
        
        // Send updated state after command execution
        this.sendGameState();
        
        return result;
    }
    
    /**
     * Stops code execution gracefully
     */
    stopCodeExecution() {
        console.log("Stopping code execution gracefully...");
        
        // Set a flag to indicate execution should stop after current move
        this.stopAfterCurrentMove = true;
        
        // For remote execution, notify the server
        if (this.isExecutingRemoteCode) {
            console.log("Stopping remote code execution...");
            this.wsManager.sendStopExecutionRequest(this.wsManager.lastRequestId);
        }
        
        // Notify UI that we're in stopping state
        if (this.codeInterface) {
            this.codeInterface.log('Stopping execution after current move completes...', 'warning');
        }
    }

    /**
     * Called when the server confirms that execution has been stopped
     */
    onStopExecutionConfirmed() {
        console.log("Server confirmed stop execution");
        
        // Double-check that all local execution is also stopped
        this.pendingCommands = [];
        this.isProcessingCommands = false;
        
        this.moveQueue = [];
        this.isExecutingQueue = false;
        
        // If there's a code interface, make sure it's updated
        if (this.codeInterface) {
            this.codeInterface.log("Server confirmed execution stopped", "info");
            this.codeInterface.onExecutionComplete();
        }
    }
    
    /**
     * Resets the current game to its initial state
     * @returns {boolean} Whether the reset was successful
     */
    resetCurrentGame() {
        if (!this.currentGame) return false;
        
        console.log("Resetting current game");
        
        // Clear any pending commands
        this.pendingCommands = [];
        this.isProcessingCommands = false;
        
        // Clear any pending moves in the queue
        this.moveQueue = [];
        this.isExecutingQueue = false;
        
        // Reset the game
        this.currentGame.reset();
        
        // Send updated state to server
        this.sendGameState();
        
        // Update UI if needed
        if (this.codeInterface) {
            this.codeInterface.log("Game has been reset to initial state");
        }
        
        return true;
    }
    
    /**
     * Sends the current game state to the server
     */
    sendGameState() {
        if (!this.currentGame) return;

        const state = this.currentGame.getState();
        console.log(state);
        this.wsManager.sendGameState(state);
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update current game
        if (this.currentGame) {
            this.currentGame.update(performance.now());
        }
    }
    
    /**
     * Called when WebSocket connection is established
     */
    onConnect() {
        if (this.codeInterface) {
            this.codeInterface.updateConnectionStatus(true);
            this.codeInterface.log('Connected to server');
        }
        
        // Send initial handshake
        this.wsManager.sendMessage({
            type: 'handshake',
            clientInfo: {
                clientId: this.generateClientId(),
                version: '1.0.0'
            }
        });
    }
    
    /**
     * Called when WebSocket connection is closed
     */
    onDisconnect() {
        if (this.codeInterface) {
            this.codeInterface.updateConnectionStatus(false);
            this.codeInterface.log('Disconnected from server', 'warning');
        }
    }
    
    /**
     * Called when WebSocket error occurs
     * @param {Error} error - Error object
     */
    onError(error) {
        if (this.codeInterface) {
            this.codeInterface.log(`WebSocket error: ${error}`, 'error');
        }
    }
    
    /**
     * Generates a random client ID
     * @returns {string} Generated client ID
     */
    generateClientId() {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }
}

export default GamesPlatform;