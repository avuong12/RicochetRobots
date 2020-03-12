class Grid {
    constructor(rows, columns, defaultValue){
        this.rows = rows;
        this.columns = columns;

        // Create a matrix with dimensions rows x columns
        // with undefined values in each cell.
        this.grid = [];
        for (let r = 0; r < this.rows; ++r) {
            let row = [];
            for (let c = 0; c < this.columns; ++c) {
                row.push(defaultValue);
            }
            this.grid.push(row);
        }
    }

    // get function will return the value in a cell at the input coordinate
    get(row, column) {
        return this.grid[row][column];
    }
    
    // set function will change the value of a cell.
    set(row, column, value) {
        this.grid[row][column] = value;
    }

    // fill function will full the entire grid with a value.
    fill(value) {
        for (let r = 0; r < this.rows; r++){
            for (let c = 0; c < this.columns; c++){
                this.set(r, c, value);
            }
        }
    }
}