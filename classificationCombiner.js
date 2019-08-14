export default {
    getBestObjectToCombine: function (classification, musicalObjects){
        if (classification.classification === "noteStem"){
            var combineables = musicalObjects.filter(obj=>[
                "wholeNote",
                "noteHead"
            ].indexOf(obj.objectName) !== -1);
            if(combineables.length === 0) return null;
            //rank in order now
            //or just return first for now, lolololol
            return combineables[0];
        } else if (classification.classification === "sharp"){
            return null;//somewhat presumes
        } else if (classification.classification === "flat"){
            return null;
        }
    },
    combineObjects : function (obj1, obj2){
        //wholeNote + noteHead
        if ([obj1, obj2].every(o=>o.objectName === "wholeNote" || o.objectName === "noteStem")) {
            return {
                objectName: "halfNote",
                pitch: obj1.pitch || obj2.pitch,
                measure: obj1.measure || obj2.measure,
                startBeat: obj1.startBeat || obj2.startBeat,
                classifications: [obj1, obj2]
            };
        }
        return null;
        
    }
};