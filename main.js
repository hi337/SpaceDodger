//variables
let minuite,
  score = 0;
let top_score = +window.localStorage.getItem("top_score") || 0;
let acceleration = 0;
let paused = false;
let allow_pause = true;

function endPause() {
  pause = true;
  myGameArea.canvas.style.display = "block";
  document.getElementById("play_screen").style.display = "none";
  startGame();
}

//initialization of the game area and components
function startGame() {
  // document.getElementById("start_screen").style.display = "none";
  myGameArea.start();
  mainCharacter = new component(
    30,
    30,
    "./img/smiley.gif",
    mainCharx,
    mainChary
  );
  borderTop = new border_comp(700, 10, "red", 0, 0, "top");
  borderBottom = new border_comp(700, 10, "red", 0, 390, "bottom");
  borderLeft = new border_comp(10, 393, "red", 0, 10, "left");
  borderRight = new border_comp(10, 393, "red", 690, 10, "right");
  myScore = new text_comp("12px", "Consolas", "black", 200, 40);
  topScore = new text_comp("12px", "Consolas", "black", 310, 40);
  Health = new text_comp("12px", "Consolas", "black", 445, 40);
  pausedText = new text_comp("30px", "Consolas", "black", 310, 200);
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
        if (e.keyCode == 80) {
          if (!paused) {
            paused = true;
          } else {
            paused = false;
          }
        }
        allow_pause = false;
      }
      myGameArea.keys = myGameArea.keys || {};
      myGameArea.keys[e.keyCode] = true;
    });
    window.addEventListener("keyup", function (e) {
      if (e.keyCode == 80) {
        allow_pause = true;
      }
      myGameArea.keys[e.keyCode] = false;
    });
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  stop: function () {
    clearInterval(this.interval);
    window.addEventListener("keydown", function (e) {
      if (e.keyCode == 82) {
        location.reload();
      }
    });
  },
};

//what happens everytime the frame updates
function updateGameArea() {
  //detecting r for reset and p for pause
  if (myGameArea.keys && myGameArea.keys[82]) {
    location.reload();
  }
  if (!paused) {
    if (mainCharacter.crashWith(borderTop)) {
      mainCharacter.y = 355;
    } else if (mainCharacter.crashWith(borderBottom)) {
      mainCharacter.y = 13;
    } else if (mainCharacter.crashWith(borderRight)) {
      mainCharacter.x = 13;
    } else if (mainCharacter.crashWith(borderLeft)) {
      mainCharacter.x = 655;
    }
    myGameArea.clear();
    borderTop.update();
    borderBottom.update();
    borderLeft.update();
    borderRight.update();

    //detecting r for reset and p for pause
    if (myGameArea.keys && myGameArea.keys[82]) {
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

    for (var y = 0; y < bullet_array.length; y++) {
      if (
        bullet_array[y].crashWith(borderBottom) ||
        bullet_array[y].crashWith(borderLeft) ||
        bullet_array[y].crashWith(borderTop) ||
        bullet_array[y].crashWith(borderRight)
      ) {
        delete bullet_array[y];
      } else if (bullet_array[y].crashWith(mainCharacter)) {
        delete bullet_array[y];
        health -= 1;
      }

      bullet_array = bullet_array.filter((item) => item !== undefined);

      bullet_array[y].newPos();
      bullet_array[y].update();
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
      myGameArea.stop();
    }
    Health.text = `HEALTH: ${health}`;
    Health.update();

    //detecting shift to accelerate
    if (myGameArea.keys && myGameArea.keys[16]) {
      acceleration = 3;
    } else {
      acceleration = 0;
    }

    //Moving the character
    mainCharacter.speedX = 0;
    mainCharacter.speedY = 0;

    if (myGameArea.keys && (myGameArea.keys[37] || myGameArea.keys[65])) {
      mainCharacter.speedX = -2 - acceleration;
    }
    if (myGameArea.keys && (myGameArea.keys[39] || myGameArea.keys[68])) {
      mainCharacter.speedX = 2 + acceleration;
    }
    if (myGameArea.keys && (myGameArea.keys[38] || myGameArea.keys[87])) {
      mainCharacter.speedY = -2 - acceleration;
    }
    if (myGameArea.keys && (myGameArea.keys[40] || myGameArea.keys[83])) {
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
