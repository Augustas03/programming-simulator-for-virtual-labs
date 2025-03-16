import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GamesPlatform from './platform/GamesPlatform.js';
import RubiksCubeGame from './games/RubiksCube/RubiksCubeGame.js';
import FaceOrientationIndicator from './ui/FaceOrientationIndicator.js';

/**
 * Main application entry point for the Rubik's Cube simulator
 */
(function() {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,                                      // FOV
    window.innerWidth / window.innerHeight,  // Aspect ratio
    0.1,                                     // Near clipping plane
    1000                                     // Far clipping plane
  );
  camera.position.set(5, 5, 7);
  camera.lookAt(0, 0, 0);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting setup
  setupLighting(scene);

  // Controls setup
  const controls = setupControls(camera, renderer);

  // Games platform setup
  const gamesPlatform = setupGamesPlatform(scene);
  
  // Initialize face orientation indicator
  const faceIndicator = new FaceOrientationIndicator();

  // Setup window resize handler
  setupResizeHandler(camera, renderer);

  // Connect to WebSocket server for remote code execution
  const wsServerUrl = 'ws://localhost:8080';
  gamesPlatform.connectToServer(wsServerUrl);

  // Setup keyboard controls
  setupKeyboardControls(gamesPlatform);

  // Start animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  /**
   * Sets up the scene lighting
   * @param {THREE.Scene} scene - The THREE.js scene
   */
  function setupLighting(scene) {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
  }

  /**
   * Sets up camera controls
   * @param {THREE.Camera} camera - The THREE.js camera
   * @param {THREE.WebGLRenderer} renderer - The THREE.js renderer
   * @returns {OrbitControls} The configured orbit controls
   */
  function setupControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    return controls;
  }

  /**
   * Sets up the games platform
   * @param {THREE.Scene} scene - The THREE.js scene
   * @returns {GamesPlatform} The configured games platform
   */
  function setupGamesPlatform(scene) {
    const platform = new GamesPlatform();
    platform.initialize(scene);
    
    // Register available games
    platform.registerGame('rubiks_cube', RubiksCubeGame);
    
    // Load the Rubik's Cube game by default
    platform.loadGame('rubiks_cube');
    
    return platform;
  }

  /**
   * Sets up window resize handler
   * @param {THREE.Camera} camera - The THREE.js camera
   * @param {THREE.WebGLRenderer} renderer - The THREE.js renderer
   */
  function setupResizeHandler(camera, renderer) {
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * Sets up keyboard controls for cube manipulation
   * @param {GamesPlatform} gamesPlatform - The games platform instance
   */
  function setupKeyboardControls(gamesPlatform) {
    // Mapping of key to face and direction
    const keyMap = {
      'r': { face: 'R', direction: 'clockwise' },
      'R': { face: 'R', direction: 'counterclockwise' },
      'l': { face: 'L', direction: 'clockwise' },
      'L': { face: 'L', direction: 'counterclockwise' },
      'u': { face: 'U', direction: 'clockwise' },
      'U': { face: 'U', direction: 'counterclockwise' },
      'd': { face: 'D', direction: 'clockwise' },
      'D': { face: 'D', direction: 'counterclockwise' },
      'f': { face: 'F', direction: 'clockwise' },
      'F': { face: 'F', direction: 'counterclockwise' },
      'b': { face: 'B', direction: 'clockwise' },
      'B': { face: 'B', direction: 'counterclockwise' },
    };

    document.addEventListener('keydown', (event) => {
      if (!gamesPlatform.currentGame) return;
      
      if (event.key === ' ') {
        // Space bar to reset the cube
        gamesPlatform.resetCurrentGame();
        return;
      }
      
      const move = keyMap[event.key];
      if (move) {
        gamesPlatform.executeGameCommand({
          action: 'rotate',
          face: move.face,
          direction: move.direction
        });
      }
    });
  }
})();
