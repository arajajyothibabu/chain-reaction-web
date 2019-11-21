class CellData {
    x;
    y;
    _id;
    maxBalls;
    color;
    count = 0;
    balls = [];
    left;
    right;
    top;
    bottom;

    constructor(x, y, id, maxBalls, color) {
        this.x = x;
        this.y = y;
        this._id = id;
        this.maxBalls = maxBalls;
        this.color = color;
    }
}

class GameState {

    state = [];
    rows;
    cols;
    store = {};

    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.buildState();
    }

    getMaxBalls = (x, y, rows, cols) => {
        if(
            (x === 0 && y === 0) ||
            (x === rows - 1 && y === cols - 1) ||
            (x === 0 && y === cols - 1) ||
            (x === rows - 1 && y === 0)
        ){
            return 1;
        } else if (
            (y > 0 && y < cols - 1 && (x === 0 || x === rows - 1)) ||
            (x > 0 && x < rows - 1 && (y === 0 || y === cols - 1))
        ){
            return 2;
        } else {
            return 3;
        }
    };

    updateWithNeighbours = (cellData = {}) => {
        const { x, y } = cellData;
        cellData.left = x + "_" + Math.min(0, y - 1);
        cellData.right = x + "_" + Math.min(this.cols - 1, y + 1);
        cellData.top = Math.min(0, x - 1) + "_" + y;
        cellData.bottom = Math.min(this.rows - 1, x + 1) + "_" + y;
        return cellData;
    };

    buildState = () => {
        for(let i = 0; i < this.rows; i++){
            const row = [];
            for(let j = 0; j < this.cols; j++){
                const _id = i + "_" + j;
                const cellData = new CellData(i, j, _id, this.getMaxBalls(i, j, this.rows, this.cols));
                this.updateWithNeighbours(cellData);
                this.store[_id] = cellData;
                row.push(cellData);
            }
            this.state.push(row);
        }
    };



}

class ChainReaction {
    container;
    containerWidth;
    containerHeight;
    width;
    height;
    canvas;
    ctx;
    size;
    cellSize;
    rows;
    cols;
    state;

    constructor(container, size = 15) {
        this.container = container;
        this.size = size;
        this.init();
        this.state = new GameState(this.rows, this.cols);
    }

    init = () => {
        this.processContainer();
        this.buildCanvas();
        this.drawBoard();
        this.drawBall();
    };

    calculateDimensions = () => {
        const offset = ((this.containerWidth + this.containerHeight) / this.size) / 2;
        const widthError = this.containerWidth % offset;
        const heightError = this.containerHeight % offset;
        this.width = Math.ceil(this.containerWidth - widthError);
        this.height = Math.ceil(this.containerHeight - heightError);
        this.cellSize = offset;
        this.rows = Math.floor(this.containerHeight / offset);
        this.cols = Math.floor(this.containerWidth / offset);
        this.adjustContainerPosition(widthError, heightError);
    };

    adjustContainerPosition = (widthError, heightError) => {
        this.container.style.padding = `${heightError / 2}px ${widthError / 2}px`;
    };

    processContainer = () => {
        if(this.container){
            this.containerWidth = this.container.offsetWidth;
            this.containerHeight = this.container.offsetHeight;
            this.calculateDimensions();
        } else {
            throw new Error("Need Container to run the Game!");
        }
    };

    createCell = (size) => {
        const cell = document.createElement("div");
        cell.setAttribute("style", `display: flex;height: ${size}px;width: ${size}px;`);
        return cell;
    };

    createBall = (size, color) => {
        const ball = document.createElement("div");
        ball.setAttribute("style", `display: flex;background: black;border-radius: 50%;height: ${size}px;width: ${size}px;margin: 0;background: radial-gradient(circle at 100px 100px, ${color}, #000);`);
        return ball;
    };

    buildCanvas = () => {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
    };

    fillBackground = (color = "#000000") => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    };

    drawBall = (x = 10, y = 10, radius = 10, color = "#FF0000") => {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI*2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    };

    drawBoard = () => {

        this.fillBackground();

        const padding = 0, spacing = 0;
        //vertical
        for (let x = 0; x <= this.width; x += this.cellSize) {
            this.ctx.moveTo(spacing + x + padding, padding);
            this.ctx.lineTo(spacing + x + padding, this.height + padding);
        }
        //horizontal
        for (let x = 0; x <= this.height; x += this.cellSize) {
            this.ctx.moveTo(padding, spacing + x + padding);
            this.ctx.lineTo(this.width + padding, spacing + x + padding);
        }
        this.ctx.strokeStyle = "#CCCCCC";
        this.ctx.stroke();
    };

    generateGradient = (x, y, size, color) => {
        const gradient = this.ctx.createLinearGradient(-size, x, size, y);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#FFFFFF');
        return gradient;
    };

    colorInHSL = (fraction) => {
        return `hsl(${fraction * 360}, 100%, 50%)`;
    };

}