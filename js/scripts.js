

class ChainReaction {
    container;
    width;
    height;
    canvas;
    ctx;
    rows;
    cols;

    constructor(container, rows = 40, cols = 15) {
        this.container = container;
        this.processContainer();
        this.buildCanvas();
    }

    processContainer = () => {
        if(this.container){
            this.width = this.container.offsetWidth;
            this.height = this.container.offsetHeight;
        } else {
            throw new Error("Need Container to run the Game!");
        }
    };

    buildCanvas = () => {
        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.drawBorder();
    };

    drawBorder = () => {
        this.ctx.beginPath();
        this.ctx.rect(20, 20, 150, 100);
        this.ctx.stroke();
        this.drawBall();
    };

    drawBall = (x = 10, y = 10, radius = 10, color = "#0095DD") => {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI*2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
    };


}