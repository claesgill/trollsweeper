/** @type {CanvasRenderingContext2D} */

let canvas;
let ctx;
let grid;
let cols;
let rows;
let mouseX;
let mouseY;
let cellSize;
let numTrollCells;
let markersRemaining;

class Cell {
    constructor(i, j, w){
        this.i = i;
        this.j = j;
        this.x = i*w;
        this.y = j*w;
        this.w = w;
        this.neighborCount = 0;
        this.isTroll  = false;
        this.revealed = false;
        this.isMarked  = false;
    }

    show(){
        ctx.strokeStyle = "#000000";
        // If revealed show either troll, count or blank cell
        if(this.revealed){
            if(this.isTroll){
                ctx.rect(this.x, this.y, this.w, this.w);
                ctx.drawImage(troll, this.x, this.y, this.w, this.w);
            }
            else if(this.neighborCount > 0){
                ctx.fillStyle   = "#CCCCCC";
                ctx.fillRect(this.x, this.y, this.w, this.w);
                ctx.font = String(Math.floor(cellSize/2))+"px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(this.neighborCount, this.x+this.w/3, this.y + this.w/1.5);
                ctx.rect(this.x, this.y, this.w, this.w);
            }
            else{
                ctx.fillStyle   = "#CCCCCC";
                ctx.fillRect(this.x, this.y, this.w, this.w);
            }
        }
        else if(this.isMarked){
            // Adding flag-icon
            ctx.font = String(Math.floor(cellSize/2))+"px Arial";
            ctx.fillText('\u{1f6a9}', this.x+this.w/3, this.y + this.w/1.5);
            ctx.rect(this.x, this.y, this.w, this.w);
        }
        // If not revealed overlay blanks cells
        else{
            ctx.rect(this.x, this.y, this.w, this.w);
        }
        ctx.stroke();
    }

    countTrolls(){
        if(this.isTroll){
            return;
        }
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                let i = this.i + xOffset;
                let j = this.j + yOffset;
                if(i > -1 && i < cols && j > -1 && j < rows){
                    let neighbor = grid[i][j];
                    if(neighbor.isTroll){
                        this.neighborCount++;
                    }
                }
            }
        }
    }

    reveal(){
        // Reveal cell and check blank cell
        this.revealed = true;
        if(grid[this.i][this.j].neighborCount == 0){
            this.floodFillAlgorithm();
        }
    }

    mark(){
        this.isMarked = true;
    }

    unMark(){
        // Unmarking and clearing flag-icon
        ctx.clearRect(this.x, this.y, this.w, this.w);
        ctx.rect(this.x, this.y, this.w, this.w);
        ctx.stroke();
        this.isMarked = false;
    }

    floodFillAlgorithm(){
        // Checking for blank boxes and reveal all surrounding
        for(let xOffset=-1; xOffset<=1; xOffset++){
            for(let yOffset=-1; yOffset<=1; yOffset++){
                let i = this.i + xOffset;
                let j = this.j + yOffset;
                if(i > -1 && i < cols && j > -1 && j < rows){
                    let neighbor = grid[i][j];
                    if(!neighbor.isTroll && !neighbor.revealed){
                        neighbor.reveal();
                        neighbor.show();
                    }
                }
            }
        }
    }
}

function create2dArray(cols, rows){
    // Creating a 2D array
    let arr = new Array(cols);
    for(let i = 0; i < rows; i++){
        arr[i] = new Array(rows);
    }
    return arr;
}

function markersRemainingUpdate(){
    // Updating the flag-remainding-count
    ctx.clearRect(cols*cellSize+10, 0, 50*3, 50);
    ctx.font = "30px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("\u{1f6a9}=" + markersRemaining, cols*cellSize+10, 50/1.5);
}

function SetupCanvas(){
    // Parameters
    cols = 10;
    rows = 10;
    cellSize = 50;
    numTrollCells = 12;
    markersRemaining = numTrollCells;

    // Setup canvas
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add instructions
    ctx.font = "20px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("1) use 'SHIFT + MOUSE-CLICK' to flag a troll", 10, cols*cellSize+30);
    ctx.fillText("2) press 'r' to restart", 10, cols*cellSize+60);
    ctx.clearRect(10, 0, 200, 100);

    troll = new Image();
    troll.src = "images/troll.png";

    grid = create2dArray(cols, rows);

    // Creating all the cells
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j] = new Cell(i, j, cellSize);
        }  
    }        

    // Adding the number of trolls to the game
    while(numTrollCells != 0){
        let x = Math.floor(Math.random(0, cols) * cols);
        let y = Math.floor(Math.random(0, rows) * rows);
        if(!grid[x][y].isTroll){
            grid[x][y].isTroll = true;
            numTrollCells--;
        }
    }

    // Making every cell count how many trollsneighbors it got
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].countTrolls();
        }   
    }

    // Displaying the board
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].show();
        }   
    }

    markersRemainingUpdate();
}

function mouseClicked(e){
    // Checking for mouse events
    mouseX = e.pageX;
    mouseY = e.pageY;
    if(e.shiftKey){
        if(markersRemaining > 0){
            markersRemaining--;
            markersRemainingUpdate();
            markCell();
        }
    }
    else{
        checkCellClicked()
    }
}

function gameOver(){
    // Game over show all cells
    for (let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].reveal();
            grid[i][j].show();
        }
    }
}

function checkCellClicked(){
    // Check if cell is clicked
    // revealing, mark or check if game over
    for (let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            if (mouseX > grid[i][j].x && 
                mouseX < grid[i][j].x + grid[i][j].w &&
                mouseY > grid[i][j].y &&
                mouseY < grid[i][j].y + grid[i][j].w){
                if(grid[i][j].isTroll){
                    gameOver();
                    ctx.clearRect(10, cols*cellSize+10, rows*cellSize+40, 100);
                    ctx.font = "20px Courier New";
                    ctx.fillStyle = "black";
                    ctx.fillText("Game over! Restarting game in 5 seconds!", 10, cols*cellSize+30);
                    window.setTimeout(() => {
                        window.location.reload()
                    }, 5000)
                }
                else if(grid[i][j].isMarked){
                    markersRemaining++;
                    grid[i][j].unMark();
                    markersRemainingUpdate();
                }
                else{
                    grid[i][j].reveal();
                    grid[i][j].show();
                }
            }
        }
    }
}

function markCell(shiftKey){
    // Marking a cell with flag
    for (let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            if (mouseX > grid[i][j].x && 
                mouseX < grid[i][j].x + grid[i][j].w &&
                mouseY > grid[i][j].y &&
                mouseY < grid[i][j].y + grid[i][j].w){
                grid[i][j].mark();
                grid[i][j].show();
            }
        }
    }
}

function updateCanvas(){
    // Every loop check if mouse is clicked
    window.addEventListener("mouseup", mouseClicked);
    // Check touch event
    window.addEventListener("touchend", mouseClicked)
    // Refrech if touched twice
    // window.addEventListener("touchmove", window.location.reload())
}

function loop(){
    updateCanvas();
    window.requestAnimationFrame(loop);
}

function refreshPage(e){
    // 114 is the 'r'-key
    if(e.keyCode == 114){
        window.location.reload();
    }
}

// Setup the canvas when pages is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);
// Refesh page when hitting 'r'-key
document.addEventListener('keypress', refreshPage);
// Render loop
window.requestAnimationFrame(loop);