/**
 * User interface component that displays the orientation of cube faces
 * and their corresponding colors and keyboard shortcuts
 */
class FaceOrientationIndicator {
    /**
     * Creates a new face orientation indicator
     */
    constructor() {
        this.createIndicator();
    }
    
    /**
     * Creates the UI for the orientation indicator
     */
    createIndicator() {
        this.createMainContainer();
        this.createTitle();
        this.createNoteBox();
        this.createFaceIndicators();
        this.createToggleButton();
        this.createMinimizedContainer();
    }
    
    /**
     * Creates the main container for the indicator
     */
    createMainContainer() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
        container.style.color = '#fff';
        container.style.borderRadius = '5px';
        container.style.padding = '10px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.zIndex = '1000';
        container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        container.style.maxWidth = '350px';
        document.body.appendChild(container);
        this.container = container;
    }
    
    /**
     * Creates the title for the indicator
     */
    createTitle() {
        const title = document.createElement('div');
        title.textContent = 'Cube Orientation Guide';
        title.style.marginBottom = '10px';
        title.style.fontWeight = 'bold';
        title.style.textAlign = 'center';
        title.style.fontSize = '16px';
        this.container.appendChild(title);
    }
    
    /**
     * Creates a note box with important information
     */
    createNoteBox() {
        const noteBox = document.createElement('div');
        noteBox.style.backgroundColor = 'rgba(255, 255, 70, 0.2)';
        noteBox.style.border = '1px solid #aa5';
        noteBox.style.borderRadius = '4px';
        noteBox.style.padding = '8px';
        noteBox.style.marginBottom = '10px';
        noteBox.style.fontSize = '14px';
        noteBox.style.lineHeight = '1.4';
        noteBox.innerHTML = '<strong>Important:</strong> The cube faces remain the same in code, regardless of camera rotation. <strong>Blue is always front (F)</strong>, white is always top (U), etc.';
        this.container.appendChild(noteBox);
    }
    
    /**
     * Creates the face indicators table
     */
    createFaceIndicators() {
        // Define face colors and names
        const faces = [
            { name: 'Front (F)', color: '#0000FF', code: 'Blue', notationKey: 'f/F' },
            { name: 'Back (B)', color: '#00FF00', code: 'Green', notationKey: 'b/B' },
            { name: 'Right (R)', color: '#FFA500', code: 'Orange', notationKey: 'r/R' },
            { name: 'Left (L)', color: '#FF0000', code: 'Red', notationKey: 'l/L' },
            { name: 'Top (U)', color: '#FFFFFF', code: 'White', notationKey: 'u/U' },
            { name: 'Bottom (D)', color: '#FFFF00', code: 'Yellow', notationKey: 'd/D' }
        ];
        
        // Create a table for better organization
        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.fontSize = '14px';
        
        // Add table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['Face', 'Color', 'Key'].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.padding = '5px';
            th.style.textAlign = 'left';
            th.style.borderBottom = '1px solid #555';
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Add table body
        const tbody = document.createElement('tbody');
        
        faces.forEach(face => {
            const row = document.createElement('tr');
            
            // Face name cell
            const faceCell = document.createElement('td');
            faceCell.textContent = face.name;
            faceCell.style.padding = '5px';
            faceCell.style.borderBottom = '1px solid #444';
            row.appendChild(faceCell);
            
            // Color cell with color square and name
            const colorCell = document.createElement('td');
            const colorFlex = document.createElement('div');
            colorFlex.style.display = 'flex';
            colorFlex.style.alignItems = 'center';
            
            const colorSquare = document.createElement('div');
            colorSquare.style.width = '20px';
            colorSquare.style.height = '20px';
            colorSquare.style.backgroundColor = face.color;
            colorSquare.style.marginRight = '5px';
            colorSquare.style.border = face.color === '#FFFFFF' ? '1px solid #888' : '1px solid transparent';
            
            const colorName = document.createElement('span');
            colorName.textContent = face.code;
            
            colorFlex.appendChild(colorSquare);
            colorFlex.appendChild(colorName);
            colorCell.appendChild(colorFlex);
            colorCell.style.padding = '5px';
            colorCell.style.borderBottom = '1px solid #444';
            row.appendChild(colorCell);
            
            // Keyboard shortcut cell
            const keyCell = document.createElement('td');
            keyCell.textContent = face.notationKey;
            keyCell.style.padding = '5px';
            keyCell.style.borderBottom = '1px solid #444';
            keyCell.style.fontFamily = 'monospace';
            row.appendChild(keyCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        this.container.appendChild(table);
    }
    
    /**
     * Creates the toggle button to minimize the indicator
     */
    createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Minimize Guide';
        toggleButton.style.backgroundColor = '#555';
        toggleButton.style.color = '#fff';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '3px';
        toggleButton.style.padding = '5px 10px';
        toggleButton.style.marginTop = '10px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.alignSelf = 'center';
        
        toggleButton.addEventListener('click', () => {
            this.hideUIPanel();
        });
        
        this.container.appendChild(toggleButton);
        this.toggleButton = toggleButton;
    }
    
    /**
     * Creates the minimized container (shown when the main panel is hidden)
     */
    createMinimizedContainer() {
        const minimizedContainer = document.createElement('div');
        minimizedContainer.style.position = 'absolute';
        minimizedContainer.style.bottom = '20px';
        minimizedContainer.style.left = '20px';
        minimizedContainer.style.backgroundColor = 'rgba(40, 40, 40, 0.9)';
        minimizedContainer.style.color = '#fff';
        minimizedContainer.style.borderRadius = '5px';
        minimizedContainer.style.padding = '8px 12px';
        minimizedContainer.style.fontFamily = 'Arial, sans-serif';
        minimizedContainer.style.zIndex = '1000';
        minimizedContainer.style.cursor = 'pointer';
        minimizedContainer.style.display = 'none';
        minimizedContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
        minimizedContainer.textContent = 'Show Cube Orientation Guide';
        
        minimizedContainer.addEventListener('click', () => {
            this.showUIPanel();
        });
        
        document.body.appendChild(minimizedContainer);
        this.minimizedContainer = minimizedContainer;
    }
    
    /**
     * Hides the main UI panel and shows the minimized version
     */
    hideUIPanel() {
        if (this.container) {
            this.container.style.display = 'none';
            this.minimizedContainer.style.display = 'block';
        }
    }
    
    /**
     * Shows the main UI panel and hides the minimized version
     */
    showUIPanel() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.minimizedContainer.style.display = 'none';
        }
    }
}

export default FaceOrientationIndicator;