import MusicRecognizer from "/musicRecognizer.js";
var tests = 
{ 
    sharp_gets_categorized_as_sharp: function (){
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "sharp",
            stroke: [{x:40,y:41},{x:60,y:59}],
            musicalObjects:[]
        });
        if (rec.musicalObjects.length !== 1)throw new Error("did not add to objects");
        if (rec.musicalObjects[0].objectName !== "sharp" ) throw new Error("did not recognize the sharp");
        if (rec.musicalObjects[0].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Erro("did not place in correct beat"); 
    },
    sharp_spanning_above_and_below_line: function (){
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "sharp",
            //this ones sloppy but it's centered over D4 still
            stroke: [{x:20,y:20},{x:40,y:80}],
            musicalObjects:[]
        });
        if (rec.musicalObjects.length !== 1)throw new Error("did not add to objects");
        if (rec.musicalObjects[0].objectName !== "sharp" ) throw new Error("did not recognize the sharp");
        if (rec.musicalObjects[0].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Erro("did not place in correct beat"); 
    },
    sharp_on_the_line: function (){
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "sharp",
            //this ones sloppy but it's centered over D4 still
            stroke: [{x:20,y:50},{x:40,y:70}],
            musicalObjects:[]
        });
        if (rec.musicalObjects.length !== 1)throw new Error("did not add to objects");
        if (rec.musicalObjects[0].objectName !== "sharp" ) throw new Error("did not recognize the sharp");
        if (rec.musicalObjects[0].pitch !== "B5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Erro("did not place in correct beat"); 
    },
    whole_note_in_space: function () {
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "wholeNote",
            stroke: [{x:40,y:41},{x:60,y:59}],
            musicalObjects:[]
        });
        if (rec.musicalObjects.length !== 1)throw new Error("did not add to objects");
        if (rec.musicalObjects[0].objectName !== "wholeNote" ) throw new Error("did not recognize the wholeNote");
        if (rec.musicalObjects[0].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Erro("did not place in correct beat");         
    },
    whole_note_with_noteStem_gets_reclassified_as_halfNote: function () {
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "wholeNote",
            stroke: [{x:40,y:41},{x:60,y:59}],
            musicalObjects:[]
        });
        rec.onClassify({
            classification: "noteStem",
            stroke: [{x:40, y: 41}, { x: 40, y: 100}],
            musicalObjects: []
        });
        if (rec.musicalObjects.length !== 1)throw new Error("did not reclassify the musical objects");
        if (rec.musicalObjects[0].objectName !== "halfNote" ) throw new Error("did not recognize the halfNote");
        if (rec.musicalObjects[0].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Erro("did not place in correct beat");                 
    },
    two_halfNotes_recognize_the_relative_startBeat: function () {
        var rec = new MusicRecognizer();
        rec.onClassify({
            classification: "wholeNote",
            stroke: [{x:40,y:41},{x:60,y:59}],
            musicalObjects:[]
        });
        rec.onClassify({
            classification: "noteStem",
            stroke: [{x:40, y: 41}, { x: 40, y: 100}],
            musicalObjects: []
        });
        rec.onClassify({
            classification: "wholeNote",
            stroke: [{x:80,y:41},{x:100,y:59}],
            musicalObjects:[]
        });
        rec.onClassify({
            classification: "noteStem",
            stroke: [{x:80, y: 41}, { x: 80, y: 100}],
            musicalObjects: []
        });
        if (rec.musicalObjects.length !== 2)throw new Error("did not reclassify the musical objects");
        if (rec.musicalObjects[0].objectName !== "halfNote" ) throw new Error("did not recognize the halfNote");
        if (rec.musicalObjects[0].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[0].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[0].startBeat !== 0) throw new Error("did not place in correct beat");                 
        if (rec.musicalObjects[1].objectName !== "halfNote" ) throw new Error("did not recognize the halfNote");
        if (rec.musicalObjects[1].pitch !== "C5") throw new Error("did not place pitch correctly");
        if (rec.musicalObjects[1].measure !== 0) throw new Error("did not place in correct measure");
        if (rec.musicalObjects[1].startBeat !== 3) throw new Error("did not place in correct beat");                 
    },
    
};
for(var test of Object.keys(tests)){
    try
    {
        tests[test]();
        console.log("success");
    }
    catch(err){
        console.log(test + ": FAILED");
        console.error(err);
    }
}