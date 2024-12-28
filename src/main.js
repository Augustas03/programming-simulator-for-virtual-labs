import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import checkCubelet from './helpers/CubeletChecker';

const cubelets = [];
const size = 1;
const gap = 0.02;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 10;


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Add ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Add one directional light for shadows and depth
const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(10, 10, 10);
scene.add(mainLight);

function createCubelet(size, x, y, z) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const materials = checkCubelet(x,y,z); 
    
    console.log('Materials array:', materials); // Add this line
    
    // Use all materials for the cube
    const cube = new THREE.Mesh(geometry, materials);

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    cube.add(edges);
    return cube;
}

for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const cubelet = createCubelet(size, x, y, z);
            cubelet.position.set(
                x * (size + gap),
                y * (size + gap),
                z * (size + gap)
            );
            cubelets.push(cubelet);
        }
    }
}

const controls = new OrbitControls( camera, renderer.domElement );
 				controls.minDistance = 1;
 				controls.maxDistance = 8;
        		controls.target.set( 0, 1, 0 );
 				controls.update();

cubelets.forEach(cubelet => scene.add(cubelet));


function animate() {
    requestAnimationFrame(animate);
	renderer.render( scene, camera );
}

animate();
