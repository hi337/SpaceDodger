//components
var mainCharacter;
var borderTop;
var borderBottom;
var borderLeft;
var myScore;
var topScore;
var borderRight;
let bullet_array = [];
let interval = 70;
let time_before_next_shot = 0;
let health = 3;
let chosen_border = "";
let mainCharx = 340;
let mainChary = 195;

//array of border components
let border_arr = ["top", "bottom", "left", "right"];

//function causes one of the borders to shoot a bullet from a random spot on the side facing inwards and at a random degree. They start of slowly shooting, but the interval shrinks to a certain number, until it shoots 4-5 per minuite.
function choose_shooting_border() {
  if (interval > 20) {
    interval -= 1;
  }
  chosen_border = border_arr[Math.floor(Math.random() * border_arr.length)];
}

//bullet component. will have a hit
function bullet_comp(x, y, name, angle, speedX, speedY) {
  this.speedX = speedX;
  this.speedY = speedY;
  this.angle = angle;
  this.name = name;
  this.x = x;
  this.y = y;
  this.width = 10;
  this.height = 10;
  this.color = "red";
  this.update = function () {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "red";
    ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
    ctx.restore();
  };
  //changes the position of the component
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
  //collision detection
  this.crashWith = function (otherobj) {
    var myleft = this.x;
    var myright = this.x + this.width;
    var mytop = this.y;
    var mybottom = this.y + this.height;
    var otherleft = otherobj.x;
    var otherright = otherobj.x + otherobj.width;
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + otherobj.height;
    var crash = true;
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      crash = false;
    }
    return crash;
  };
}

//border component, which will be shooting out the flames
function border_comp(width, height, color, x, y, name) {
  this.name = name;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  this.shoot = function () {
    let nom = makeid(5);
    if (this.name == "top") {
      let random_int = getRandomInt(30, 670);
      let ang = Math.atan(
        Math.abs(mainCharx - random_int) / Math.abs(mainChary - 20)
      );
      let slope = (mainChary - 20) / (mainCharx - random_int);
      if (mainCharx < random_int) slope = -slope;
      bullet_array.push(new bullet_comp(random_int, 20, nom, ang, slope, 1));
    } else if (this.name == "bottom") {
      let random_int = getRandomInt(20, 680);
      let ang = Math.atan(
        Math.abs(mainCharx - random_int) / Math.abs(mainChary - 360)
      );
      let slope = Math.abs(mainChary - 360) / Math.abs(mainCharx - random_int);
      if (mainCharx < random_int) slope = -slope;
      bullet_array.push(new bullet_comp(random_int, 360, nom, ang, slope, -1));
    } else if (this.name == "left") {
      let random_int = getRandomInt(20, 370);
      let ang = Math.atan(
        Math.abs(mainCharx - 20) / Math.abs(mainChary - random_int)
      );
      let slope = Math.abs(mainChary - random_int) / Math.abs(mainCharx - 20);
      if (mainChary < random_int) slope = -slope;
      bullet_array.push(new bullet_comp(20, random_int, nom, ang, 1, slope));
    } else if (this.name == "right") {
      let random_int = getRandomInt(20, 370);
      let ang = Math.atan(
        Math.abs(mainCharx - 660) / Math.abs(mainChary - random_int)
      );
      let slope = Math.abs(mainChary - random_int) / Math.abs(mainCharx - 660);
      if (mainChary < random_int) slope = -slope;
      bullet_array.push(new bullet_comp(660, random_int, nom, ang, -1, slope));
    }
  };
}

//Text component for the score and initial screen
function text_comp(size, font, color, x, y) {
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx.font = size + " " + font;
    ctx.fillStyle = color;
    ctx.fillText(this.text, this.x, this.y);
  };
}

//default component for main characters and borders
function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  //changes the position of the component
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    mainCharx = this.x;
    mainChary = this.y;
  };
  //collision detection
  this.crashWith = function (otherobj) {
    var myleft = this.x;
    var myright = this.x + this.width;
    var mytop = this.y;
    var mybottom = this.y + this.height;
    var otherleft = otherobj.x;
    var otherright = otherobj.x + otherobj.width;
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + otherobj.height;
    var crash = true;
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      crash = false;
    }
    return crash;
  };
}

//movements for the mainCharacter
function moveup() {
  mainCharacter.speedY -= 1;
}

function movedown() {
  mainCharacter.speedY += 1;
}

function moveleft() {
  mainCharacter.speedX -= 1;
}

function moveright() {
  mainCharacter.speedX += 1;
}

function stopMove() {
  mainCharacter.speedX = 0;
  mainCharacter.speedY = 0;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * @todo remove all depreciated libraries like e.keyCode and use requestAnimaitonFrame()
 * @todo ask gpt how to improve code
 */
