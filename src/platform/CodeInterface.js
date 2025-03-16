/**
 * User interface for code editing and execution in the Rubik's Cube simulator
 */
class CodeInterface {
    /**
     * Creates a new code interface
     * @param {GamesPlatform} gamesPlatform - The games platform instance
     */
    constructor(gamesPlatform) {
        this.platform = gamesPlatform;
        this.isExecuting = false;
        this.timeouts = [];
        this.createInterface();
    }
    
    /**
     * Creates the code interface UI elements
     */
    createInterface() {
        this.createContainer();
        this.createTitle();
        this.createLanguageSelector();
        this.createCodeEditor();
        this.createExecuteButton();
        this.createResetButton();
        this.createConnectionStatus();
        this.createHelpSection();
        this.createDebugContainer();
    }
    
    /**
     * Creates the main container for the interface
     */
    createContainer() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.right = '10px';
        container.style.width = '400px';
        container.style.backgroundColor = '#1e1e1e';
        container.style.color = '#fff';
        container.style.borderRadius = '5px';
        container.style.padding = '10px';
        container.style.fontFamily = 'monospace';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        this.container = container;
    }
    
    /**
     * Creates the title for the interface
     */
    createTitle() {
        const title = document.createElement('h3');
        title.textContent = 'Code Interface';
        title.style.margin = '0 0 10px 0';
        this.container.appendChild(title);
    }
    
    /**
     * Creates the language selector dropdown
     */
    createLanguageSelector() {
        const languageSelector = document.createElement('select');
        languageSelector.style.marginBottom = '10px';
        languageSelector.style.padding = '5px';
        languageSelector.style.border = '1px solid #3d3d3d';
        languageSelector.style.borderRadius = '3px';
        languageSelector.style.backgroundColor = '#2d2d2d';
        languageSelector.style.color = '#d4d4d4';
        languageSelector.style.width = '100%';
        
        const languages = [
            { id: 'javascript', name: 'JavaScript' },
            { id: 'python', name: 'Python' },
            { id: 'java', name: 'Java' },
            { id: 'csharp', name: 'C#' }
        ];
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.id;
            option.textContent = lang.name;
            languageSelector.appendChild(option);
        });
        
        languageSelector.addEventListener('change', () => {
            const language = languageSelector.value;
            this.codeEditor.value = this.getDefaultCode(language);
        });
        
        this.container.appendChild(languageSelector);
        this.languageSelector = languageSelector;
    }
    
    /**
     * Creates the code editor textarea
     */
    createCodeEditor() {
        const codeEditor = document.createElement('textarea');
        codeEditor.style.width = '100%';
        codeEditor.style.height = '300px';
        codeEditor.style.backgroundColor = '#2d2d2d';
        codeEditor.style.color = '#d4d4d4';
        codeEditor.style.border = '1px solid #3d3d3d';
        codeEditor.style.borderRadius = '3px';
        codeEditor.style.padding = '8px';
        codeEditor.style.fontFamily = 'monospace';
        codeEditor.style.fontSize = '14px';
        codeEditor.style.marginBottom = '10px';
        codeEditor.style.resize = 'vertical';
        codeEditor.spellcheck = false;
        codeEditor.value = this.getDefaultCode('javascript');
        
        this.container.appendChild(codeEditor);
        this.codeEditor = codeEditor;
        
        // Create output console
        const outputConsole = document.createElement('div');
        outputConsole.style.width = '100%';
        outputConsole.style.height = '150px';
        outputConsole.style.backgroundColor = '#2d2d2d';
        outputConsole.style.color = '#d4d4d4';
        outputConsole.style.border = '1px solid #3d3d3d';
        outputConsole.style.borderRadius = '3px';
        outputConsole.style.padding = '8px';
        outputConsole.style.fontFamily = 'monospace';
        outputConsole.style.fontSize = '14px';
        outputConsole.style.marginBottom = '10px';
        outputConsole.style.overflow = 'auto';
        outputConsole.style.whiteSpace = 'pre-wrap';
        
        this.container.appendChild(outputConsole);
        this.outputConsole = outputConsole;
    }
    
    /**
     * Creates the execute/stop button
     */
    createExecuteButton() {
        const executeButton = document.createElement('button');
        executeButton.textContent = 'Execute Code';
        executeButton.style.backgroundColor = '#0078d7';
        executeButton.style.color = '#fff';
        executeButton.style.border = 'none';
        executeButton.style.borderRadius = '3px';
        executeButton.style.padding = '8px 16px';
        executeButton.style.cursor = 'pointer';
        executeButton.style.marginRight = '10px';
        executeButton.id = 'execute-button';
        
        executeButton.addEventListener('click', () => {
            if (this.isExecuting) {
                this.stopExecution();
            } else {
                const code = this.codeEditor.value;
                const language = this.languageSelector.value;
                this.executeCode(code, language);
            }
        });
        
        this.container.appendChild(executeButton);
        this.executeButton = executeButton;
    }
    
    /**
     * Creates the reset button
     */
    createResetButton() {
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Game';
        resetButton.style.backgroundColor = '#d83b01';
        resetButton.style.color = '#fff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '3px';
        resetButton.style.padding = '8px 16px';
        resetButton.style.cursor = 'pointer';
        
        resetButton.addEventListener('click', () => this.resetGame());
        
        this.container.appendChild(resetButton);
        this.resetButton = resetButton;
    }
    
    /**
     * Creates the connection status indicator
     */
    createConnectionStatus() {
        const connectionStatus = document.createElement('div');
        connectionStatus.style.marginTop = '10px';
        connectionStatus.style.marginBottom = '10px';
        connectionStatus.style.padding = '5px';
        connectionStatus.style.borderRadius = '3px';
        connectionStatus.style.backgroundColor = '#333';
        connectionStatus.style.textAlign = 'center';
        connectionStatus.textContent = 'Disconnected';
        connectionStatus.style.color = '#ff5555';
        
        this.container.appendChild(connectionStatus);
        this.connectionStatus = connectionStatus;
    }
    
    /**
     * Creates the help section for API documentation
     */
    createHelpSection() {
        const helpToggle = document.createElement('button');
        helpToggle.textContent = 'Show API Help';
        helpToggle.style.backgroundColor = '#107c10';
        helpToggle.style.color = '#fff';
        helpToggle.style.border = 'none';
        helpToggle.style.borderRadius = '3px';
        helpToggle.style.padding = '8px 16px';
        helpToggle.style.cursor = 'pointer';
        helpToggle.style.marginTop = '10px';
        helpToggle.style.width = '100%';
        
        const helpContent = document.createElement('div');
        helpContent.style.display = 'none';
        helpContent.style.marginTop = '10px';
        helpContent.style.padding = '10px';
        helpContent.style.backgroundColor = '#2d2d2d';
        helpContent.style.border = '1px solid #3d3d3d';
        helpContent.style.borderRadius = '3px';
        helpContent.innerHTML = 'Game API help will appear here...';
        
        helpToggle.addEventListener('click', () => {
            if (helpContent.style.display === 'none') {
                helpContent.style.display = 'block';
                helpToggle.textContent = 'Hide API Help';
            } else {
                helpContent.style.display = 'none';
                helpToggle.textContent = 'Show API Help';
            }
        });
        
        this.container.appendChild(helpToggle);
        this.container.appendChild(helpContent);
        this.helpContent = helpContent;
    }
    
    /**
     * Creates the debug container for debugging information
     */
    createDebugContainer() {
        const debugContainer = document.createElement('div');
        debugContainer.style.marginTop = '10px';
        debugContainer.style.backgroundColor = '#333';
        debugContainer.style.color = '#fff';
        debugContainer.style.padding = '5px';
        debugContainer.style.borderRadius = '3px';
        debugContainer.style.maxHeight = '100px';
        debugContainer.style.overflow = 'auto';
        debugContainer.style.display = 'none'; // Hide by default in production
        
        // Create debug status indicator
        const debugStatus = document.createElement('div');
        debugStatus.id = 'debug-status';
        debugStatus.style.padding = '5px';
        debugStatus.style.marginBottom = '5px';
        debugStatus.style.backgroundColor = '#224400';
        debugStatus.style.borderRadius = '3px';
        debugStatus.textContent = `isExecuting = ${this.isExecuting}`;
        
        debugContainer.appendChild(debugStatus);
        this.debugStatus = debugStatus;
        
        this.container.appendChild(debugContainer);
        this.debugContainer = debugContainer;
    }
    
    /**
     * Returns default code example for the selected language
     * @param {string} language - Programming language identifier
     * @returns {string} Default code example
     */
    getDefaultCode(language) {
        switch (language) {
            case 'javascript':
                return `// Example: Simple algorithm (R U R' U')
                async function simpleAlgorithm() {
                    console.log("Starting algorithm...");
                    await cube.R();      // Right face clockwise
                    await cube.U();      // Top face clockwise
                    await cube.RPrime(); // Right face counter-clockwise
                    await cube.UPrime(); // Top face counter-clockwise
                    console.log("Algorithm completed!");
                }

                // Run the algorithm
                simpleAlgorithm();`;
                                
                            case 'python':
                                return `# Example: Simple algorithm (R U R' U')
                def simple_algorithm():
                    print("Starting algorithm...")
                    cube.R()      # Right face clockwise
                    cube.U()      # Top face clockwise
                    cube.R_prime() # Right face counter-clockwise
                    cube.U_prime() # Top face counter-clockwise
                    print("Algorithm completed!")

                # Run the algorithm
                simple_algorithm()`;
                                
                            case 'java':
                                return `// Example: Simple algorithm (R U R' U')
                public class CubeAlgorithm {
                    public static void main(String[] args) {
                        System.out.println("Starting algorithm...");
                        cube.R();      // Right face clockwise
                        cube.U();      // Top face clockwise
                        cube.RPrime(); // Right face counter-clockwise
                        cube.UPrime(); // Top face counter-clockwise
                        System.out.println("Algorithm completed!");
                    }
                }`;
                                
                            case 'csharp':
                                return `// Example: Simple algorithm (R U R' U')
                using System;

                public class CubeAlgorithm {
                    public static void Main() {
                        Console.WriteLine("Starting algorithm...");
                        Cube.R();      // Right face clockwise
                        Cube.U();      // Top face clockwise
                        Cube.RPrime(); // Right face counter-clockwise
                        Cube.UPrime(); // Top face counter-clockwise
                        Console.WriteLine("Algorithm completed!");
                    }
                }`;
                
            default:
                return '// Please select a language and write your code here';
        }
    }
    
    /**
     * Executes the provided code in the selected language
     * @param {string} code - Code to execute
     * @param {string} language - Programming language
     */
    executeCode(code, language) {
        if (this.isExecuting) {
            return;
        }
        
        // Clear the output console
        this.outputConsole.innerHTML = '';
        
        // Update UI state
        this.isExecuting = true;
        this.updateButtonState();
        
        // Add debug info
        this.addDebugInfo(`Executing ${language} code...`);
        
        this.log(`Executing ${language} code...`);
        
        // Send code to the platform for execution after a small delay
        // (delay helps with UI responsiveness)
        setTimeout(() => {
            this.platform.executeCode(code, language);
        }, 50);
    }
    
    /**
     * Stops the currently executing code
     */
    stopExecution() {
        // Clear all timeouts
        this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.timeouts = [];
        
        // Reset execution state
        this.isExecuting = false;
        this.updateButtonState();
        this.updateDebugStatus();
        
        this.log('Code execution stopped', 'warning');
        
        // Notify platform
        this.platform.stopCodeExecution();
    }
    
    /**
     * Updates the state of the execute/stop button based on execution state
     */
    updateButtonState() {
        if (this.isExecuting) {
            this.executeButton.textContent = 'Stop Execution';
            this.executeButton.style.backgroundColor = '#d83b01';
            this.resetButton.disabled = true;
            this.resetButton.style.opacity = '0.5';
            this.resetButton.style.cursor = 'not-allowed';
        } else {
            this.executeButton.textContent = 'Execute Code';
            this.executeButton.style.backgroundColor = '#0078d7';
            this.resetButton.disabled = false;
            this.resetButton.style.opacity = '1';
            this.resetButton.style.cursor = 'pointer';
        }
    }
    
    /**
     * Resets the current game
     */
    resetGame() {
        // Stop any ongoing execution first
        if (this.isExecuting) {
            this.stopExecution();
        }
        
        // Reset the current game through the platform
        this.platform.resetCurrentGame();
        this.log('Game has been reset to its initial state.');
    }
    
    /**
     * Adds a message to the output console
     * @param {string} message - Message to log
     * @param {string} type - Message type (info, error, warning)
     */
    log(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        
        // Style based on message type
        switch (type) {
            case 'error':
                logEntry.style.color = '#f48771';
                break;
            case 'warning':
                logEntry.style.color = '#cca700';
                break;
            default:
                logEntry.style.color = '#9cdcfe';
        }
        
        this.outputConsole.appendChild(logEntry);
        
        // Auto-scroll to the bottom of the console
        this.outputConsole.scrollTop = this.outputConsole.scrollHeight;
    }
    
    /**
     * Updates the connection status indicator
     * @param {boolean} connected - Whether the connection is established
     */
    updateConnectionStatus(connected) {
        if (connected) {
            this.connectionStatus.textContent = 'Connected';
            this.connectionStatus.style.color = '#55ff55';
        } else {
            this.connectionStatus.textContent = 'Disconnected';
            this.connectionStatus.style.color = '#ff5555';
        }
    }
    
    /**
     * Updates the help content with game-specific information
     * @param {string} helpContent - HTML-formatted help content
     */
    updateHelpContent(helpContent) {
        if (this.helpContent) {
            this.helpContent.innerHTML = helpContent;
        }
    }
    
    /**
     * Called when code execution is complete
     */
    onExecutionComplete() {
        if (!this.isExecuting) {
            return;
        }
        
        this.addDebugInfo("onExecutionComplete called");
        
        // Update state
        this.isExecuting = false;
        this.updateButtonState();
        
        // Force a reflow to ensure UI updates
        void this.executeButton.offsetWidth;
        
        // Add a visual indicator that execution has completed
        this.executeButton.classList.add('execution-completed');
        setTimeout(() => {
            this.executeButton.classList.remove('execution-completed');
        }, 300);
        
        this.log('Code execution completed.');
    }

    /**
     * Adds debug information to the debug container
     * @param {string} message - Debug message
     */
    addDebugInfo(message) {
        if (!this.debugContainer) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const debugLine = document.createElement('div');
        debugLine.textContent = `[${timestamp}] ${message}`;
        debugLine.style.fontSize = '10px';
        debugLine.style.marginBottom = '2px';
        
        this.debugContainer.appendChild(debugLine);
        this.debugContainer.scrollTop = this.debugContainer.scrollHeight;
    }
    
    /**
     * Updates the debug status indicator
     */
    updateDebugStatus() {
        if (this.debugStatus) {
            this.debugStatus.textContent = `isExecuting = ${this.isExecuting}`;
            this.debugStatus.style.backgroundColor = this.isExecuting ? '#662200' : '#224400';
        }
    }
    
    /**
     * Forces the button state to update (for debugging)
     */
    forceUpdateButtonState() {
        this.updateButtonState();
    }
}

export default CodeInterface;