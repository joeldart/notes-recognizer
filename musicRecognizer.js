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

import classificationCombiner from '/classificationCombiner.js';


function MusicRecognizer () {
    var musicRecognizer = this;

    var drawing = new DrawOnCanvas();
    musicRecognizer.beatPerMeasure = 4;
    musicRecognizer.drawing = drawing;
    var predictCanvas = document.createElement("CANVAS");
    predictCanvas.style.width = "224px";
    predictCanvas.style.height = "224px";
    var predictDrawer = new DrawCanvas(predictCanvas);
    musicRecognizer.predictCanvas = predictCanvas;
    musicRecognizer.predictDrawer = predictDrawer;
    var classifier = new Classifier();
    musicRecognizer.classifier = classifier;
    musicRecognizer.classifiedObjects = [];
    musicRecognizer.musicalObjects = [];

    musicRecognizer.onClassify = function(classification){
        //algorithm here: 
        //determine if this classification is a new musicalObject or belongs to an existing musicalObject
        //  todo: create heuristic for sorting current/new
        var dimensionSet = musicRecognizer.getDimensionSet(classification);
        var toCombineObj = classificationCombiner.getBestObjectToCombine(classification, musicRecognizer.musicalObjects, dimensionSet);
        var classifications = [classification];//i dunno i just kinda feel like this data structure is wrong        
        var newObject = {
            objectName: musicRecognizer.objectNameFromClassification(classification),
            pitch: musicRecognizer.pitchFromClassification(classification),
            measure: musicRecognizer.measureFromClassification(classification),
            startBeat: musicRecognizer.startBeatFromClassification(classification.classification, dimensionSet),
            classifications: classifications,
            dimensionSet: dimensionSet
        };
        if (!toCombineObj){
            classification.musicalObjects.push(newObject);
            musicRecognizer.musicalObjects.push(newObject);
        } else {
            //look up the existing musicalObject
            //and re-classify according to the new classification
            var combinedObject = classificationCombiner.combineObjects(toCombineObj, newObject);
            musicRecognizer.musicalObjects = musicRecognizer.musicalObjects.filter(function(obj){
                return obj != toCombineObj;
            });
            combinedObject.startBeat = musicRecognizer.startBeatFromClassification(combinedObject.objectName, combinedObject.dimensionSet);            
            musicRecognizer.musicalObjects.push(combinedObject);
            //now go through and reset all the measure offsets so far
        }
    };
    musicRecognizer.onReclassify = function(classification){

    };

    musicRecognizer.objectNameFromClassification = function (classification){
        return classification.classification;
    };

    musicRecognizer.classificationIsNoteHead = function (name){
        return "wholeNote" || "noteHead";
    };

    musicRecognizer.getDimensionSet = function (classification){
        var strokes = classification.stroke;
        var top = strokes.reduce(function (prev, curr){
            return Math.min(prev, curr.y);
        }, 255);
        var bottom = strokes.reduce(function (prev, curr){
            return Math.max(prev, curr.y);
        }, 0);
        var left = strokes.reduce(function (prev, curr){
            return Math.min(prev, curr.x);
        }, 255);
        var right = strokes.reduce(function (prev, curr){
            return Math.max(prev, curr.x);
        }, 0);
        return {
            actual: {
                top: top, 
                bottom: bottom,
                left: left,
                right: right
            },
            note: musicRecognizer.classificationIsNoteHead(classification.classification) ? 
            {
                top: top, 
                bottom: bottom,
                left: left,
                right: right
            }: null    
        };
    };

    musicRecognizer.pitchFromClassification = function (classification){
        //find dimensions of classifications
        //note: we need to skip some classifications for this consideration 
        //such as noteStem as their dimensions only impact the duration and
        //not the pitch
        var pitchNum;
        var strokes = classification.stroke;
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

    musicRecognizer.measureFromClassification = function (classification){
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

    musicRecognizer.startBeatFromClassification = function (name, dimensionSet){
        //need to make a sane heurisitc classification 
        //have to sort notes from left-to-right and compare
        //note: we're goign to continuously be mutating this array. 
        //if that becomes a problem we'll do it somewhere else
        //given this operation has to recalculate every time anything changes
        //(or at least I dont have a good performance optimization in my head yet)
        //it might make sense for us to do this in a single pass just before playing
        //the music itself. but, if we do that, we wont be able to display feedback
        //anywhere about what the predictions currently look like. 
        //note: a future consideration in this algorithm will be sorting out direction
        //of "parts" (note stems up/down) as we dont truly have a startBeat outside the
        //context of which part we are looking at
        //future: we could maybe have an optimization for this if we are establishing 
        //different boundaries 
        if (name === "noteStem") return null;//there's no inherent start beat on these
        if (name === "wholeNote" && musicRecognizer.beatPerMeasure <= 4) return 0;//till we implement 6/4 time, whole notes start on beat 0
        musicRecognizer.musicalObjects.sort(function (a,b){
            return a.dimensionSet.note.left - b.dimensionSet.note.left;
        });
        //new thought: should instead we create a new type of combination
        //called a note cluster in order to add on multiple note heads to the
        //same stem? that would allow this process to be only needing to sort
        //between lines? really either we are doing this or we are categorizing
        //quarter notes that share a common note-stem so yeah, I dunno

        var lastObj;
        for (var i=0; i<musicRecognizer.musicalObjects.length; i++){
            var currObj = musicRecognizer.musicalObjects[i];
            if (currObj.objectName === "sharp" ||
                currObj.objectName === "flat") {
                    continue;
                }
            //check if the currObject is even with us* or 
            //past us and so we have found our 
            //location in the measure
            if (dimensionSet.note.left === currObj.dimensionSet.left || dimensionSet.note.right <= currObj.dimensionSet.note.left ){
                break;
            }
            lastObj = currObj;
        }
        //we have now advanced lastObj till we are past it. 
        //finally, lets return lastObj
        if (!lastObj) return 0;
        return lastObj.startBeat + musicRecognizer.objDuration(lastObj);
    };
    
    musicRecognizer.objDuration = function (obj){
        //currently assuming a 4/4 time signature. might instead move 
        //to startOffset instead of startBeat to avoid semantics
        switch (obj.objectName){
            case "wholeRest":
            case "wholeNote": return 4;
            case "halfRest":
            case "halfNote": return 2;
            case "quarterRest":            
            case "noteHead": //we presume this
            case "quarterNote": return 1;
            case "eighthRest":
            case "eighthNote": return .5;
            case "sixteenthRest":
            case "sixteenthNote": return .4;            
            default: return 0;
        }
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

export default MusicRecognizer;