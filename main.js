//variables
let minuite,
  score = 0;
let top_score = +window.localStorage.getItem("top_score") || 0;
let acceleration = 0;
let paused = false;
let allow_pause = true;
let shake_frame_count = 0;
let shot = false;
let shot_hold = false;

//preloading images
let east = new Image();
let north = new Image();
let northeast = new Image();
let northwest = new Image();
let south = new Image();
let southeast = new Image();
let southwest = new Image();
let west = new Image();

east.src = "./img/ship-E.png";
north.src = "./img/ship-N.png";
northeast.src = "./img/ship-NE.png";
northwest.src = "./img/ship-NW.png";
south.src = "./img/ship-S.png";
southeast.src = "./img/ship-SE.png";
southwest.src = "./img/ship-SW.png";
west.src = "./img/ship-W.png";

function endPause() {
  pause = true;
  myGameArea.canvas.style.display = "block";
  document.getElementById("play_screen").style.display = "none";
  startGame();
}

//initialization of the game area and components
function startGame() {
  myGameArea.start();
  mainCharacter = new component(60, 60, mainCharx, mainChary);
  borderTop = new border_comp(700, 10, 0, 0, "top");
  borderBottom = new border_comp(700, 10, 0, 390, "bottom");
  borderLeft = new border_comp(10, 393, 0, 10, "left");
  borderRight = new border_comp(10, 393, 690, 10, "right");
  myScore = new text_comp("12px", "Consolas", "white", 200, 40);
  topScore = new text_comp("12px", "Consolas", "white", 310, 40);
  Health = new text_comp("12px", "Consolas", "white", 445, 40);
  pausedText = new text_comp("30px", "Consolas", "white", 310, 200);
  gameOverText = new text_comp("30px", "Consolas", "white", 290, 200);
}

//Where the canvas element is initialized and controlled
var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = 700;
    this.canvas.height = 400;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[10]);
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener("keydown", function (e) {
      if (allow_pause) {
        if (e.key == "p") {
          if (!paused) {
            paused = true;
          } else {
            paused = false;
          }
        }
        allow_pause = false;
      }
      myGameArea.keys = myGameArea.keys || {
        w: false,
        a: false,
        s: false,
        d: false,
        r: false,
        p: false,
        Shift: false,
        " ": false,
      };
      myGameArea.keys[e.key] = true;
    });
    window.addEventListener("keyup", function (e) {
      if (e.key == "p") {
        allow_pause = true;
      } else {
        myGameArea.keys[e.key] = false;
      }
    });
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    clearInterval(this.interval);
    window.addEventListener("keydown", function (e) {
      if (e.key == "r") {
        location.reload();
      }
    });
  },
};

//what happens everytime the frame updates
function updateGameArea() {
  //detecting r for reset
  if (myGameArea.keys && myGameArea.keys["r"]) {
    location.reload();
  }
  if (!paused) {
    if (mainCharacter.crashWith(borderTop)) {
      mainCharacter.y = 330;
    } else if (mainCharacter.crashWith(borderBottom)) {
      mainCharacter.y = 13;
    } else if (mainCharacter.crashWith(borderRight)) {
      mainCharacter.x = 16;
    } else if (mainCharacter.crashWith(borderLeft)) {
      mainCharacter.x = 630;
    }
    myGameArea.clear();
    borderTop.update();
    borderBottom.update();
    borderLeft.update();
    borderRight.update();

    //detecting r for reset and p for pause
    if (myGameArea.keys && myGameArea.keys["r"]) {
      location.reload();
    }

    time_before_next_shot++;

    if (time_before_next_shot >= interval) {
      choose_shooting_border();
      if (chosen_border == "top") {
        borderTop.shoot();
      } else if (chosen_border == "bottom") {
        borderBottom.shoot();
      } else if (chosen_border == "left") {
        borderLeft.shoot();
      } else if (chosen_border == "right") {
        borderRight.shoot();
      }
      time_before_next_shot = 0;

      if (interval > 10) {
        interval -= 0.1;
      }
    }

    //detect when bullets crash with each other
    for (let z = 0; z < mainChar_bullet_arr.length; z++) {
      for (let x = 0; x < border_bullet_arr.length; x++) {
        if (bullet_collision(mainChar_bullet_arr[z], border_bullet_arr[x])) {
          delete mainChar_bullet_arr[z];
          delete border_bullet_arr[x];
        }
      }
    }

    //detect if a border bullet hits a border or mainChar
    for (var y = 0; y < border_bullet_arr.length; y++) {
      if (
        border_bullet_arr[y].crashWith(borderBottom) ||
        border_bullet_arr[y].crashWith(borderLeft) ||
        border_bullet_arr[y].crashWith(borderTop) ||
        border_bullet_arr[y].crashWith(borderRight)
      ) {
        delete border_bullet_arr[y];
      } else if (border_bullet_arr[y].crashWith(mainCharacter)) {
        delete border_bullet_arr[y];
        health -= 1;
        shot = true;
        myGameArea.canvas.classList.add("shake_screen");
      }

      border_bullet_arr = border_bullet_arr.filter(
        (item) => item !== undefined
      );

      border_bullet_arr[y].newPos();
      border_bullet_arr[y].update();
    }

    //detect mainChar bullet hitting border
    for (var z = 0; z < mainChar_bullet_arr.length; z++) {
      if (
        mainChar_bullet_arr[z].crashWith(borderBottom) ||
        mainChar_bullet_arr[z].crashWith(borderTop) ||
        mainChar_bullet_arr[z].crashWith(borderLeft) ||
        mainChar_bullet_arr[z].crashWith(borderRight)
      ) {
        delete mainChar_bullet_arr[z];
      }

      mainChar_bullet_arr = mainChar_bullet_arr.filter(
        (item) => item !== undefined
      );

      mainChar_bullet_arr[z].newPos();
      mainChar_bullet_arr[z].update();
    }

    //processing how long to shake the screen
    if (shot) {
      shake_frame_count += 1;
      if (shake_frame_count > 30) {
        myGameArea.canvas.classList.remove("shake_screen");
        shot = false;
        shake_frame_count = 0;
      }
    }

    // processing the one point per second rule
    if (minuite < 50) {
      minuite++;
    } else {
      minuite = 0;
      score++;
    }
    //changing top_score for efficient instant adjustment
    if (score > top_score) {
      top_score++;
    }
    topScore.text = `TOP SCORE: ${top_score}`;
    topScore.update();

    //changing the text for myScore
    myScore.text = `SCORE: ${score}`;
    myScore.update();
    //update health
    if (health <= 0) {
      window.localStorage.setItem("top_score", top_score);
      if (shot) {
        myGameArea.canvas.classList.add("shake_screen");
        setTimeout(() => {
          myGameArea.canvas.classList.remove("shake_screen");
        }, 1000);
      }
      gameOverText.text = "GAME OVER";
      gameOverText.update();
      myGameArea.stop();
    }
    Health.text = `HEALTH: ${health}`;
    Health.update();

    //detecting shift to accelerate
    if (myGameArea.keys && myGameArea.keys["Shift"]) {
      acceleration = 3;
    } else {
      acceleration = 0;
    }

    //Moving the character
    mainCharacter.speedX = 0;
    mainCharacter.speedY = 0;

    if (myGameArea.keys && myGameArea.keys["a"]) {
      mainCharacter.speedX = -2 - acceleration;
    }
    if (myGameArea.keys && myGameArea.keys["d"]) {
      mainCharacter.speedX = 2 + acceleration;
    }
    if (myGameArea.keys && myGameArea.keys["w"]) {
      mainCharacter.speedY = -2 - acceleration;
    }
    if (myGameArea.keys && myGameArea.keys["s"]) {
      mainCharacter.speedY = 2 + acceleration;
    }

    //initiate a shot from mainChar
    if (myGameArea.keys && myGameArea.keys[" "]) {
      if (!shot_hold) {
        mainCharacter.shoot();
        shot_hold = true;
        console.log("shot");
      }
    } else {
      shot_hold = false;
    }

    mainCharacter.newPos(); //adjust x and y based on inputs
    mainCharacter.update_direction_facing(); //update the direction mainChar faces
    mainCharacter.update(); //draw new mainChar spot
  } else {
    myGameArea.clear();
    pausedText.text = "PAUSED";
    pausedText.update();
  }
}
