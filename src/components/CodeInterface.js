// CodeInterface.js
class CodeInterface {
    constructor(rubiksCube) {
        this.rubiksCube = rubiksCube;
        this.isExecuting = false;
        this.timeouts = [];
        this.createInterface();
    }
    
    createInterface() {
        // Create a container for the code editor and execution button
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
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Rubik\'s Cube Code Interface';
        title.style.margin = '0 0 10px 0';
        container.appendChild(title);
        
        // Create code editor textarea
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
        codeEditor.value = this.getDefaultCode();
        container.appendChild(codeEditor);
        this.codeEditor = codeEditor;
        
        // Create execute button
        const executeButton = document.createElement('button');
        executeButton.textContent = 'Execute Code';
        executeButton.style.backgroundColor = '#0078d7';
        executeButton.style.color = '#fff';
        executeButton.style.border = 'none';
        executeButton.style.borderRadius = '3px';
        executeButton.style.padding = '8px 16px';
        executeButton.style.cursor = 'pointer';
        executeButton.style.marginRight = '10px';
        executeButton.addEventListener('click', () => {
            if (this.isExecuting) {
                this.stopExecution();
            } else {
                this.executeCode();
            }
        });
        container.appendChild(executeButton);
        this.executeButton = executeButton;
        
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Cube';
        resetButton.style.backgroundColor = '#d83b01';
        resetButton.style.color = '#fff';
        resetButton.style.border = 'none';
        resetButton.style.borderRadius = '3px';
        resetButton.style.padding = '8px 16px';
        resetButton.style.cursor = 'pointer';
        resetButton.addEventListener('click', () => this.resetCube());
        container.appendChild(resetButton);
        this.resetButton = resetButton;
        
        // Create output console
        const output = document.createElement('div');
        output.style.width = '100%';
        output.style.height = '150px';
        output.style.backgroundColor = '#2d2d2d';
        output.style.color = '#d4d4d4';
        output.style.border = '1px solid #3d3d3d';
        output.style.borderRadius = '3px';
        output.style.padding = '8px';
        output.style.fontFamily = 'monospace';
        output.style.fontSize = '14px';
        output.style.marginTop = '10px';
        output.style.overflow = 'auto';
        output.style.whiteSpace = 'pre-wrap';
        container.appendChild(output);
        this.outputConsole = output;
        
        // Help section
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
        helpContent.innerHTML = this.getHelpContent();
        
        helpToggle.addEventListener('click', () => {
            if (helpContent.style.display === 'none') {
                helpContent.style.display = 'block';
                helpToggle.textContent = 'Hide API Help';
            } else {
                helpContent.style.display = 'none';
                helpToggle.textContent = 'Show API Help';
            }
        });
        
        container.appendChild(helpToggle);
        container.appendChild(helpContent);
    }
    
    getDefaultCode() {
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
    }
    
    getHelpContent() {
        return `
<div style="color: #d4d4d4; background-color: #2d2d2d;">
  <h4 style="color: #d4d4d4; margin-top: 0;">Rubik's Cube API Reference</h4>
  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Face Notation:</strong></p>
  <ul style="color: #d4d4d4;">
      <li><strong style="color: #d4d4d4;">F</strong> = Front face (Blue)</li>
      <li><strong style="color: #d4d4d4;">B</strong> = Back face (Green)</li>
      <li><strong style="color: #d4d4d4;">R</strong> = Right face (Orange)</li>
      <li><strong style="color: #d4d4d4;">L</strong> = Left face (Red)</li>
      <li><strong style="color: #d4d4d4;">U</strong> = Up/Top face (White)</li>
      <li><strong style="color: #d4d4d4;">D</strong> = Down/Bottom face (Yellow)</li>
  </ul>

  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Important: All cube functions must be used with await inside an async function!</strong></p>

  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Available methods:</strong></p>
  <ul style="color: #d4d4d4;">
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.R()</code> - Rotate right face (Orange) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.RPrime()</code> - Rotate right face counter-clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.L()</code> - Rotate left face (Red) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.LPrime()</code> - Rotate left face counter-clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.U()</code> - Rotate top face (White) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.UPrime()</code> - Rotate top face counter-clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.D()</code> - Rotate bottom face (Yellow) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.DPrime()</code> - Rotate bottom face counter-clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.F()</code> - Rotate front face (Blue) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.FPrime()</code> - Rotate front face counter-clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.B()</code> - Rotate back face (Green) clockwise</li>
      <li><code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await cube.BPrime()</code> - Rotate back face counter-clockwise</li>
  </ul>

  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Example Algorithm:</strong></p>
  <pre style="background-color: #1e1e1e; padding: 10px; border-radius: 3px; color: #d4d4d4; margin: 0;">
async function example() {
    // The "Sexy Move" (R U R' U')
    await cube.R();      // Right clockwise
    await cube.U();      // Up clockwise
    await cube.RPrime(); // Right counter-clockwise
    await cube.UPrime(); // Up counter-clockwise
    
    console.log("Algorithm complete!");
}

// Don't forget to call your function!
example();</pre>

  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Tips:</strong></p>
  <ul style="color: #d4d4d4;">
      <li>Always use <code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">await</code> before cube movements</li>
      <li>Define your functions as <code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">async</code></li>
      <li>Use <code style="background-color: #1e1e1e; padding: 2px 4px; border-radius: 3px;">console.log()</code> to debug your algorithm</li>
      <li>Check the orientation guide for face colors</li>
  </ul>

  <p style="color: #d4d4d4;"><strong style="color: #d4d4d4;">Important Note:</strong> The cube face notation is fixed, regardless of how you rotate the camera view. Use the orientation guide in the bottom-left corner for reference.</p>
</div>`;
    }
    
    executeCode() {
        if (this.isExecuting) return;
        
        // Clear the output console
        this.outputConsole.innerHTML = '';
        
        // Update UI state
        this.isExecuting = true;
        this.executeButton.textContent = 'Stop Execution';
        this.executeButton.style.backgroundColor = '#d83b01';
        this.resetButton.disabled = true;
        this.resetButton.style.opacity = '0.5';
        this.resetButton.style.cursor = 'not-allowed';
        
        // Get the code from the editor
        const code = this.codeEditor.value;
        
        // Store a reference to 'this' for the closure
        const self = this;
        
        try {
            // Create sandbox environment with completion tracking
            const sandbox = {
                cube: {
                    R: () => {
                        if (!self.isExecuting) return Promise.resolve(); // Stop if execution is cancelled
                        return new Promise((resolve) => {
                            self.rubiksCube.R(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    RPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.RPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    L: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.L(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    LPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.LPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    U: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.U(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    UPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.UPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    D: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.D(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    DPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.DPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    F: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.F(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    FPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.FPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    B: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.B(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    BPrime: () => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.BPrime(() => {
                                if (self.isExecuting) resolve();
                                self.checkForCompletion();
                            });
                        });
                    },
                    executeSequence: (moves, callback) => {
                        if (!self.isExecuting) return Promise.resolve();
                        return new Promise((resolve) => {
                            self.rubiksCube.executeSequence(moves, () => {
                                if (self.isExecuting) {
                                    if (callback) callback();
                                    resolve();
                                }
                                self.checkForCompletion();
                            });
                        });
                    }
                },
                console: {
                    log: (message) => {
                        if (!self.isExecuting) return;
                        self.log(message);
                        self.checkForCompletion();
                    },
                    error: (message) => {
                        if (!self.isExecuting) return;
                        self.log('ERROR: ' + message, 'error');
                        self.checkForCompletion();
                    },
                    warn: (message) => {
                        if (!self.isExecuting) return;
                        self.log('WARNING: ' + message, 'warning');
                        self.checkForCompletion();
                    }
                },
                // Add check completion function to sandbox
                checkCompletion: () => self.checkForCompletion()
            };

            // Wrap the code in an async IIFE without 'this' reference
            const wrappedCode = `
                (async () => {
                    try {
                        ${code}
                        // Add a final completion check after all code has run
                        setTimeout(checkCompletion, 500);
                    } catch (error) {
                        console.error(error);
                        checkCompletion();
                    }
                })();
            `;

            // Execute the code
            const executeInContext = new Function('cube', 'console', 'checkCompletion', wrappedCode);
            executeInContext(sandbox.cube, sandbox.console, sandbox.checkCompletion);
            
            this.log('Code execution started...');
        } catch (error) {
            this.log('ERROR: ' + error.message, 'error');
            this.stopExecution();
        }
    }
    
    checkForCompletion() {
        if (!this.isExecuting) return;
        
        // If the cube is not rotating anymore, we can reset the UI
        if (!this.rubiksCube.isRotating) {
            // Add a small delay to make sure all animations are complete
            setTimeout(() => {
                if (!this.rubiksCube.isRotating) {
                    this.finishExecution();
                }
            }, 100);
        }
    }

    finishExecution() {
        if (!this.isExecuting) return;
        
        this.isExecuting = false;
        this.executeButton.textContent = 'Execute Code';
        this.executeButton.style.backgroundColor = '#0078d7';
        this.resetButton.disabled = false;
        this.resetButton.style.opacity = '1';
        this.resetButton.style.cursor = 'pointer';
        this.log('Code execution completed.');
    }
    
    stopExecution() {
        // Clear all timeouts
        if (this.timeouts) {
            this.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
            this.timeouts = [];
        }
        
        // Reset execution state
        this.isExecuting = false;
        
        // Update UI
        this.executeButton.textContent = 'Execute Code';
        this.executeButton.style.backgroundColor = '#0078d7';
        this.resetButton.disabled = false;
        this.resetButton.style.opacity = '1';
        this.resetButton.style.cursor = 'pointer';
        
        // Cancel any ongoing rotation
        if (this.rubiksCube.isRotating) {
            // Set a flag to indicate rotation should stop
            this.rubiksCube.stopRotation = true;
        }
        
        this.log('Code execution stopped', 'warning');
    }
    
    resetCube() {
        // Stop any ongoing execution first
        if (this.isExecuting) {
            this.stopExecution();
        }
        
        // Recreate the cube
        this.rubiksCube.initCube();
        this.log('Cube has been reset to its initial solved state.');
    }
    
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
}

export default CodeInterface;