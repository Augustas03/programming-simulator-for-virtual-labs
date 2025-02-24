// FaceOrientationIndicator.js
class FaceOrientationIndicator {
    constructor() {
        this.createIndicator();
    }
    
    createIndicator() {
        // Create a container for the orientation indicator
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
        container.style.color = '#fff';
        container.style.borderRadius = '5px';
        container.style.padding = '10px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
        
        // Create the title
        const title = document.createElement('div');
        title.textContent = 'Cube Orientation Guide';
        title.style.marginBottom = '10px';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        container.appendChild(title);
        
        // Create the face indicators
        this.createFaceIndicators(container);
    }
    
    createFaceIndicators(container) {
        // Define face colors and names
        const faces = [
            { name: 'Front (F)', color: '#0000FF', code: 'Blue' },   // Blue
            { name: 'Back (B)', color: '#00FF00', code: 'Green' },   // Green
            { name: 'Right (R)', color: '#FFA500', code: 'Orange' }, // Orange
            { name: 'Left (L)', color: '#FF0000', code: 'Red' },     // Red
            { name: 'Top (U)', color: '#FFFFFF', code: 'White' },    // White
            { name: 'Bottom (D)', color: '#FFFF00', code: 'Yellow' } // Yellow
        ];
        
        // Create indicators for each face
        faces.forEach(face => {
            const faceRow = document.createElement('div');
            faceRow.style.display = 'flex';
            faceRow.style.alignItems = 'center';
            faceRow.style.marginBottom = '5px';
            
            // Create colored square
            const colorSquare = document.createElement('div');
            colorSquare.style.width = '20px';
            colorSquare.style.height = '20px';
            colorSquare.style.backgroundColor = face.color;
            colorSquare.style.marginRight = '10px';
            colorSquare.style.border = '1px solid #888';
            
            // Create face label
            const label = document.createElement('div');
            label.textContent = `${face.name} - ${face.code}`;
            
            // Add to row
            faceRow.appendChild(colorSquare);
            faceRow.appendChild(label);
            
            // Add to container
            container.appendChild(faceRow);
        });
        
        // Add orientation diagram
        const diagram = document.createElement('div');
        diagram.style.marginTop = '10px';
        diagram.style.padding = '10px';
        diagram.style.textAlign = 'center';
        diagram.style.backgroundColor = 'rgba(60, 60, 60, 0.6)';
        diagram.style.borderRadius = '5px';
        
        // Simple ASCII diagram showing orientation
        diagram.innerHTML = `
            <div style="font-family: monospace; white-space: pre; font-size: 12px;">
                    W (U)
                    |
            R (L) -- B (F) -- O (R)
                    |
                    Y (D)
                    |
                    G (B)
            </div>
            <div style="margin-top: 10px; font-size: 12px;">
                Default view: Blue is front, White is top
            </div>
        `;
        
        container.appendChild(diagram);
        
        // Add a note about orbit controls
        const note = document.createElement('div');
        note.style.marginTop = '10px';
        note.style.fontSize = '12px';
        note.style.fontStyle = 'italic';
        note.textContent = 'Note: The cube faces remain the same in code, regardless of how you rotate the camera.';
        container.appendChild(note);
    }
}

export default FaceOrientationIndicator;