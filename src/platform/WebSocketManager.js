/**
 * Manages WebSocket communication with the server for code execution and game state synchronization
 */
class WebSocketManager {
    /**
     * Creates a new WebSocket manager
     * @param {GamesPlatform} gamesPlatform - The games platform instance
     */
    constructor(gamesPlatform) {
        this.platform = gamesPlatform;
        this.socket = null;
        this.connected = false;
        this.pendingRequests = {};
        this.activeRequests = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3 seconds
        this.lastRequestId = null;
    }
    
    /**
     * Connects to the WebSocket server
     * @param {string} url - WebSocket server URL
     */
    connect(url) {
        this.url = url;
        
        try {
            this.socket = new WebSocket(url);
            
            this.socket.addEventListener('open', this.handleOpen.bind(this));
            this.socket.addEventListener('message', this.handleMessage.bind(this));
            this.socket.addEventListener('close', this.handleClose.bind(this));
            this.socket.addEventListener('error', this.handleError.bind(this));
            
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
        }
    }
    
    /**
     * Handles WebSocket open event
     */
    handleOpen() {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('Connected to WebSocket server');
        
        // Notify platform
        this.platform.onConnect();
    }
    
    /**
     * Handles WebSocket message event
     * @param {MessageEvent} event - WebSocket message event
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.processMessage(message);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }
    
    /**
     * Processes a received message
     * @param {Object} message - Parsed message object
     */
    processMessage(message) {
        if (!message || !message.type) {
            console.error('Invalid message format:', message);
            return;
        }
        
        // Add debug info to UI if available
        this.addDebugInfo(`Received: ${message.type}`);
        
        switch (message.type) {
            case 'handshake_response':
                this.handleHandshakeResponse(message);
                break;
                
            case 'execution_result':
                this.handleExecutionResult(message);
                break;
                
            case 'execution_stopped':
                this.handleExecutionStopped(message);
                break;
                
            default:
                console.log('Unhandled message type:', message.type);
                break;
        }
    }
    
    /**
     * Handles handshake response message
     * @param {Object} message - Handshake response message
     */
    handleHandshakeResponse(message) {
        console.log('Handshake response received:', message);
    }
    
    /**
     * Handles execution result message
     * @param {Object} message - Execution result message
     */
    handleExecutionResult(message) {
        // Clear the button check interval when we get a result
        if (this.buttonCheckInterval) {
            clearInterval(this.buttonCheckInterval);
        }
        
        if (message.requestId && this.pendingRequests[message.requestId]) {
            const callback = this.pendingRequests[message.requestId];
            delete this.pendingRequests[message.requestId];
            
            // Don't call callback too early
            setTimeout(() => {
                // Check if we have a result to pass to the callback
                if (message.result) {
                    callback(message.result);
                } else {
                    // If no result is provided, create a minimum result object
                    callback({
                        status: 'completed',
                        output: [],
                        commands: []
                    });
                }
            }, 500);
        }
    }
    
    /**
     * Handles execution stopped message
     * @param {Object} message - Execution stopped message
     */
    handleExecutionStopped(message) {
        console.log('Execution stopped received:', message);
        
        // Notify the platform that execution has been stopped
        if (this.platform.onStopExecutionConfirmed) {
            this.platform.onStopExecutionConfirmed();
        }
    }
    
    /**
     * Handles WebSocket close event
     */
    handleClose() {
        this.connected = false;
        console.log('Disconnected from WebSocket server');
        
        // Notify platform
        this.platform.onDisconnect();
        
        // Attempt to reconnect
        this.attemptReconnect();
    }
    
    /**
     * Attempts to reconnect to the WebSocket server
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(this.url), this.reconnectDelay);
        }
    }
    
    /**
     * Handles WebSocket error event
     * @param {Event} event - WebSocket error event
     */
    handleError(event) {
        console.error('WebSocket error:', event);
        
        // Notify platform
        this.platform.onError(event);
    }
    
    /**
     * Adds debug info to the UI if available
     * @param {string} message - Debug message
     */
    addDebugInfo(message) {
        if (this.platform && this.platform.codeInterface) {
            this.platform.codeInterface.addDebugInfo(message);
        }
    }
    
    /**
     * Sends a message to the WebSocket server
     * @param {Object} message - Message to send
     * @returns {boolean} Whether the message was sent successfully
     */
    sendMessage(message) {
        if (!this.connected) {
            console.warn('Cannot send message: not connected to WebSocket server');
            return false;
        }
        
        try {
            this.socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }
    
    /**
     * Sends the current game state to the server
     * @param {Object} state - Game state
     * @returns {boolean} Whether the message was sent successfully
     */
    sendGameState(state) {
        return this.sendMessage({
            type: 'game_state',
            state: state,
            timestamp: Date.now()
        });
    }
    
    /**
     * Sends a code execution request to the server
     * @param {string} code - Code to execute
     * @param {string} language - Programming language
     * @param {Function} callback - Callback function for execution result
     * @returns {boolean} Whether the request was sent successfully
     */
    sendCodeExecutionRequest(code, language, callback) {
        // Generate a unique request ID
        const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        // Store callback for when we get the response
        this.pendingRequests[requestId] = callback;
        
        // Track active requests by language
        if (!this.activeRequests) {
            this.activeRequests = {};
        }
        this.activeRequests[requestId] = language;
        
        // Save this requestId for stop commands
        this.lastRequestId = requestId;
        
        // Set flag to indicate remote code execution
        if (this.platform) {
            this.platform.isExecutingRemoteCode = true;
            this.platform.currentRequestId = requestId;
            this.addDebugInfo(`Sending ${language} request (${requestId})`);
        }
        
        // Send the message
        try {
            const message = {
                type: 'execute_code_request',
                requestId: requestId,
                code: code,
                language: language,
                timestamp: Date.now()
            };
            
            this.socket.send(JSON.stringify(message));
            
            // Set up interval to maintain button state
            this.setupButtonStateMonitor();
            
            return true;
        } catch (error) {
            console.error('Error sending execution request:', error);
            this.handleExecutionError(error);
            return false;
        }
    }
    
    /**
     * Sets up an interval to ensure the button state remains correct
     */
    setupButtonStateMonitor() {
        // Clear any existing interval
        if (this.buttonCheckInterval) {
            clearInterval(this.buttonCheckInterval);
        }
        
        // Only set up if we have access to the code interface
        if (this.platform && this.platform.codeInterface) {
            this.buttonCheckInterval = setInterval(() => {
                if (this.platform.isExecutingRemoteCode) {
                    const button = this.platform.codeInterface.executeButton;
                    if (button && button.textContent !== 'Stop Execution') {
                        button.textContent = 'Stop Execution';
                        button.style.backgroundColor = '#d83b01';
                        this.addDebugInfo("Fixed button state");
                    }
                } else {
                    // Stop checking if execution is done
                    clearInterval(this.buttonCheckInterval);
                }
            }, 100);
        }
    }
    
    /**
     * Handles execution error
     * @param {Error} error - Error object
     */
    handleExecutionError(error) {
        if (this.platform && this.platform.codeInterface) {
            this.platform.codeInterface.log(`Error sending request: ${error.message}`, "error");
            
            // Make sure we don't leave hanging state
            setTimeout(() => {
                this.platform.isExecutingRemoteCode = false;
                this.platform.codeInterface.onExecutionComplete();
            }, 500);
        }
    }
    
    /**
     * Sends console output to the server
     * @param {Object} output - Console output object
     * @returns {boolean} Whether the message was sent successfully
     */
    sendConsoleOutput(output) {
        return this.sendMessage({
            type: 'console_output',
            output: output,
            timestamp: Date.now()
        });
    }

    /**
     * Sends a request to stop code execution
     * @param {string} requestId - ID of the request to stop
     * @returns {boolean} Whether the message was sent successfully
     */
    sendStopExecutionRequest(requestId) {
        // Use the provided requestId or the last one
        const stopRequestId = requestId || this.lastRequestId || 
                            Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        // Register a callback for stop confirmation
        this.pendingRequests[stopRequestId] = (result) => {
            // Clear active request
            if (this.activeRequests && this.activeRequests[stopRequestId]) {
                delete this.activeRequests[stopRequestId];
            }
            
            // Notify the platform that server has confirmed the stop
            if (this.platform) {
                this.platform.isExecutingRemoteCode = false;
                if (this.platform.onStopExecutionConfirmed) {
                    this.platform.onStopExecutionConfirmed();
                }
            }
        };
        
        return this.sendMessage({
            type: 'stop_execution',
            requestId: stopRequestId,
            timestamp: Date.now()
        });
    }
    
    /**
     * Disconnects from the WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.connected = false;
    }
}

export default WebSocketManager;