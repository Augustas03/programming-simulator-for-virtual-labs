import * as THREE from 'three';

/**
 * Standard face colors for the Rubik's Cube in order of THREE.js BoxGeometry faces:
 * [right, left, top, bottom, front, back]
 */
const FACE_COLORS = Object.freeze({
  RIGHT: 0xFFA500,  // Orange (+x)
  LEFT: 0xFF0000,   // Red (-x)
  TOP: 0xFFFFFF,    // White (+y)
  BOTTOM: 0xFFFF00, // Yellow (-y)
  FRONT: 0x0000FF,  // Blue (+z)
  BACK: 0x00FF00    // Green (-z)
});

// Pre-create material instances to avoid redundant instantiation
const MATERIALS = {
  RIGHT: new THREE.MeshPhongMaterial({ color: FACE_COLORS.RIGHT }),
  LEFT: new THREE.MeshPhongMaterial({ color: FACE_COLORS.LEFT }),
  TOP: new THREE.MeshPhongMaterial({ color: FACE_COLORS.TOP }),
  BOTTOM: new THREE.MeshPhongMaterial({ color: FACE_COLORS.BOTTOM }),
  FRONT: new THREE.MeshPhongMaterial({ color: FACE_COLORS.FRONT }),
  BACK: new THREE.MeshPhongMaterial({ color: FACE_COLORS.BACK }),
  DEFAULT: new THREE.MeshPhongMaterial({ color: 0xAAAAAA })
};

/**
 * Determines the correct materials for a cubelet based on its position in the cube
 * 
 * @param {number} x - X coordinate (-1, 0, 1)
 * @param {number} y - Y coordinate (-1, 0, 1)
 * @param {number} z - Z coordinate (-1, 0, 1)
 * @returns {THREE.MeshPhongMaterial[]} Array of materials for each face
 */
const checkCubelet = (x, y, z) => {
  // Start with default gray color for all faces
  const materials = Array(6).fill().map(() => MATERIALS.DEFAULT);

  // Set colors based on position
  if (x === 1) materials[0] = MATERIALS.RIGHT;  // Right face (+x)
  if (x === -1) materials[1] = MATERIALS.LEFT;  // Left face (-x)
  if (y === 1) materials[2] = MATERIALS.TOP;    // Top face (+y)
  if (y === -1) materials[3] = MATERIALS.BOTTOM; // Bottom face (-y)
  if (z === 1) materials[4] = MATERIALS.FRONT;  // Front face (+z)
  if (z === -1) materials[5] = MATERIALS.BACK;  // Back face (-z)

  return materials;
};

export default checkCubelet;