# Educational 3D Rubik's Cube Simulator


A three.js-based Rubik's Cube simulator designed for teaching programming concepts through hands-on algorithm implementation. This project provides students with a visual, interactive environment to write and test Rubik's Cube algorithms without getting bogged down in UI implementation details.

## Project Overview

This simulator allows students to:
- Write code to manipulate a 3D Rubik's Cube
- Visualize their algorithms in real-time
- Understand spatial relationships and algorithmic thinking
- Focus on problem-solving rather than graphics programming

## Features

- **Interactive 3D Cube**: Fully rendered, manipulatable Rubik's Cube
- **Code Interface**: Built-in code editor for writing algorithms
- **Face Orientation Guide**: Clear indicators for cube orientation
- **Visual Feedback**: Real-time visualization of code execution
- **Standard Notation**: Support for standard Rubik's Cube move notation
- **Educational Tools**: Built-in examples and documentation

## Technologies Used

- Three.js for 3D rendering
- JavaScript ES6+
- HTML5/CSS3
- Vite for development and building

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/programming-simulator-for-virtual-labs.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Basic Controls

- **Mouse/Touch Controls**: 
  - Orbit: Left click + drag
  - Pan: Right click + drag
  - Zoom: Scroll wheel

### Writing Code

The simulator provides a code interface where students can write JavaScript to control the cube. Example usage:

```javascript
// Execute a simple algorithm (R U R' U')
function simpleAlgorithm() {
    cube.R();      // Rotate right face clockwise
    cube.U();      // Rotate top face clockwise
    cube.RPrime(); // Rotate right face counter-clockwise
    cube.UPrime(); // Rotate top face counter-clockwise
}

// Execute a sequence of moves
cube.executeSequence(['R', 'U', 'RPrime', 'UPrime'], () => {
    console.log("Sequence completed!");
});
```

### Available Methods

- `R()`, `RPrime()` - Right face rotations
- `L()`, `LPrime()` - Left face rotations
- `U()`, `UPrime()` - Upper face rotations
- `D()`, `DPrime()` - Down face rotations
- `F()`, `FPrime()` - Front face rotations
- `B()`, `BPrime()` - Back face rotations

## Educational Purpose

This project is designed to help students:
1. Learn algorithmic thinking
2. Understand 3D space manipulation
3. Practice problem decomposition
4. Implement solutions to complex problems
5. Visualize their code execution in real-time

## Project Structure

```
src/
├── main.js                 # Main application entry
├── components/
│   ├── RubiksCube.js      # Core cube functionality
│   ├── CodeInterface.js    # Code editor interface
│   └── FaceOrientationIndicator.js # Orientation guide
└── helpers/
    └── CubeletChecker.js   # Cubelet color management
```

## Face Color Convention

- Front: Blue
- Back: Green
- Right: Orange
- Left: Red
- Top: White
- Bottom: Yellow

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgments

- This project was inspired by the educational concept of using tangible interfaces for teaching programming concepts
- Built using Three.js for 3D rendering
- Special thanks to the Rubik's Cube community for standardized notation and algorithms

