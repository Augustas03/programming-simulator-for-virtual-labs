import * as THREE from 'three';
import Game from '../Game.js';
import checkCubelet from './CubeletChecker.js';

/**
 * Standard colors for the Rubik's Cube faces
 */
const CUBE_COLORS = Object.freeze({
    RIGHT: 0xFFA500,   // Orange (+x)
    LEFT: 0xFF0000,    // Red (-x)
    TOP: 0xFFFFFF,     // White (+y)
    BOTTOM: 0xFFFF00,  // Yellow (-y)
    FRONT: 0x0000FF,   // Blue (+z)
    BACK: 0x00FF00     // Green (-z)
});

/**
 * Mapping of color hex values to readable names
 */
const COLOR_NAMES = Object.freeze({
    [CUBE_COLORS.RIGHT]: 'orange',
    [CUBE_COLORS.LEFT]: 'red',
    [CUBE_COLORS.TOP]: 'white',
    [CUBE_COLORS.BOTTOM]: 'yellow',
    [CUBE_COLORS.FRONT]: 'blue',
    [CUBE_COLORS.BACK]: 'green',
    [0xAAAAAA]: 'gray'  // Default color
});

/**
 * Implementation of a Rubik's Cube game with rotation animation
 */
class RubiksCubeGame extends Game {
    /**
     * Creates a new Rubik's Cube game instance
     */
    constructor() {
        super();
        this.cubelets = [];
        this.isRotating = false;
        this.rotationGroup = new THREE.Group();
        this.rotationDuration = 500; // milliseconds
        this.animationData = {
            startTime: 0,
            endTime: 0,
            axis: new THREE.Vector3(),
            angle: 0,
            faceCubelets: [],
            onComplete: null
        };
    }
    
    /**
     * Returns the unique identifier for this game
     * @returns {string} Game identifier
     */
    getGameId() {
        return 'rubiks_cube';
    }

    /**
     * Initializes the game with the given THREE.js scene
     * @param {THREE.Scene} scene
     */
    initialize(scene) {
        super.initialize(scene);
        scene.add(this.rotationGroup);
        this.initCube();
    }
    
    /**
     * Creates the entire Rubik's Cube with properly colored cubelets
     */
    initCube() {
        const size = 1;
        const gap = 0.02;
        
        // Clear existing cubelets if any
        this.cubelets.forEach(cubelet => {
            if (cubelet.parent) cubelet.parent.remove(cubelet);
        });
        this.cubelets = [];
        
        // Create all 27 cubelets (3x3x3)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cubelet = this.createCubelet(size, x, y, z);
                    cubelet.position.set(
                        x * (size + gap),
                        y * (size + gap),
                        z * (size + gap)
                    );
                    
                    // Store the cubelet's logical position
                    cubelet.userData.cubePos = { x, y, z };
                    
                    this.cubelets.push(cubelet);
                    this.scene.add(cubelet);
                }
            }
        }
    }
    
    /**
     * Creates a single cubelet with proper colors based on position
     * @param {number} size - Size of the cubelet
     * @param {number} x - X coordinate (-1, 0, 1)
     * @param {number} y - Y coordinate (-1, 0, 1)
     * @param {number} z - Z coordinate (-1, 0, 1)
     * @returns {THREE.Mesh} The created cubelet
     */
    createCubelet(size, x, y, z) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const materials = checkCubelet(x, y, z);
        
        const cubelet = new THREE.Mesh(geometry, materials);
        
        // Add edges for visibility
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        cubelet.add(edges);
        
        return cubelet;
    }
    
    /**
     * Gets cubelets on a specific face of the cube
     * @param {string} face - Face name ('right', 'left', 'top', 'bottom', 'front', 'back')
     * @returns {THREE.Mesh[]} Array of cubelets on the specified face
     */
    getCubeletsOnFace(face) {
        const epsilon = 0.1; // Small threshold for floating point comparison
        
        switch(face.toLowerCase()) {
            case 'right': // +x face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.x - 1.02) < epsilon);
            case 'left': // -x face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.x + 1.02) < epsilon);
            case 'top': // +y face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.y - 1.02) < epsilon);
            case 'bottom': // -y face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.y + 1.02) < epsilon);
            case 'front': // +z face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.z - 1.02) < epsilon);
            case 'back': // -z face
                return this.cubelets.filter(cubelet => 
                    Math.abs(cubelet.position.z + 1.02) < epsilon);
            default:
                console.error('Invalid face:', face);
                return [];
        }
    }
    
    /**
     * Updates animation for each frame
     * @param {number} time - Current timestamp from requestAnimationFrame
     */
    update(time) {
        if (!this.isRotating) return;
        
        const { startTime, endTime, axis, angle, faceCubelets, onComplete } = this.animationData;
        
        // Calculate progress (0 to 1)
        const progress = Math.min((time - startTime) / (endTime - startTime), 1);
        
        // Apply rotation based on progress
        const currentAngle = progress * angle;
        this.rotationGroup.setRotationFromAxisAngle(axis, currentAngle);
        
        // Check if animation is complete
        if (progress >= 1) {
            this.finishRotation(onComplete);
        }
    }
    
    /**
     * Finishes the rotation animation and updates cubelet positions
     * @param {Function} onComplete - Callback to execute when rotation is complete
     */
    finishRotation(onComplete) {
        // Move cubelets back to scene
        while (this.rotationGroup.children.length > 0) {
            const cubelet = this.rotationGroup.children[0];
            
            // Get world position and rotation
            const worldPos = new THREE.Vector3();
            cubelet.getWorldPosition(worldPos);
            
            const worldQuat = new THREE.Quaternion();
            cubelet.getWorldQuaternion(worldQuat);
            
            // Round position values to handle floating point imprecision
            worldPos.x = Math.round(worldPos.x * 100) / 100;
            worldPos.y = Math.round(worldPos.y * 100) / 100;
            worldPos.z = Math.round(worldPos.z * 100) / 100;
            
            // Update cubelet's logical position
            cubelet.userData.cubePos = {
                x: Math.round(worldPos.x / 1.02),
                y: Math.round(worldPos.y / 1.02), 
                z: Math.round(worldPos.z / 1.02)
            };
            
            // Remove from rotation group and add back to scene
            this.rotationGroup.remove(cubelet);
            this.scene.add(cubelet);
            
            // Set position and rotation in scene
            cubelet.position.copy(worldPos);
            cubelet.quaternion.copy(worldQuat);
        }
        
        this.isRotating = false;
        
        // Check if the cube is solved
        const isSolved = this.checkIfSolved();
        if (isSolved) {
            console.log("Congratulations! The cube is solved!");
        }
        
        if (onComplete) {
            onComplete();
        }
    }
    
    /**
     * Processes commands from the code execution interface
     * @param {Object} command - Command object with action and parameters
     * @returns {boolean} Whether the command was successfully handled
     */
    processCommand(command) {
        if (!command || !command.action) {
            console.error('Invalid command:', command);
            return false;
        }
        
        if (command.action === 'rotate') {
            // Map standard notation to internal face names
            const faceMap = {
                'R': 'right',
                'L': 'left',
                'U': 'top',
                'D': 'bottom',
                'F': 'front',
                'B': 'back'
            };
            
            // Get face name (use provided face or map from notation)
            const face = faceMap[command.face] || command.face;
            const clockwise = command.direction === 'clockwise';
            
            // Start the rotation
            return this.rotateFace(face, clockwise);
        }
        
        return false;
    }
    
    /**
     * Rotates a face of the cube with animation
     * @param {string} face - Face to rotate ('right', 'left', 'top', 'bottom', 'front', 'back')
     * @param {boolean} clockwise - Whether to rotate clockwise (true) or counter-clockwise (false)
     * @param {Function} onComplete - Callback to execute when rotation is complete
     * @returns {boolean} Whether the rotation was successfully started
     */
    rotateFace(face, clockwise = true, onComplete = null) {
        if (this.isRotating) {
            console.log('Already rotating, please wait');
            return false;
        }
        
        this.isRotating = true;
        
        // Get cubelets on the specified face
        const faceCubelets = this.getCubeletsOnFace(face);
        
        if (faceCubelets.length === 0) {
            console.error('No cubelets found on face:', face);
            this.isRotating = false;
            return false;
        }
        
        // Clear the rotation group
        while (this.rotationGroup.children.length > 0) {
            this.rotationGroup.remove(this.rotationGroup.children[0]);
        }
        
        // Add cubelets to rotation group
        faceCubelets.forEach(cubelet => {
            // Get world position and rotation
            const worldPos = new THREE.Vector3();
            cubelet.getWorldPosition(worldPos);
            
            const worldQuat = new THREE.Quaternion();
            cubelet.getWorldQuaternion(worldQuat);
            
            // Remove from scene and add to rotation group
            this.scene.remove(cubelet);
            this.rotationGroup.add(cubelet);
            
            // Maintain world position and rotation
            cubelet.position.copy(worldPos);
            cubelet.quaternion.copy(worldQuat);
        });
        
        // Set up the axis for rotation
        const rotationAxis = this.getRotationAxis(face, clockwise);
        
        // Set up animation data
        this.animationData = {
            startTime: performance.now(),
            endTime: performance.now() + this.rotationDuration,
            axis: rotationAxis.axis,
            angle: rotationAxis.angle,
            faceCubelets: faceCubelets,
            onComplete: onComplete
        };
        
        return true;
    }
    
    /**
     * Gets the rotation axis and angle for a face rotation
     * @param {string} face - Face to rotate
     * @param {boolean} clockwise - Whether to rotate clockwise
     * @returns {Object} Object with axis (Vector3) and angle (number)
     */
    getRotationAxis(face, clockwise) {
        let axis = new THREE.Vector3();
        let adjustedClockwise = clockwise;
        
        switch(face.toLowerCase()) {
            case 'right': // x-axis
                axis.set(1, 0, 0);
                break;
            case 'left': // x-axis (reversed)
                axis.set(1, 0, 0);
                adjustedClockwise = !clockwise; // Reverse direction for left face
                break;
            case 'top': // y-axis
                axis.set(0, 1, 0);
                break;
            case 'bottom': // y-axis (reversed)
                axis.set(0, 1, 0);
                adjustedClockwise = !clockwise; // Reverse direction for bottom face
                break;
            case 'front': // z-axis
                axis.set(0, 0, 1);
                break;
            case 'back': // z-axis (reversed)
                axis.set(0, 0, 1);
                adjustedClockwise = !clockwise; // Reverse direction for back face
                break;
        }
        
        // Calculate rotation amount (90 degrees in radians)
        const angle = adjustedClockwise ? -Math.PI/2 : Math.PI/2;
        
        return { axis, angle };
    }
    
    /**
     * Checks if the cube is solved (all faces have uniform colors)
     * @returns {boolean} Whether the cube is solved
     */
    checkIfSolved() {
        // For each face, check if all exposed faces have the same color
        const faces = ['right', 'left', 'top', 'bottom', 'front', 'back'];
        
        for (const face of faces) {
            const faceCubelets = this.getCubeletsOnFace(face);
            
            // Get the material index for the current face
            let materialIndex;
            switch(face) {
                case 'right': materialIndex = 0; break;
                case 'left': materialIndex = 1; break;
                case 'top': materialIndex = 2; break;
                case 'bottom': materialIndex = 3; break;
                case 'front': materialIndex = 4; break;
                case 'back': materialIndex = 5; break;
            }
            
            // Get color of first cubelet's face
            const firstColor = faceCubelets[0].material[materialIndex].color.getHex();
            
            // Check if all other cubelets have the same color on this face
            const allSameColor = faceCubelets.every(cubelet => 
                cubelet.material[materialIndex].color.getHex() === firstColor);
            
            if (!allSameColor) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Gets the current state of the cube for analysis 
     * @returns {Object} Object with state of each face
     */
    getCubeState(){
        const state = {
            front: [],
            back: [],
            right: [],
            left: [],
            top: [],
            bottom: []
        };
        
        // Get state for each face
        Object.keys(state).forEach(face => {
            const faceCubelets = this.getCubeletsOnFace(face);
            let materialIndex;
            
            switch(face) {
                case 'right': materialIndex = 0; break;
                case 'left': materialIndex = 1; break;
                case 'top': materialIndex = 2; break;
                case 'bottom': materialIndex = 3; break;
                case 'front': materialIndex = 4; break;
                case 'back': materialIndex = 5; break;
            }
            
            // Get color of each cubelet on this face
            faceCubelets.forEach(cubelet => {
                const color = cubelet.material[materialIndex].color.getHex();
                const colorName = COLOR_NAMES[color] || 'unknown';
                state[face].push(colorName);
            });
        });
        
        return state;
    }
    
    // Convenience methods for face rotations
    
    /**
     * Rotates right face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateRightFace(clockwise = true, onComplete = null) {
        return this.rotateFace('right', clockwise, onComplete);
    }
    
    /**
     * Rotates left face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateLeftFace(clockwise = true, onComplete = null) {
        return this.rotateFace('left', clockwise, onComplete);
    }
    
    /**
     * Rotates top face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateTopFace(clockwise = true, onComplete = null) {
        return this.rotateFace('top', clockwise, onComplete);
    }
    
    /**
     * Rotates bottom face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateBottomFace(clockwise = true, onComplete = null) {
        return this.rotateFace('bottom', clockwise, onComplete);
    }
    
    /**
     * Rotates front face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateFrontFace(clockwise = true, onComplete = null) {
        return this.rotateFace('front', clockwise, onComplete);
    }
    
    /**
     * Rotates back face (wrapper method)
     * @param {boolean} clockwise - Direction of rotation
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    rotateBackFace(clockwise = true, onComplete = null) {
        return this.rotateFace('back', clockwise, onComplete);
    }
    
    // Standard Rubik's Cube notation methods
    
    /**
     * R move - Right face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    R(onComplete = null) {
        return this.rotateRightFace(true, onComplete);
    }
    
    /**
     * R' move - Right face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    RPrime(onComplete = null) {
        return this.rotateRightFace(false, onComplete);
    }
    
    /**
     * L move - Left face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    L(onComplete = null) {
        return this.rotateLeftFace(true, onComplete);
    }
    
    /**
     * L' move - Left face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    LPrime(onComplete = null) {
        return this.rotateLeftFace(false, onComplete);
    }
    
    /**
     * U move - Upper face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    U(onComplete = null) {
        return this.rotateTopFace(true, onComplete);
    }
    
    /**
     * U' move - Upper face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    UPrime(onComplete = null) {
        return this.rotateTopFace(false, onComplete);
    }
    
    /**
     * D move - Down face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    D(onComplete = null) {
        return this.rotateBottomFace(true, onComplete);
    }
    
    /**
     * D' move - Down face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    DPrime(onComplete = null) {
        return this.rotateBottomFace(false, onComplete);
    }
    
    /**
     * F move - Front face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    F(onComplete = null) {
        return this.rotateFrontFace(true, onComplete);
    }
    
    /**
     * F' move - Front face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    FPrime(onComplete = null) {
        return this.rotateFrontFace(false, onComplete);
    }
    
    /**
     * B move - Back face clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    B(onComplete = null) {
        return this.rotateBackFace(true, onComplete);
    }
    
    /**
     * B' move - Back face counter-clockwise
     * @param {Function} onComplete - Callback when complete
     * @returns {boolean} Whether rotation started successfully
     */
    BPrime(onComplete = null) {
        return this.rotateBackFace(false, onComplete);
    }
    
    /**
     * Gets help information about available moves
     * @returns {string} HTML-formatted help content
     */
    getHelpContent() {
        return `
        <h3>Rubik's Cube Controls</h3>
        <p>Use the following commands to manipulate the cube:</p>
        
        <h4>Basic Moves</h4>
        <ul>
            <li><code>cube.R()</code> - Rotate Right face clockwise</li>
            <li><code>cube.RPrime()</code> - Rotate Right face counter-clockwise</li>
            <li><code>cube.L()</code> - Rotate Left face clockwise</li>
            <li><code>cube.LPrime()</code> - Rotate Left face counter-clockwise</li>
            <li><code>cube.U()</code> - Rotate Upper face clockwise</li>
            <li><code>cube.UPrime()</code> - Rotate Upper face counter-clockwise</li>
            <li><code>cube.D()</code> - Rotate Down face clockwise</li>
            <li><code>cube.DPrime()</code> - Rotate Down face counter-clockwise</li>
            <li><code>cube.F()</code> - Rotate Front face clockwise</li>
            <li><code>cube.FPrime()</code> - Rotate Front face counter-clockwise</li>
            <li><code>cube.B()</code> - Rotate Back face clockwise</li>
            <li><code>cube.BPrime()</code> - Rotate Back face counter-clockwise</li>
        </ul>
        
        <h4>Advanced Usage</h4>
        <p>These functions return promises, so you can use <code>await</code> to wait for a move to complete:</p>
        <pre>
async function solveCross() {
    await cube.F();
    await cube.R();
    await cube.UPrime();
}
        </pre>`;
    }
    
    /**
     * Returns the state for serialization
     * @returns {Object} State object with type, gameId and state properties
     */
    getState() {
        return {
            type: 'game_state',
            gameId: this.getGameId(),
            state: this.getCubeState()
        };
    }


    
    /**
     * Resets the game to its initial state
     * Alias for initCube for API consistency
     */
    reset() {
        this.initCube();
    }
}

export default RubiksCubeGame;
