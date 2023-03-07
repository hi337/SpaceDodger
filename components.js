//components declaration
var mainCharacter;
var borderTop;
var borderBottom;
var borderLeft;
var myScore;
var topScore;
var borderRight;
let border_bullet_arr = []; //array to store all the bullets shot from
let mainChar_bullet_arr = [];
let interval = 70; //initial number of miliseconds to wait for next shot, gets incrementaly smaller
let time_before_next_shot = 0; //counts until interval, hits a shot, goes back to zero
//health variable
let health = 3; //health
let chosen_border = ""; //variable denoting the next border to shoot from
let mainCharx = 315; //mainCharx, global for bullet positioning
let mainChary = 200; //mainChary, global for bullet positioning
let border_arr = ["top", "bottom", "left", "right"]; //array of border components

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
  this.image = new Image();
  this.image.src = "./img/fireball.png";
  this.update = function () {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(
      this.image,
      this.width / -2,
      this.height / -2,
      this.width,
      this.height
    );
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
function border_comp(width, height, x, y, name) {
  this.name = name;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.image = new Image();
  if (name == "bottom" || name == "top") {
    this.image.src = "./img/border_bottom.png";
  } else if (name == "left") {
    this.image.src = "./img/border_left.png";
  } else {
    this.image.src = "./img/border_right.png";
  }
  this.update = function () {
    ctx = myGameArea.context;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
      border_bullet_arr.push(
        new bullet_comp(random_int, 20, nom, ang, slope, 1)
      );
    } else if (this.name == "bottom") {
      let random_int = getRandomInt(20, 680);
      let ang = Math.atan(
        Math.abs(mainCharx - random_int) / Math.abs(mainChary - 360)
      );
      let slope = Math.abs(mainChary - 360) / Math.abs(mainCharx - random_int);
      if (mainCharx < random_int) slope = -slope;
      border_bullet_arr.push(
        new bullet_comp(random_int, 360, nom, ang, slope, -1)
      );
    } else if (this.name == "left") {
      let random_int = getRandomInt(20, 370);
      let ang = Math.atan(
        Math.abs(mainCharx - 20) / Math.abs(mainChary - random_int)
      );
      let slope = Math.abs(mainChary - random_int) / Math.abs(mainCharx - 20);
      if (mainChary < random_int) slope = -slope;
      border_bullet_arr.push(
        new bullet_comp(20, random_int, nom, ang, 1, slope)
      );
    } else if (this.name == "right") {
      let random_int = getRandomInt(20, 370);
      let ang = Math.atan(
        Math.abs(mainCharx - 660) / Math.abs(mainChary - random_int)
      );
      let slope = Math.abs(mainChary - random_int) / Math.abs(mainCharx - 660);
      if (mainChary < random_int) slope = -slope;
      border_bullet_arr.push(
        new bullet_comp(660, random_int, nom, ang, -1, slope)
      );
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
function component(width, height, src, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.image = new Image();
  this.image.src = src;
  this.direction_facing = function () {
    if (this.speedX > 0) {
      if (this.speedY == 0) {
        return "E";
      } else if (this.speedY < 0) {
        return "NE";
      } else if (this.speedY > 0) {
        return "SE";
      }
    } else if (this.speedX < 0) {
      if (this.speedY == 0) {
        return "W";
      } else if (this.speedY < 0) {
        return "NW";
      } else if (this.speedY > 0) {
        return "SW";
      }
    } else if (this.speedX == 0) {
      if (this.speedY < 0) {
        return "N";
      } else if (this.speedY > 0) {
        return "S";
      }
    }
  };
  this.update = function () {
    let ctx = myGameArea.context;
    let direction = this.direction_facing();
    if (direction == "E") {
      this.image.src = "./img/ship-E.png";
    } else if (direction == "NE") {
      this.image.src = "./img/ship-NE.png";
    } else if (direction == "SE") {
      this.image.src = "./img/ship-SE.png";
    } else if (direction == "W") {
      this.image.src = "./img/ship-W.png";
    } else if (direction == "NW") {
      this.image.src = "./img/ship-NW.png";
    } else if (direction == "SW") {
      this.image.src = "./img/ship-SW.png";
    } else if (direction == "N") {
      this.image.src = "./img/ship-N.png";
    } else if (direction == "S") {
      this.image.src = "./img/ship-S.png";
    }
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
 * @todo remove all depreciated libraries like requestAnimaitonFrame()
 * @todo make the shaking effect on nuke and not on hit
 * @todo ask gpt how to improve code
 * @todo make maincharacter rotate based on the direction he is facing.
 * @todo change maincharacter's width and height and replace with an image of a spaceship.
 * @todo add textures to the bullet, the background, and the borders.
 * @todo add start screen
 */
