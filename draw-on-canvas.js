function DrawCanvas(canvas){
    var context = canvas.getContext("2d");
    this.draw = function(pt1,pt2){
        pt2 = pt2 || pt1; 
        context.strokeStyle = "#000000"; 
        context.lineJoin = "round"; 
        context.lineWidth = 5; 
        context.beginPath(); 
        context.moveTo(pt1.x, pt1.y); 
        context.lineTo(pt2.x, pt2.y); 
        context.closePath(); 
        context.stroke(); 
    }
    this.clear = function clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(0,0, canvas.width, canvas.height);        
    };
    this.clear();
    return this;
}

function DrawOnCanvas(){
    //I think I just want to make a simple thing to start off. 
    //I want two canvas contexts to be used one that we'll use for the 
    //current prediction
    var lastPt,
    currStroke,
    canvas,
    context=(canvas=document.querySelector("canvas")).getContext("2d");
    var drawOnCanvas = this;
    drawOnCanvas.onStroke = function(stroke){};

    function mousedown(e){
        lastPt ={x:e.pageX,y:e.pageY};
        currStroke = [lastPt];
    }
    function mousemove(e){
        if (lastPt){
            var curr = {x:e.pageX,y:e.pageY};
            draw(lastPt, curr);
            lastPt = curr;
            currStroke.push(curr);
        }
    }
    function mouseup(e){
        mousemove(e);
        drawOnCanvas.onStroke(currStroke);
        lastPt=null;
        currStroke = null;
    }
    function draw(pt1,pt2){ 
        pt2 = pt2 || pt1; 
        context.strokeStyle = "#000000"; 
        context.lineJoin = "round"; 
        context.lineWidth = 5; 
        context.beginPath(); 
        context.moveTo(pt1.x, pt1.y); 
        context.lineTo(pt2.x, pt2.y); 
        context.closePath(); 
        context.stroke(); 
    }
    document.getElementById("clear").addEventListener("click", clear);
    initCanvas();
    clear();
    function clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(0,0, canvas.width, canvas.height);
        for (var i=0;i<5;i++){
            var y = 20 + i*20;
            context.moveTo(0, y);
            context.lineTo(240, y);    
            context.stroke();
        }
        lastPt = null;
    }

    function initCanvas() {
        canvas.addEventListener("mousedown",mousedown,false);
        canvas.addEventListener("mousemove",mousemove,false);
        canvas.addEventListener("mouseup",mouseup,false);
    }
}