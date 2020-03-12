// TODO(angela): Ask TA's about how to use a class defined in another
// javascript file. How does this relate to modules?
// import {Grid} from './grid.js';

// The class will draw a grid to the html.
class HtmlGrid {
    constructor(rows, columns) {
        this.grid = new Grid(rows, columns, false);
        this.dragging = false;
    }

    // Toggle the color of the cell at the input row and column.
    toggleCell(row, column) {
        // if(this.grid.get(row, column)){
        //     this.grid.set(row, column, false);
        // } else{
        //     this.grid.set(row, column, true);
        // }
        // First update the model.
        let currentValue = this.grid.get(row, column);
        let newValue = !currentValue;
        this.grid.set(row, column, newValue);

        // Then update the DOM.
        let cell = document.getElementById(`${row},${column}`);
        // The cell is have either filled or empty. Toggling both will swap 
        // one for the other.
        cell.classList.toggle('filled-grid-cell');
        cell.classList.toggle('empty-grid-cell');
    }

    // Frist. draw function will iterate through each cell in the grid.
    // It will draw a cell for each cell coordinate. If the value
    // of the cell is true, draw a filled cell. If the value of
    // the cell is false, draw an empty cell. 
    draw(parentNode) {
       for (let r = 0; r < this.grid.rows; r++){
           for (let c = 0; c < this.grid.columns; c++){
               let newSpan = document.createElement('span');
               // IMPORTANT! This makes each cell acessiable with a
               // unique id. 
               newSpan.id = `${r},${c}`;
               newSpan.classList.toggle('grid-cell');
               if(this.grid.get(r, c)){
                   newSpan.classList.toggle('filled-grid-cell');
               } else {
                   newSpan.classList.toggle('empty-grid-cell');
               }

                // add an event listner to each new span to toggle the
                // cell when the mouse is pressed down on the cell.
                newSpan.addEventListener(
                    'mousedown', () => {
                        this.toggleCell(r, c);
                        this.dragging = true;
                    });
                
                // add an event listner to each new span to toggle the
                // cell when the mouse enter the cell for the first time. 
                newSpan.addEventListener(
                    'mouseenter', () => {
                        if(this.dragging){
                            this.toggleCell(r, c);
                        }
                    });
                
                // add an event listner to each new span to toggle the 
                // cell with mouseenter and stopping the dragging by setting
                // dragging to false.
                newSpan.addEventListener(
                    'mouseup', () => {
                        this.dragging = false;
                    });
                    
               parentNode.appendChild(newSpan);
           }

           let breakNode = document.createElement('br');
           parentNode.appendChild(breakNode);
       }
    }
}

