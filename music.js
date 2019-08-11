//I think I just want to make a simple thing to start off. 
//I want two canvas contexts to be used one that we'll use for the 
//current prediction
var lastPt,
canvas,
context=(canvas=document.querySelector("canvas")).getContext("2d");
function mousedown(e){lastPt ={x:e.pageX,y:e.pageY};}
function mousemove(e){if (lastPt){var curr = {x:e.pageX,y:e.pageY};draw(lastPt, curr);lastPt = curr;}}
function mouseup(e){mousemove(e);lastPt=null;}
function draw(pt1,pt2){ pt2 = pt2 || pt1; context.strokeStyle = "#000000"; context.lineJoin = "round"; context.lineWidth = 5; context.beginPath(); context.moveTo(pt1.x, pt1.y); context.lineTo(pt2.x, pt2.y); context.closePath(); context.stroke(); }
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


document.getElementById("play").addEventListener("click", function (){
    //create a synth and connect it to the master output (your speakers)
    var voice1 = new Tone.Synth().toMaster()
    var voice2 = new Tone.Synth().toMaster()
    

    //play a middle 'C' for the duration of an 8th note
    voice1.triggerAttackRelease('C3', '1m', "+0");
    voice2.triggerAttackRelease('C4', '4n', "+0");
    voice2.triggerAttackRelease('B3', '4n', "+0:1:0");
    voice2.triggerAttackRelease('C4', '4n', "+0:2:0");
    voice2.triggerAttackRelease('D4', '4n', "+0:3:0");
    voice2.triggerAttackRelease('D4', '1m', "+0:4:0");
    voice1.triggerAttackRelease('G3', '1m', "+0:4:0");
});
