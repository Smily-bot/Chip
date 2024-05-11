var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var left = false;
var right = false;
var up = false;
var down = false;
var space = false;
function sound(src, loop) 
{
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.loop = loop;
    document.body.appendChild(this.sound);
    this.play = function()
	{
		this.sound.play();
    }
    this.stop = function()
	{
        this.sound.pause();
    }
	this.begin = function()
	{
		this.sound.currentTime = 0;
		this.play();
	}
}
function intersectRect(r1l, r1u, r1r, r1d, r2l, r2u, r2r, r2d)
{
	return !(r2l > r1r || r2r < r1l || r2u > r1d || r2d < r1u);
}
window.onload = function()
{
    var fps = 60;
	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	setInterval( gameloop, 1000 / fps);
}
function keydown(evt)
{
    //console.log(evt.keyCode);
	
	switch(evt.keyCode)
	{
		case 38: space = true; break;
	    case 37: left = true; break;
		case 38: up = true; break;
		case 39: right = true; break;
		case 40: down = true; break;
	}
}

function keyup(evt)
{
    //console.log(evt.keyCode);
	
	switch(evt.keyCode)
	{
		case 38: space = false; break;
	    case 37: left = false; break;
		case 38: up = false; break;
		case 39: right = false; break;
		case 40: down = false; break;
	}
}

function sprite(src){
this.sprite = document.createElement("img");
this.sprite.src = src;
this.x = 0;
this.y = 0;
this.draw = function(sx, sy){

this.x = sx;
this.y = sy;
ctx.drawImage(this.sprite, sx, sy);

//this.sprite.style.transform = "scaleX(1)";
}
}
function asprite(src){
this.asprite = document.createElement("img");
this.asprite.src = src;
this.framedraw = function(sx, sy, sw, sh, frame, anim){

ctx.drawImage(this.asprite, anim[frame-1].cx, anim[frame-1].cy, anim[frame-1].cw, anim[frame-1].ch, sx, sy, sw, sh);
//this.sprite.style.transform = "scaleX(1)";
}
this.framedrawdir = function(sx, sy, sw, sh, frame, anim, dir){

  // scaleX by -1; this "trick" flips horizontally
ctx.save();
ctx.scale(-1, 1);
ctx.drawImage(this.asprite, anim[frame-1].cx, anim[frame-1].cy, anim[frame-1].cw, anim[frame-1].ch, -sx-(sw/2), sy, sw, sh);
ctx.restore();

}
}
function colide_with_sprite(x,y,o2){
if(x > (o2.x) && x < (o2.x + (o2.sprite.width/2)) && y > o2.y && y < (o2.y + (o2.sprite.height/2))){
return true;
}else{
return false;
}
}