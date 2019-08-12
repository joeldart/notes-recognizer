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
    }
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