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
                const _id = this.getId(i, j);
                const cellData = new CellData(i, j, _id, this.getMaxBalls(i, j, this.rows, this.cols));
                this.updateWithNeighbours(cellData);
                this.store[_id] = cellData;
                row.push(cellData);
            }
            this.state.push(row);
        }
    };

    getId = (rowId, cellId) => {
        return `${rowId}-${cellId}`;
    };

    getCellData = (id) => {
        return this.store[id];
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
        this.drawBoard();
    }

    init = () => {
        this.processContainer();
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

    createWrapper = () => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        wrapper.setAttribute("style", `width: ${this.width}px;height: ${this.height}px;`);
        return wrapper;
    };

    createCell = (size, id) => {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("style", `height: ${size}px;width: ${size}px;`);
        cell.setAttribute("id", id);
        cell.addEventListener("click", this.cellClickListener);
        return cell;
    };

    createBall = (size = 20, color = "#5cabff") => {
        const ball = document.createElement("div");
        ball.classList.add("ball");
        ball.setAttribute("style", `height: ${size}px;width: ${size}px;background: radial-gradient(circle at 50% 50%, ${color}, #000);`);
        return ball;
    };

    drawBoard = () => {
        const wrapper = this.createWrapper();
        for (let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++){
                wrapper.append(this.createCell(this.cellSize, this.state.getId(i, j)));
            }
        }
        this.container.appendChild(wrapper);
    };

    cellClickListener = (event) => {
        const id = event.target.id;
        const cellData = this.state.getCellData(id);
        const ball = this.createBall();
        event.target.appendChild(ball);
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