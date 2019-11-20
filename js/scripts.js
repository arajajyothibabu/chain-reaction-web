

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

    constructor(container, size = 15) {
        this.container = container;
        this.size = size;
        this.init();
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