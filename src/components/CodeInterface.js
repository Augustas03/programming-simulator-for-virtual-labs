// CodeInterface.js
class CodeInterface {
    constructor(rubiksCube) {
        this.rubiksCube = rubiksCube;
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
        
        // Create orientation notice
        const orientationNotice = document.createElement('div');
        orientationNotice.style.backgroundColor = '#2d5986';
        orientationNotice.style.padding = '8px';
        orientationNotice.style.borderRadius = '3px';
        orientationNotice.style.marginBottom = '10px';
        orientationNotice.style.fontSize = '12px';
        orientationNotice.innerHTML = `<strong>Orientation Guide:</strong> In code, F=Front (Blue), B=Back (Green), R=Right (Orange), L=Left (Red), U=Up/Top (White), D=Down/Bottom (Yellow). <br>See the indicator in the bottom-left corner for reference.`;
        container.appendChild(orientationNotice);
        
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
        
        // Set default code example
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
        executeButton.addEventListener('click', () => this.executeCode());
        container.appendChild(executeButton);
        
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
        return `// Example: Perform a sequence of moves
function solveCross() {
    // This is just an example sequence
    cube.F();  // Rotate front face (Blue) clockwise
    cube.R();  // Rotate right face (Orange) clockwise
    cube.U();  // Rotate top face (White) clockwise
    cube.RPrime();  // Rotate right face counter-clockwise
    cube.UPrime();  // Rotate top face counter-clockwise
    cube.FPrime();  // Rotate front face counter-clockwise
    
    console.log("Cross solved!");
}

// Example: Create a simple algorithm
function simpleAlgorithm() {
    // R U R' U' (The "Sexy Move")
    cube.R();      // Right face clockwise
    cube.U();      // Top face clockwise
    cube.RPrime(); // Right face counter-clockwise
    cube.UPrime(); // Top face counter-clockwise
    
    console.log("Simple algorithm executed!");
}

// Example: Scramble the cube
function scrambleCube(moves = 20) {
    const possibleMoves = [
        'R', 'RPrime', 'L', 'LPrime', 
        'U', 'UPrime', 'D', 'DPrime', 
        'F', 'FPrime', 'B', 'BPrime'
    ];
    
    for (let i = 0; i < moves; i++) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        cube[randomMove]();
    }
    
    console.log("Cube scrambled with " + moves + " random moves");
}

// Example: Run your own code here
function myAlgorithm() {
    // Write your code here
    console.log("Starting my algorithm...");
    
    // Your solution code goes here
    
    console.log("Algorithm completed!");
}

// Call your functions here
scrambleCube(10);
// Uncomment to run your algorithm
// myAlgorithm();`;
    }
    
    getHelpContent() {
        return `
<h4>Rubik's Cube API Reference</h4>
<p><strong>Face Notation:</strong></p>
<ul>
    <li><strong>F</strong> = Front face (Blue)</li>
    <li><strong>B</strong> = Back face (Green)</li>
    <li><strong>R</strong> = Right face (Orange)</li>
    <li><strong>L</strong> = Left face (Red)</li>
    <li><strong>U</strong> = Up/Top face (White)</li>
    <li><strong>D</strong> = Down/Bottom face (Yellow)</li>
</ul>

<p><strong>Available methods:</strong></p>
<ul>
    <li><code>cube.R()</code> - Rotate right face (Orange) clockwise</li>
    <li><code>cube.RPrime()</code> - Rotate right face counter-clockwise</li>
    <li><code>cube.L()</code> - Rotate left face (Red) clockwise</li>
    <li><code>cube.LPrime()</code> - Rotate left face counter-clockwise</li>
    <li><code>cube.U()</code> - Rotate top face (White) clockwise</li>
    <li><code>cube.UPrime()</code> - Rotate top face counter-clockwise</li>
    <li><code>cube.D()</code> - Rotate bottom face (Yellow) clockwise</li>
    <li><code>cube.DPrime()</code> - Rotate bottom face counter-clockwise</li>
    <li><code>cube.F()</code> - Rotate front face (Blue) clockwise</li>
    <li><code>cube.FPrime()</code> - Rotate front face counter-clockwise</li>
    <li><code>cube.B()</code> - Rotate back face (Green) clockwise</li>
    <li><code>cube.BPrime()</code> - Rotate back face counter-clockwise</li>
</ul>

<p><strong>Other useful methods:</strong></p>
<ul>
    <li><code>cube.executeSequence(moveArray, callback)</code> - Execute a sequence of moves</li>
    <li><code>cube.getCubeState()</code> - Get the current state of the cube</li>
    <li><code>cube.checkIfSolved()</code> - Check if the cube is solved</li>
    <li><code>console.log(message)</code> - Output a message to the console below</li>
</ul>

<h4>Example Algorithms:</h4>

<p><strong>Sexy Move (R U R' U'):</strong></p>
<pre>
cube.R();
cube.U();
cube.RPrime();
cube.UPrime();
</pre>

<p><strong>Sune Algorithm (R U R' U R U2 R'):</strong></p>
<pre>
cube.R();
cube.U();
cube.RPrime();
cube.U();
cube.R();
cube.U();
cube.U();
cube.RPrime();
</pre>

<p><strong>Execute a Sequence:</strong></p>
<pre>
cube.executeSequence(['R', 'U', 'RPrime', 'UPrime'], function() {
    console.log("Sequence completed!");
});
</pre>

<p><strong>Important Note:</strong> The cube face notation is fixed, regardless of how you rotate the camera view. Use the orientation guide in the bottom-left corner for reference.</p>
`;
    }
    
    executeCode() {
        // Clear the output console
        this.outputConsole.innerHTML = '';
        
        // Get the code from the editor
        const code = this.codeEditor.value;
        
        // Create a sandbox with access to the cube
        const sandbox = {
            cube: this.rubiksCube,
            console: {
                log: (message) => {
                    this.log(message);
                },
                error: (message) => {
                    this.log('ERROR: ' + message, 'error');
                },
                warn: (message) => {
                    this.log('WARNING: ' + message, 'warning');
                }
            }
        };
        
        try {
            // Execute the code in the sandbox
            const executeInContext = new Function('cube', 'console', code);
            executeInContext(sandbox.cube, sandbox.console);
        } catch (error) {
            this.log('ERROR: ' + error.message, 'error');
        }
    }
    
    resetCube() {
        // Recreate the cube (using the RubiksCube's initCube method)
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