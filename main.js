//variables
let minuite,
  score = 0;
let top_score = +window.localStorage.getItem("top_score") || 0;
let acceleration = 0;
let paused = false;
let allow_pause = true;
let shake_frame_count = 0;
let shot = false;

function endPause() {
  pause = true;
  myGameArea.canvas.style.display = "block";
  document.getElementById("play_screen").style.display = "none";
  startGame();
}

//initialization of the game area and components
function startGame() {
  myGameArea.start();
  mainCharacter = new component(
    60,
    60,
    "./img/ship-N.png",
    mainCharx,
    mainChary
  );
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
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        r: false,
        p: false,
        Shift: false,
      };
      myGameArea.keys[e.key] = true;
    });
    window.addEventListener("keyup", function (e) {
      if (e.key == "p") {
        allow_pause = true;
      }
      myGameArea.keys[e.key] = false;
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

    if (
      myGameArea.keys &&
      (myGameArea.keys["a"] || myGameArea.keys["ArrowLeft"])
    ) {
      mainCharacter.speedX = -2 - acceleration;
    }
    if (
      myGameArea.keys &&
      (myGameArea.keys["d"] || myGameArea.keys["ArrowRight"])
    ) {
      mainCharacter.speedX = 2 + acceleration;
    }
    if (
      myGameArea.keys &&
      (myGameArea.keys["w"] || myGameArea.keys["ArrowUp"])
    ) {
      mainCharacter.speedY = -2 - acceleration;
    }
    if (
      myGameArea.keys &&
      (myGameArea.keys["s"] || myGameArea.keys["ArrowDown"])
    ) {
      mainCharacter.speedY = 2 + acceleration;
    }
    mainCharacter.newPos();
    mainCharacter.update();
  } else {
    myGameArea.clear();
    pausedText.text = "PAUSED";
    pausedText.update();
  }
}
