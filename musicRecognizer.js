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

function MusicRecognizer () {
    var musicRecognizer = this;

    var drawing = new DrawOnCanvas();
    musicRecognizer.drawing = drawing;
    var predictCanvas = document.createElement("CANVAS");
    predictCanvas.width = "224px";
    predictCanvas.height = "224px";
    var predictDrawer = new DrawCanvas(predictCanvas);
    musicRecognizer.predictCanvas = predictCanvas;
    musicRecognizer.predictDrawer = predictDrawer;
    var classifier = new Classifier();
    musicRecognizer.classifier = classifier;
    musicRecognizer.classifiedObjects = [];
    musicRecognizer.musicalObjects = [];

    musicRecognizer.isNewMusicalObject = function (classification){
        //hardcode right now as if each classification is unique
        //of course in reality that's not the case. some classifications are indeed terminal. 
        //such as # or b but most such as whole-note are easily transformed into half-note with
        //the addition of an adjascent note-stem classification
        //probably the most relevant work, then will be creating an isAdjascent
        //heuristic that performs well-enough to attach related classifications 
        return true;
    }

    musicRecognizer.onClassify = function(classification){
        //algorithm here: 
        //determine if this classification is a new musicalObject or belongs to an existing musicalObject
        //  todo: create heuristic for sorting current/new
        if (musicRecognizer.isNewMusicalObject(classification)){
            var classifications = [classification];
            var newObject = {
                objectName: musicRecognizer.objectNameFromClassifications(classifications),
                pitch: musicRecognizer.pitchFromClassifications(classifications),
                measure: musicRecognizer.measureFromClassifications(classifications),
                startBeat: musicRecognizer.startBeatFromClassifications(classifications),
                classifications: classifications
            };
            classification.musicalObjects.push(newObject);
            musicRecognizer.musicalObjects.push(newObject);
        } else {
            //look up the existing musicalObject
            //and re-classify according to the new classification
        }
    };
    musicRecognizer.onReclassify = function(classification){

    };

    musicRecognizer.objectNameFromClassifications = function (classifications){
        //hardcoded
        return classifications[0].classification;
    };

    musicRecognizer.pitchFromClassifications = function (classifications){
        //find dimensions of classifications
        //note: we need to skip some classifications for this consideration 
        //such as noteStem as their dimensions only impact the duration and
        //not the pitch
        var pitchNum;
        var strokes = classifications.flatMap(c=>c.stroke);
        var top = strokes.reduce(function (prev, curr){
            return Math.min(prev, curr.y);
        }, 255);
        var bottom = strokes.reduce(function (prev, curr){
            return Math.max(prev, curr.y);
        }, 0);

        if (bottom < 20) {
            //hardcoded right now till we get support for additional 
            //staff lines
            return "G5";
        }
        if (top > 20+5*20){
            //hardcoded right now till we get support for addiitonal
            //staff lines
            return "D4";
        }
        //given, we start at 20, then foreach 20 after that, then the line above will be
        /*
        *in the space*
        lineAbove <-- Nth line would be (Y - 20) /20 
        top <-- Nth line would be floor( (Y- 20)/20)
        bottom
        lineBelow <-- (sometimes lineAbvoe + 20)

        OR *on the line*
        lineAbove
        top
        lineInMiddle
        bottom
        lineBelow

        OR *in the space*
        lineAbove
        top
        lineInMiddle
        lineInMiddle
        bottom
        lineBelow
        */
        //gets the N value in the Nth line distinction
        var lineAbove = Math.floor( (top) / 20 );//note we dont offset for the 20 bc that's a known
        var lineBelow = Math.ceil((bottom) / 20);
        //so from the above, with no error-correction, we can write the heuristic
        //that if there are an even number of lines between our top and bottom, 
        //then we are in betweem the lines. And if there are an odd number, 
        //we are definitely on the line.
        //also note that first line is F5. In order to calc that, we
        //should then consider F5 (top line) to be 8*5 + 6.
        //and E4 (bottom line) should be 8*4 + 5
        //the line we are on, then, would effectively be 
        //the number of lines below F5. And such to calculate
        //we subtract the pitches from 8*5 +5
        var topLine = 8*5 +5;
        var onTheLine = (lineBelow - lineAbove) % 2 === 0;
        if (lineBelow - lineAbove > 2){
            pitchNum = topLine - ((lineAbove +1  ) * 2 -1);
        } else if (onTheLine){
            pitchNum = topLine - (lineAbove*2);
        } else {
            pitchNum = topLine - ((lineAbove * 2) - 1);//note: there's a translation between zero-and-one-based we ahve to do
        }
        var octave = Math.floor(pitchNum/8);
        var offset = pitchNum % 8;
        return ["A","B","C","D","E","F","G"][offset]+octave.toString();
    };

    musicRecognizer.measureFromClassifications = function (classifications){
        //some quick thoughts/realizations on this datastructure eventually
        //we probably, from a ui perspectvie, want to have a draggable measure line
        //the just kind of exists. But then some musicalObjects will change the
        //objects in the measure, and some intead will change the measure itself
        //for example: accidentals imapct the pitch of all notes at startBeat onward
        //or, by another example, drawn staff lines change the range of detectable pitches
        //for example, if you only have one line above the staff, then the possible
        //pitch for notes/accidentals are G, A, B. But if there are no lines, only
        //G is possible. 
        //From this perspective, then, we might make the measure a smarter class that
        //will be responsible for calculating the pitch, duration, and startBeat 
        //given the current measure context, the objectName, and the dimensions
        return 0;
    };

    musicRecognizer.startBeatFromClassifications = function (classifications){
        return 0;
    };
    
    musicRecognizer.isNewShape = function (stroke){
        //hardcode currently to assume always a single stroke
        return true;
    };

    musicRecognizer.drawClassifiedObjectToPredictionCanvas = function (classifiedObject){
        predictDrawer.clear();
        var lastPt = null;
        for(var pt of classifiedObject.stroke){
            if (!lastPt){ lastPt = pt;}
            predictDrawer.draw(lastPt, pt);
            lastPt = pt;
        }
    };

    musicRecognizer.classifyLoop = async function(){
        while(true){
            //get and classify as needed
            for(var classifiedObject of musicRecognizer.classifiedObjects){
                if(classifiedObject.classification) continue;
                musicRecognizer.drawClassifiedObjectToPredictionCanvas(classifiedObject);
                classifiedObject.classification = await classifier.classify(predictCanvas);
                musicRecognizer.onClassify(classifiedObject);
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
        if (musicRecognizer.isNewShape(stroke)){
            var classifiedObject = {
                stroke: stroke,
                classification: null
            };
            musicRecognizer.classifiedObjects.push(classifiedObject);
        } else {
            //get the existing classification
            //update the classifiedObject.stroke to include the new stroke
            //reset classifiedObject.classification to null;
        }
        //we then expect this to get put into our classification pipeline
        //which is responsible for identifying shapes 
    };
    return musicRecognizer;
}

