import * as THREE from 'three';

const colours = [
    new THREE.MeshPhongMaterial({ color: 0xFFA500 }), // Right (+x)
    new THREE.MeshPhongMaterial({ color: 0xFF0000 }), // Left (-x)
    new THREE.MeshPhongMaterial({ color: 0xFFFFFF }), // Top (+y)
    new THREE.MeshPhongMaterial({ color: 0xFFFF00 }), // Bottom (-y)
    new THREE.MeshPhongMaterial({ color: 0x0000FF }), // Front (+z)
    new THREE.MeshPhongMaterial({ color: 0x00FF00 })  // Back (-z)
];

const checkCubelet = (x, y, z) =>{
    // Create array of 6 basic gray materials as default
    const materials = Array(6).fill(new THREE.MeshPhongMaterial({ color: 0xAAAAAA }));

    console.log(`Cubelet at position (${x}, ${y}, ${z})`);
    
    // Check each coordinate and assign colors based on position
    if (x === 1) {
        console.log('Setting right face orange');
        materials[0] = colours[0];  // Right face (+x)
    }
    if (x === -1) {
        console.log('Setting left face red');
        materials[1] = colours[1]; // Left face (-x)
    }
    if (y === 1) {
        console.log('Setting top face white');
        materials[2] = colours[2];  // Top face (+y)
    }
    if (y === -1) {
        console.log('Setting bottom face yellow');
        materials[3] = colours[3]; // Bottom face (-y)
    }
    if (z === 1) {
        console.log('Setting front face blue');
        materials[4] = colours[4];  // Front face (+z)
    }
    if (z === -1) {
        console.log('Setting back face green');
        materials[5] = colours[5]; // Back face (-z)
    }

    return materials;
}

export default checkCubelet;