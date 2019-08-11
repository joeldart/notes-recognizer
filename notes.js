let net;
//const classifier = knnClassifier.create();
const classes = ['Whole note', 'Half Note', 'Quarter Note', "Eighth Note", "Whole Rest", "Half Rest", "Sharp", "Flat"];
const classifier = new deepNetworkClassifier(classes.length);
var snippedLayer = "conv_preds";//"conv_pw_13_relu";//"conv_preds";
var hasClassified = false;
var training = false;
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
    lastPt = null;
}

function initCanvas()
{
  canvas.addEventListener("mousedown",mousedown,false);
  canvas.addEventListener("mousemove",mousemove,false);
  canvas.addEventListener("mouseup",mouseup,false);
}

async function sleep(timeout) {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, timeout);
  });
}

  async function app() {
    // Load the model.
    document.getElementById('console').innerText = "loading...";
    net = await mobilenet.load();
    document.getElementById('console').innerText = "";
    


  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    if (training) { 
      document.getElementById('console').innerText = "training... try in a moment";
      return;
    }
    tf.tidy(()=>{
      // Get the intermediate activation of MobileNet 'conv_preds' and pass that
      // to the KNN classifier.
      const activation = net.infer(canvas, snippedLayer);

      // Pass the intermediate activation to the classifier.
      classifier.addExample(activation, classId);
      hasClassified = false;
      document.getElementById('console').innerText = "";
    });
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));
  document.getElementById('class-e').addEventListener('click', () => addExample(4));
  document.getElementById('class-f').addEventListener('click', () => addExample(5));
  document.getElementById('class-g').addEventListener('click', () => addExample(6));
  document.getElementById('class-h').addEventListener('click', () => addExample(7));
    
  while (true) {
    if (classifier.getNumClasses() > 0) {
      if (!hasClassified){
        training = true;
        await classifier.train(classes.length);
        training = false;
        hasClassified = true;
      }
      try
      {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(canvas, snippedLayer);
        
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);
/*
    <button id="class-a">Add Whole Note</button>
    <button id="class-b">Add Half Note</button>
    <button id="class-c">Add Quarter Note</button>
    <button id="class-d">Add Eighth Note</button>
    <button id="class-e">Add Whole Rest</button>
    <button id="class-f">Add Half Rest</button>
    <button id="class-g">Add Sharp</button>
    <button id="class-g">Add Flat</button>
    */
        document.getElementById('console').innerText = `
          prediction: ${classes[result.classIndex]}\n
          probability: ${result.confidences[result.classIndex]}
        `;
        activation.dispose();
        
      }catch(err){
        console.log(err);
      }
    }
    try
    {
      await sleep(500);//okay we dont need to get it every stinkin frame
      await tf.nextFrame();
    }catch(err){
      console.log(err);
    }
  }
}  

app();
