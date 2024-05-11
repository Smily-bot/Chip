var stateval;
(function (stateval) {
    stateval[stateval["game"] = -1] = "game";
    stateval[stateval["win"] = -2] = "win";
    stateval[stateval["losse"] = -3] = "losse";
	stateval[stateval["menu"] = -4] = "menu";
})(stateval || (stateval = {}));
var x = 100;
var y = 494;
var vspd = 0;
var canJump = false;
var direct = 1;
var pWidth = 30;
var pHeight = 50;
var blink = 0;
var state = -4;
var psframe = 1;
var crouch = false;
var player = new asprite("assets/player.png");
var win = new sprite("assets/winblock.png");
var lose = new sprite("assets/unaliveblock.png");
var jsound = new sound("assets/jump.mp3", 0);
var wsound = new sound("assets/walk.mp3", 0);
var winx = 714;
var winy = 30;
var losex = 450;
var losey = 250;
var youwin = false;
var youlose = false;
var levels = [
    [[300, 450, 100, 100], [600, 250, 50, 350], [250, 250, 250, 100], [110, 205, 50, 20], [0, 550, 800, 50], [300, 100, 485, 50]],
    [[43, 405, 100, 100], [257, 378, 100, 100], [449, 288, 50, 50], [564, 178, 50, 50], [621, 374, 485, 50]],
    [[91,281,260,86,],[445,294,220,89,],[267,489,256,45,],[333,105,10,160,],[383,147,31,39,],[554,148,30,36,]]
];
var playerstart = [
    [100, 494, 714, 30, 450, 250],
    [75, 350, 732, 308, 507, 238],
    [548,242,173,215,365,427]
];
var lvlnum = 0;
var pwlkanim = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
var winnum = 2;
var wall;
var pwdt = [
    {
        'cx': 0, 'cy': 0, 'cw': 28, 'ch': 50
    },
    {
        'cx': 29, 'cy': 0, 'cw': 28, 'ch': 50
    },
    {
        'cx': 56, 'cy': 0, 'cw': 28, 'ch': 50
    },
    {
        'cx': 84, 'cy': 0, 'cw': 28, 'ch': 50
    },
    {
        'cx': 0, 'cy': 51, 'cw': 28, 'ch': 50
    },
    {
        'cx': 29, 'cy': 51, 'cw': 28, 'ch': 50
    },
    {
        'cx': 58, 'cy': 53, 'cw': 28, 'ch': 50
    },
    {
        'cx': 84, 'cy': 51, 'cw': 28, 'ch': 50
    },
    {
        'cx': 3, 'cy': 100, 'cw': 28, 'ch': 50
    },
    {
        'cx': 41, 'cy': 101, 'cw': 28, 'ch': 50
    },
    {
        'cx': 70, 'cy': 100, 'cw': 28, 'ch': 50
    },
];

var rect = {
  x: 300,
  y: 300,
  width: 200,
  height: 100,
};

x = playerstart[lvlnum][0];
y = playerstart[lvlnum][1];
winx = playerstart[lvlnum][2];
winy = playerstart[lvlnum][3];
losex = playerstart[lvlnum][4];
losey = playerstart[lvlnum][5];
function youwinloop() {
    ctx.fillStyle = "#696";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fillText('You Win', 300, 300);
}
function youlosloop() {
    ctx.fillStyle = "#696";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fillText('You Lost', 300, 300);
}
function Playbutton(rect, lWidth, fillColor, lineColor) {
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = 'rgba(225,225,225,0.5)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.closePath();
  ctx.font = '40pt Kremlin Pro Web';
  ctx.fillStyle = '#000000';
  ctx.fillText('Start', rect.x + rect.width / 4, rect.y + 64);
}
function menu(){
	// Binding the click event on the canvas
canvas.addEventListener('click', function(evt) {
  var mousePos = getMousePos(canvas, evt);

  if (isInside(mousePos, rect)) {
    state = stateval.game;
  } else {

  }
}, false);

// Question code
ctx.fillStyle = "#696";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "#000000";
Playbutton(rect);
ctx.fillStyle = "#000000";
ctx.fillText('game', 350, 100);
}
function gameloop() {
    wall = levels[lvlnum];
    switch (state) {
        case stateval.game:
            gameLogic();
			paintScreen();
            break;
        case stateval.losse:
            youlosloop();
            break;
        case stateval.win:
            youwinloop();
            break;
		case stateval.menu:
            menu();
            break;
    }
}
function isColliding(potX, potY) {
    var retVal = false;
    for (var i = 0; i < wall.length; i++) {
        if (intersectRect(potX, potY, potX + pWidth, potY + pHeight, wall[i][0], wall[i][1], wall[i][0] + wall[i][2], wall[i][1] + wall[i][3])) {
            retVal = true;
            break;
        }
    }
    return retVal;
}
function controlLogic() {
    var pSpeed = 3;
    if (crouch)
        pSpeed /= 2;
    else
        pSpeed = 3;
    if (left && !isColliding(x - pSpeed, y))
        x -= pSpeed;
    if (right && !isColliding(x + pSpeed, y))
        x += pSpeed;
    if (space && canJump) {
        jsound.play();
        vspd = -7;
        canJump = false;
    }
    if (!space && vspd < -2) {
        vspd = -2;
    }
    if ((left || right) && isColliding(x, y + 1)) {
        wsound.play();
    }
    if (isColliding(x, y + 1) && down)
        crouch = true;
    else
        crouch = false;
}
function handleGravity() {
    if (crouch)
        canJump = false;
    if (!isColliding(x, y + vspd)) {
        y += vspd;
        vspd += .1;
    }
    else {
        for (var i = vspd; i > 0; i--) {
            if (!isColliding(x, y + i)) {
                y += i;
                break;
            }
        }
        if (isColliding(x, y + 1) && !crouch) {
            canJump = true;
        }
        vspd = 0;
    }
}
function spritelogic() {
    if (vspd < -0.1) {
        psframe = 8;
    }
    else if (vspd > 0.1 && !isColliding(x, y + 1)) {
        psframe = 10;
    }
    else if (left ^ right) {
        psframe = pwlkanim[blink];
    }
    else if (vspd == 0) {
        psframe = 9;
    }
    if (crouch) {
        psframe = 11;
    }
}
function winloselogic() {
    if (colide_with_sprite(x, y, win)) {
        if (lvlnum == winnum) {
            state = stateval.win;
        }
        else {
            x = playerstart[lvlnum + 1][0];
            y = playerstart[lvlnum + 1][1];
            winx = playerstart[lvlnum + 1][2];
            winy = playerstart[lvlnum + 1][3];
            losex = playerstart[lvlnum + 1][4];
            losey = playerstart[lvlnum + 1][5];
            lvlnum++;
        }
    }
    if (colide_with_sprite(x, y, lose)) {
        state = stateval.losse;
    }
}
function gameLogic() {
    if (!youwin && !youlose) {
        blink = (blink + 1);
        if (blink >= 18)
            blink = 0;
        controlLogic();
        handleGravity();
        spritelogic();
    }
    winloselogic();
}
function paintScreen() {
    ctx.fillStyle = "#696";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.fillStyle = "#00F";
    //ctx.fillRect(x, y, pWidth, pHeight);
    //var pimageDraw = pimage;
    win.draw(winx, winy);
    lose.draw(losex, losey);
    if (left)
        direct = 1;
    else if (right)
        direct = -1;
    if (direct == 1) {
        player.framedraw(x, y, 28, 50, psframe, pwdt);
    }
    else if (direct == -1) {
        player.framedrawdir(x, y, 28, 50, psframe, pwdt, 1);
    }
    else {
    }
    ctx.fillStyle = "#000";
    for (var i = 0; i < wall.length; i++) {
        ctx.fillRect(wall[i][0], wall[i][1], wall[i][2], wall[i][3]);
    }
    //console.log(pimageDraw.sprite);
}
// Function to get the mouse position
function getMousePos(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

// Function to check whether a point is inside a rectangle
function isInside(pos, rect) {
  return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}

// The rectangle should have x,y,width,height properties


