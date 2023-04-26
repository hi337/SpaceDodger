//components declaration
var mainCharacter;
var borderTop;
var borderBottom;
var borderLeft;
var myScore;
var topScore;
var borderRight;
let border_bullet_arr = []; //array to store all the bullets shot from border
let mainChar_bullet_arr = []; //array to store all the bullets shot from mainChar
let interval = 70; //initial number of miliseconds to wait for next shot, gets incrementaly smaller
let time_before_next_shot = 0; //counts until interval, hits a shot, goes back to zero
//health variable
let health = 3; //health
let chosen_border = ""; //variable denoting the next border to shoot from
let mainCharx = 315; //mainCharx, global for bullet positioning
let mainChary = 200; //mainChary, global for bullet positioning
let border_arr = ["top", "bottom", "left", "right"]; //array of border components
let particles = []; //array for the firework effect after bullet-bullet collision

//function causes one of the borders to shoot a bullet from a random spot on the side facing inwards and at a random degree. They start of slowly shooting, but the interval shrinks to a certain number, until it shoots 4-5 per minuite.
function choose_shooting_border() {
  if (interval > 20) {
    interval -= 1;
  }
  chosen_border = border_arr[Math.floor(Math.random() * border_arr.length)];
}

//function for the firework particles

//mainChar bullet component
function mainChar_bullet_comp(x, y, name, angle, speedX, speedY) {
  this.speedX = speedX;
  this.speedY = speedY;
  this.angle = angle;
  this.name = name;
  this.x = x;
  this.y = y;
  this.width = 12;
  this.height = 24;
  this.image = new Image();
  this.image.src = "./img/mainCharBullet.png";
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

//border shooting bullet component
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
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
  //shooting bullets from the border
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
function component(width, height, x, y) {
  this.width = width;
  this.height = height;
  this.hitBoxWidth = 30;
  this.hitBoxHeight = 40;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.centerX = this.x + 15;
  this.centerY = this.y + 11;
  this.image = north;
  this.facing = "N";
  this.update_direction_facing = function () {
    if (this.speedX > 0) {
      if (this.speedY == 0) {
        this.image = east;
        this.facing = "E";
        this.hitBoxWidth = 40;
        this.hitBoxHeight = 30;
      } else if (this.speedY < 0) {
        this.image = northeast;
        this.facing = "NE";
      } else if (this.speedY > 0) {
        this.image = southeast;
        this.facing = "SE";
      }
    } else if (this.speedX < 0) {
      if (this.speedY == 0) {
        this.image = west;
        this.facing = "W";
        this.hitBoxWidth = 40;
        this.hitBoxHeight = 30;
      } else if (this.speedY < 0) {
        this.image = northwest;
        this.facing = "NW";
      } else if (this.speedY > 0) {
        this.image = southwest;
        this.facing = "SW";
      }
    } else if (this.speedX == 0) {
      if (this.speedY < 0) {
        this.image = north;
        this.facing = "N";
        this.hitBoxWidth = 30;
        this.hitBoxHeight = 40;
      } else if (this.speedY > 0) {
        this.image = south;
        this.facing = "S";
        this.hitBoxWidth = 30;
        this.hitBoxHeight = 40;
      }
    }
  };
  this.update = function () {
    let ctx = myGameArea.context;
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  };
  //changes the position of the component
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    mainCharx = this.x;
    mainChary = this.y;
    this.centerX = this.x + 15;
    this.centerY = this.y + 11;
  };
  //shooting mechanism
  this.shoot = function () {
    let nom = makeid(5);
    if (this.facing == "N") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(this.x + 30, this.y + 10, nom, 0, 0, -5.5)
      );
    } else if (this.facing == "NE") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(
          this.x + 47,
          this.y + 10,
          nom,
          0.785398,
          5.5,
          -5.5
        )
      );
    } else if (this.facing == "E") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(this.x + 30, this.y + 30, nom, 1.5708, 5.5, 0)
      );
    } else if (this.facing == "SE") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(
          this.x + 35,
          this.y + 35,
          nom,
          2.35619,
          5.5,
          5.5
        )
      );
    } else if (this.facing == "S") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(this.x + 30, this.y + 40, nom, 3.14159, 0, 5.5)
      );
    } else if (this.facing == "SW") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(
          this.x + 20,
          this.y + 40,
          nom,
          3.92699,
          -5.5,
          5.5
        )
      );
    } else if (this.facing == "W") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(
          this.x + 15,
          this.y + 30,
          nom,
          4.71239,
          -5.5,
          0
        )
      );
    } else if (this.facing == "NW") {
      mainChar_bullet_arr.push(
        new mainChar_bullet_comp(this.x, this.y, nom, 5.49779, -5.5, -5.5)
      );
    }
    shot_sound.play();
  };
  //collision detection
  this.crashWith = function (otherobj) {
    let myleft = this.centerX;
    let myright = this.centerX + this.hitBoxWidth;
    let mytop = this.centerY;
    let mybottom = this.centerY + this.hitBoxHeight;
    let otherleft = otherobj.x;
    let otherright = otherobj.x + otherobj.width;
    let othertop = otherobj.y;
    let otherbottom = otherobj.y + otherobj.height;
    let crash = true;
    if (
      mybottom <= othertop ||
      mytop >= otherbottom ||
      myright <= otherleft ||
      myleft >= otherright
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
 * @todo fix the shooting mechanism, detect hits with the border_bullets, get new texture.
 */
