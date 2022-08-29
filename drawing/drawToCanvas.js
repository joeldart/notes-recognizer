function getDrawToCanvas (context, width, height){
    var draw = {
        context: context,
        draw: function (pt1, pt2){
            pt2 = pt2 || pt1; 
            this.context.strokeStyle = "#000000"; 
            this.context.lineJoin = "round"; 
            this.context.lineWidth = 5; 
            this.context.beginPath(); 
            this.context.moveTo(pt1.x, pt1.y); 
            this.context.lineTo(pt2.x, pt2.y); 
            this.context.closePath(); 
            this.context.stroke();
        },
        clear: function (){
            this.context.clearRect(0, 0, width, height);
            this.context.fillStyle = "white";
            this.context.fillRect(0,0, width, height);        
        },
        staffLines: function (){
            for (var i=0;i<5;i++){
                var y = 20 + i*20;
                this.context.moveTo(0, y);
                this.context.lineTo(240, y);    
                this.context.stroke();
            }        
        }
    };
    return draw;
}