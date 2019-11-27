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
        cellData.left = this.getId(x, Math.max(0, y - 1));
        cellData.right = this.getId(x, Math.min(this.cols - 1, y + 1));
        cellData.top = this.getId(Math.max(0, x - 1), y);
        cellData.bottom = this.getId(Math.min(this.rows - 1, x + 1), + y);
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
    size;
    cellSize;
    rows;
    cols;
    state;
    playerCount;
    COLORS = ["#FF0000", "#0000FF", "#00FF00", "#FF00E4", "#00FFDC", "#FF6400"];
    currentPlayer = 0;

    constructor(container, size = 15, playerCount = 2) {
        this.container = container;
        this.size = size;
        this.init();
        this.state = new GameState(this.rows, this.cols);
        this.drawBoard();
        this.playerCount = playerCount;
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
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.background = `radial-gradient(circle at 50% 50%, ${color}, #000)`;
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

    distributeBalls = (cellData, currentCell) => {
        const { left, right, top, bottom, _id, color } = cellData;
        if(left !== _id){
            this.removeBall(currentCell, cellData);
            this.drawBall(left, this.state.getCellData(left), color);
        }
        if(right !== _id){
            this.removeBall(currentCell, cellData);
            this.drawBall(right, this.state.getCellData(right), color);
        }
        if(top !== _id){
            this.removeBall(currentCell, cellData);
            this.drawBall(top, this.state.getCellData(top), color);
        }
        if(bottom !== _id){
            this.removeBall(currentCell, cellData);
            this.drawBall(bottom, this.state.getCellData(bottom), color);
        }
    };

    removeBall = (targetCell, cellData) => {
        if(cellData.count > 0){
            const ball = cellData.balls.pop();
            cellData.count--;
            targetCell.removeChild(ball);
            if(cellData.count === 0){
                cellData.color = null;
            }
        }
    };

    updateBallsColor = (balls = [], color) => {
        balls.forEach(ball => {
            ball.style.background = `radial-gradient(circle at 50% 50%, ${color}, #000)`;
        });
    };

    drawBall = (targetCell, cellData, color = cellData.color) => {
        setTimeout(() => {
            let element = targetCell;
            if(typeof element === "string"){
                element = document.getElementById(targetCell);
            }
            if(color !== cellData.color){ //updating colors of existing balls
                this.updateBallsColor(cellData.balls, color);
                cellData.color = color;
            }
            if(cellData.count < cellData.maxBalls){
                const ball = this.createBall(this.cellSize * 0.40, color);
                element.appendChild(ball);
                cellData.count++;
                cellData.balls.push(ball);
            } else {
                this.distributeBalls(cellData, element);
            }
        }, 0);
    };

    cellClickListener = (event) => {
        const id = event.target.id;
        const cellData = this.state.getCellData(id);
        const currentColor = this.getCurrentColor();
        if(cellData.color){
            if(cellData.color === currentColor){
                this.drawBall(event.target, cellData);
                this.updateCurrentPlayer();
            }
        } else {
            cellData.color = currentColor;
            this.drawBall(event.target, cellData);
            this.updateCurrentPlayer();
        }
    };

    getCurrentColor = () => {
        return this.COLORS[this.currentPlayer];
    };

    updateCurrentPlayer = () => {
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
        return this.currentPlayer;
    };

}