export default {
    getBestObjectToCombine: function (classification, musicalObjects, dimensionSet){
        //its situations like this that I really wonder if it's 
        //not both faster and better to train a classifier.
        //lets start with a hacky heuristic and then compare 
        //performance later!
        if (classification.classification === "noteStem"){
            var combineables = musicalObjects.filter(obj=>[
                "wholeNote",
                "noteHead"
            ].indexOf(obj.objectName) !== -1);
            if(combineables.length === 0) return null;
            //rank in order now
            //of all the places where I feel like i might
            //want learning to help me out, but at the same time
            //we've basically have to run the prediction on each 
            //object in the measure which im skeptical if that
            //would make performance an issue. 
            var distThreshold = 10;//probably determined experimentally
            for(var curr of combineables){
                //we are a noteStem, so pretend we're a straight line
                if (curr.note.left - dimensionSet.actual.left < distThreshold ) {
                    return curr;
                } else if ( curr.note.right - dimensionSet.actual.right < distThreshold){
                    return curr;
                }
                //TODO: additionally check the vertical alignment of the 
                //noteStem
            }
            return bestObj;
        } else if (classification.classification === "sharp"){
            return null;//somewhat presumes
        } else if (classification.classification === "flat"){
            return null;
        }
        //hardcode right now as if each classification is unique
        //of course in reality that's not the case. some classifications are indeed terminal. 
        //such as # or b but most such as whole-note are easily transformed into half-note with
        //the addition of an adjascent note-stem classification
        //probably the most relevant work, then will be creating an isAdjascent
        //heuristic that performs well-enough to attach related classifications 
    },
    combineObjects : function (obj1, obj2){
        //wholeNote + noteHead
        if ([obj1, obj2].every(o=>o.objectName === "wholeNote" || o.objectName === "noteStem")) {
            return {
                objectName: "halfNote",
                pitch: obj1.pitch || obj2.pitch,
                measure: obj1.measure || obj2.measure || 0,
                startBeat: obj1.startBeat || obj2.startBeat || 0,
                classifications: [obj1, obj2],
                dimensionSet: {
                    note: obj1.dimensionSet.note || obj2.dimensionSet.note,
                    actual: this.combineActualDimensionSet(obj1.dimensionSet.actual, obj2.dimensionSet.actual)
                }
            };
        } else if ([obj1, obj2].every(o=>o.objectName === "noteHead" || o.objectName === "noteStem")) {
            return {
                objectName: "quarterNote",
                pitch: obj1.pitch || obj2.pitch,
                measure: obj1.measure || obj2.measure || 0,
                startBeat: obj1.startBeat || obj2.startBeat || 0,
                classifications: [obj1, obj2],
                dimensionSet: {
                    note: obj1.dimensionSet.note || obj2.dimensionSet.note,
                    actual: this.combineActualDimensionSet(obj1.dimensionSet.actual, obj2.dimensionSet.actual)
                }
            };
        }
        return null;        
    },
    combineActualDimensionSet: function (dim1, dim2){
        var dims = [dim1, dim2];
        var top = dims.reduce(function (prev, curr){
            return Math.min(prev, curr.top);
        }, 255);
        var bottom = dims.reduce(function (prev, curr){
            return Math.max(prev, curr.bottom);
        }, 0);
        var left = dims.reduce(function (prev, curr){
            return Math.min(prev, curr.left);
        }, 255);
        var right = dims.reduce(function (prev, curr){
            return Math.max(prev, curr.right);
        }, 0);
        return {
            top: top, 
            bottom: bottom,
            left: left,
            right: right
        };
    }
};