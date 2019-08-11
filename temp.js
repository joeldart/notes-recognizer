async function sleep(timeout) {
    return new Promise(function(resolve, reject){
      setTimeout(resolve, timeout);
    });
  }

function Classifier(){
    this.classify = async function (img){
        return 0;
    };
}

function App () {
    var app = this;

    var drawing = new DrawOnCanvas();
    var predictCanvas = document.createElement("CANVAS");
    predictCanvas.width = "224px";
    predictCanvas.height = "224px";
    var predictDrawer = new DrawCanvas(predictCanvas);
    var classifier = new Classifier();

    app.classifiedObjects = [];

    app.isNewMusicalObject = function (classification){
        //hardcode right now as if each classification is unique
        return true;
    }

    app.onClassify = function(classification){
        //algorithm here: 
        //determine if this classification is a new musicalObject or belongs to an existing musicalObject
        //  todo: create heuristic for sorting current/new
    };
    app.onReclassify = function(classification){

    };

    app.isNewShape = function (stroke){
        //hardcode currently to assume always a single stroke
        return true;
    };

    app.drawClassifiedObjectToPredictionCanvas = function (classifiedObject){
        predictDrawer.clear();
        var lastPt = null;
        for(var pt of classifiedObject.stroke){
            if (!lastPt){ lastPt = pt;}
            predictDrawer.draw(lastPt, pt);
            lastPt = pt;
        }
    };

    app.classifyLoop = async function(){
        while(true){
            //get and classify as needed
            for(var classifiedObject of app.classifiedObjects){
                if(classifiedObject.classification) continue;
                app.drawClassifiedObjectToPredictionCanvas(classifiedObject);
                classifiedObject.classification = await classifier.classify(predictCanvas);
                app.onClassify(classifiedObject);
            }
            try
            {
                await sleep(500);//okay we dont need to get it every stinkin frame
                await tf.nextFrame();
            }catch(err){
                console.log(err);
            }
        }
    };
    drawing.onStroke = function (stroke){
        //algorithm here: 
        //determine if this stroke is a new shape or belongs to an existing shape
        //  todo: create heuristic for sorting current/new
        if (app.isNewShape(stroke)){
            var classifiedObject = {
                stroke: stroke,
                classification: null
            };
            app.classifiedObjects.push(classifiedObject);
        } else {
            //get the existing classification
            //update the classifiedObject.stroke to include the new stroke
            //reset classifiedObject.classification to null;
        }
        //we then expect this to get put into our classification pipeline
        //which is responsible for identifying shapes 
    };
    return app;
}

var app = new App();
