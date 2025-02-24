// RubiksCube.js
import * as THREE from 'three';

// Define standard colors for the cube
const CUBE_COLORS = {
    right: 0xFFA500,   // Orange (+x)
    left: 0xFF0000,    // Red (-x)
    top: 0xFFFFFF,     // White (+y)
    bottom: 0xFFFF00,  // Yellow (-y)
    front: 0x0000FF,   // Blue (+z)
    back: 0x00FF00     // Green (-z)
};

// Mapping of color values to color names (for educational purposes)
const COLOR_NAMES = {
    [0xFFA500]: 'orange',
    [0xFF0000]: 'red',
    [0xFFFFFF]: 'white',
    [0xFFFF00]: 'yellow',
    [0x0000FF]: 'blue',
    [0x00FF00]: 'green',
    [0xAAAAAA]: 'gray'  // Default color
};

class RubiksCube {
    constructor(scene) {
        this.scene = scene;
        this.isRotating = false;
        
        // Create cubelets array
        this.cubelets = [];
        
        // Create rotation group
        this.rotationGroup = new THREE.Group();
        this.scene.add(this.rotationGroup);
        
        // Duration of rotation animation in milliseconds
        this.rotationDuration = 500;
        
        // Store animation data
        this.animationData = {
            startTime: 0,
            endTime: 0,
            axis: new THREE.Vector3(),
            angle: 0,
            faceCubelets: [],
            onComplete: null
        };
        
        // Time out for student code execution (prevents infinite loops)
        this.executeTimeout = 60000; // 60 seconds
        
        // Initialize the cube
        this.initCube();
    }
    
    // Create the entire Rubik's Cube with properly colored cubelets
    initCube() {
        const size = 1;
        const gap = 0.02;
        
        // Clear existing cubelets if any
        this.cubelets.forEach(cubelet => {
            if (cubelet.parent) cubelet.parent.remove(cubelet);
        });
        this.cubelets = [];
        
        // Create all 27 cubelets
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
    
    // Create a single cubelet with proper colors
    createCubelet(size, x, y, z) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Create materials for each face (initially all gray)
        const materials = Array(6).fill().map(() => 
            new THREE.MeshPhongMaterial({ color: 0xAAAAAA }));
        
        // Set colors based on position
        if (x === 1) materials[0] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.right });  // Right face (+x)
        if (x === -1) materials[1] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.left });  // Left face (-x)
        if (y === 1) materials[2] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.top });    // Top face (+y)
        if (y === -1) materials[3] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.bottom }); // Bottom face (-y)
        if (z === 1) materials[4] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.front });  // Front face (+z)
        if (z === -1) materials[5] = new THREE.MeshPhongMaterial({ color: CUBE_COLORS.back });  // Back face (-z)
        
        const cubelet = new THREE.Mesh(geometry, materials);
        
        // Add edges for visibility
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        cubelet.add(edges);
        
        return cubelet;
    }
    
    // Helper to get cubelets on a specific face
    getCubeletsOnFace(face) {
        const epsilon = 0.1; // Small threshold for floating point comparison
        
        switch(face) {
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
    
    // Update animation for each frame
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
            
            // Check if the cube is solved for educational purposes
            const isSolved = this.checkIfSolved();
            if (isSolved) {
                console.log("Congratulations! The cube is solved!");
            }
            
            if (onComplete) {
                onComplete();
            }
        }
    }
    
    // Rotate face with animation
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
        let rotationAxis = new THREE.Vector3();
        switch(face) {
            case 'right': // x-axis
                rotationAxis.set(1, 0, 0);
                break;
            case 'left': // x-axis (reversed)
                rotationAxis.set(1, 0, 0);
                clockwise = !clockwise; // Reverse direction for left face
                break;
            case 'top': // y-axis
                rotationAxis.set(0, 1, 0);
                break;
            case 'bottom': // y-axis (reversed)
                rotationAxis.set(0, 1, 0);
                clockwise = !clockwise; // Reverse direction for bottom face
                break;
            case 'front': // z-axis
                rotationAxis.set(0, 0, 1);
                break;
            case 'back': // z-axis (reversed)
                rotationAxis.set(0, 0, 1);
                clockwise = !clockwise; // Reverse direction for back face
                break;
        }
        
        // Calculate rotation amount (90 degrees in radians)
        const rotationAmount = clockwise ? -Math.PI/2 : Math.PI/2;
        
        // Set up animation data
        this.animationData = {
            startTime: performance.now(),
            endTime: performance.now() + this.rotationDuration,
            axis: rotationAxis,
            angle: rotationAmount,
            faceCubelets: faceCubelets,
            onComplete: onComplete
        };
        
        return true;
    }
    
    // Educational features
    
    // Check if the cube is solved
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
    
    // Get the current state of the cube (useful for students to analyze)
    getCubeState() {
        const state = {
            right: [],
            left: [],
            top: [],
            bottom: [],
            front: [],
            back: []
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
    
    // Convenience methods for each face rotation
    rotateRightFace(clockwise = true, onComplete = null) {
        return this.rotateFace('right', clockwise, onComplete);
    }
    
    rotateLeftFace(clockwise = true, onComplete = null) {
        return this.rotateFace('left', clockwise, onComplete);
    }
    
    rotateTopFace(clockwise = true, onComplete = null) {
        return this.rotateFace('top', clockwise, onComplete);
    }
    
    rotateBottomFace(clockwise = true, onComplete = null) {
        return this.rotateFace('bottom', clockwise, onComplete);
    }
    
    rotateFrontFace(clockwise = true, onComplete = null) {
        return this.rotateFace('front', clockwise, onComplete);
    }
    
    rotateBackFace(clockwise = true, onComplete = null) {
        return this.rotateFace('back', clockwise, onComplete);
    }
    
    // Shorthand notations as used in Rubik's Cube algorithms
    // R, L, U, D, F, B (clockwise)
    // R', L', U', D', F', B' (counter-clockwise)
    R(onComplete = null) {
        return this.rotateRightFace(true, onComplete);
    }
    
    RPrime(onComplete = null) {
        return this.rotateRightFace(false, onComplete);
    }
    
    L(onComplete = null) {
        return this.rotateLeftFace(true, onComplete);
    }
    
    LPrime(onComplete = null) {
        return this.rotateLeftFace(false, onComplete);
    }
    
    U(onComplete = null) {
        return this.rotateTopFace(true, onComplete);
    }
    
    UPrime(onComplete = null) {
        return this.rotateTopFace(false, onComplete);
    }
    
    D(onComplete = null) {
        return this.rotateBottomFace(true, onComplete);
    }
    
    DPrime(onComplete = null) {
        return this.rotateBottomFace(false, onComplete);
    }
    
    F(onComplete = null) {
        return this.rotateFrontFace(true, onComplete);
    }
    
    FPrime(onComplete = null) {
        return this.rotateFrontFace(false, onComplete);
    }
    
    B(onComplete = null) {
        return this.rotateBackFace(true, onComplete);
    }
    
    BPrime(onComplete = null) {
        return this.rotateBackFace(false, onComplete);
    }
    
    // Execute a sequence of moves with proper animations
    executeSequence(moves, onComplete = null) {
        if (!Array.isArray(moves) || moves.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        
        const move = moves[0];
        const remainingMoves = moves.slice(1);
        
        // Add safety to prevent stack overflow
        const startTime = Date.now();
        
        const executeNext = () => {
            // Check for timeout to prevent infinite loops
            if (Date.now() - startTime > this.executeTimeout) {
                console.error('Execution timeout - too many moves or infinite loop detected');
                if (onComplete) onComplete();
                return;
            }
            
            this.executeSequence(remainingMoves, onComplete);
        };
        
        // Execute current move and then continue with remaining moves
        if (typeof this[move] === 'function') {
            this[move](executeNext);
        } else {
            console.error(`Invalid move: ${move}`);
            executeNext();
        }
    }
    
    // Educational methods
    
    // Get help information about available moves
    getAvailableMoves() {
        return {
            "Basic Moves": {
                "R": "Rotate right face clockwise",
                "RPrime": "Rotate right face counter-clockwise",
                "L": "Rotate left face clockwise",
                "LPrime": "Rotate left face counter-clockwise",
                "U": "Rotate top face clockwise",
                "UPrime": "Rotate top face counter-clockwise",
                "D": "Rotate bottom face clockwise",
                "DPrime": "Rotate bottom face counter-clockwise",
                "F": "Rotate front face clockwise",
                "FPrime": "Rotate front face counter-clockwise",
                "B": "Rotate back face clockwise",
                "BPrime": "Rotate back face counter-clockwise"
            },
            "Other Methods": {
                "executeSequence": "Execute a sequence of moves, e.g. executeSequence(['R', 'U', 'RPrime', 'UPrime'])",
                "getCubeState": "Get the current state of all faces",
                "checkIfSolved": "Check if the cube is solved"
            }
        };
    }
    
    // Check if a specific pattern/algorithm has been achieved
    checkPattern(pattern) {
        // This is a placeholder - in a real implementation, you'd check if
        // the current cube state matches a predefined pattern
        // For example, check if the cube has a checkerboard pattern
        
        return false; // Not implemented yet
    }
    
    // Set animation speed (for educational purposes)
    setAnimationSpeed(speed) {
        // speed: 0.5 (slower) to 2.0 (faster)
        if (speed < 0.1) speed = 0.1; // Don't allow too slow
        if (speed > 5) speed = 5; // Don't allow too fast
        
        this.rotationDuration = 500 / speed;
    }
    
    // For debugging and educational purposes: print the current state to console
    printCubeState() {
        const state = this.getCubeState();
        
        console.log("Current Cube State:");
        Object.keys(state).forEach(face => {
            console.log(`${face} face:`, state[face]);
        });
        
        const isSolved = this.checkIfSolved();
        console.log(`Cube is ${isSolved ? 'SOLVED' : 'NOT SOLVED'}`);
    }
}

export default RubiksCube;