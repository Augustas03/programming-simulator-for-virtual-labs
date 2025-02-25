import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import RubiksCube from './components/RubiksCube';
import CodeInterface from './components/CodeInterface';
import FaceOrientationIndicator from './components/FaceOrientationIndicator';

document.body.style.backgroundColor = '#222222';
document.body.style.margin = '0';
document.body.style.overflowX = 'hidden'; // Prevent horizontal scrolling
document.body.style.color = '#d4d4d4'; // Light text for better contrast

// Create scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Set initial camera position to clearly show the front and top faces
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x222222); // Dark background
document.body.appendChild(renderer.domElement);

// Add ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Add one directional light for shadows and depth
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);

// Add axes helper to visualize coordinate system (optional, but useful for orientation)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Create the Rubik's Cube
const rubiksCube = new RubiksCube(scene);


// Create the code interface
const codeInterface = new CodeInterface(rubiksCube);

// Create the face orientation indicator
const orientationIndicator = new FaceOrientationIndicator();

// Set up orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 15;
controls.target.set(0, 0, 0);
controls.update();

// Add face labels to the scene
function addFaceLabels() {
    // Create face labels
    const createLabel = (text, position, color = 0xffffff) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        
        // Background with some transparency
        context.fillStyle = 'rgba(40, 40, 40, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Text
        context.font = 'bold 36px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite material
        const material = new THREE.SpriteMaterial({ map: texture });
        
        // Create sprite
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.scale.set(2, 1, 1);
        
        scene.add(sprite);
        
        return sprite;
    };
    
    // Position for each face label (positioned just outside the cube)
    createLabel('F', new THREE.Vector3(0, 0, 3.5));     // Front
    createLabel('B', new THREE.Vector3(0, 0, -3.5));    // Back
    createLabel('R', new THREE.Vector3(3.5, 0, 0));     // Right
    createLabel('L', new THREE.Vector3(-3.5, 0, 0));    // Left
    createLabel('U', new THREE.Vector3(0, 3.5, 0));     // Up (Top)
    createLabel('D', new THREE.Vector3(0, -3.5, 0));    // Down (Bottom)
}

// Add the face labels to help with orientation
addFaceLabels();

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);
    
    // Update cube rotations
    if (rubiksCube) {
        rubiksCube.update(time);
    }
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Optional: Add keyboard controls for easy testing/debugging
document.addEventListener('keydown', (event) => {
    // Allow keyboard shortcuts for testing
    switch(event.key) {
        case 'r': rubiksCube.R(); break;
        case 'R': rubiksCube.RPrime(); break;
        case 'l': rubiksCube.L(); break;
        case 'L': rubiksCube.LPrime(); break;
        case 'u': rubiksCube.U(); break;
        case 'U': rubiksCube.UPrime(); break;
        case 'd': rubiksCube.D(); break;
        case 'D': rubiksCube.DPrime(); break;
        case 'f': rubiksCube.F(); break;
        case 'F': rubiksCube.FPrime(); break;
        case 'b': rubiksCube.B(); break;
        case 'B': rubiksCube.BPrime(); break;
    }
});

// Start animation loop with timestamp
requestAnimationFrame(animate);