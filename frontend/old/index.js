const generateRandomBoard = (width, height) => {
  const board = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    if (i % 2 === 0) {
      row.push(0);
      for (let j = 1; j <= width - 1; j++) {
        const random = Math.round(Math.random());

        row.push(random ? 0 : 1);
        row.push(random);
      }
      row.push(0);
    } else {
      for (let j = 0; j < width; j++) {
        const random = Math.round(Math.random());
        row.push(random);
        row.push(random ? 0 : 1);
      }
    }
    board.push(row);
  }
  return board;
};

let fallenMarbles = 0;
let availableMarbles = 10;
let allBoardStates = [];
let allMarbleStates = [];

let startBoard = generateRandomBoard(4, 4);

const width = startBoard[0].length;

const availableMarbleHolder = document.getElementById("availableMarblesHolder");

const buttonHolder = document.getElementById("buttonHolder");

for (let i = 0; i < width - 2; i++) {
  const button = document.createElement("button");
  button.innerHTML = i + 1;
  button.classList.add("button");
  buttonHolder.appendChild(button);
}

const getSwitches = (startBoard) => {
  const switches = [];
  for (let i = 0; i < startBoard.length; i++) {
    const row = [];

    for (let j = 1; j < startBoard[i].length; j += 2) {
      if ((i + 1) % 2 === 1) {
        if (
          startBoard[i][j] === undefined ||
          startBoard[i][j + 1] === undefined
        ) {
          break;
        }
        if (startBoard[i][j] > 0 && startBoard[i][j + 1] === 0) {
          if (startBoard[i][j] === 1) {
            row.push("left");
          } else if (startBoard[i][j] === 2) {
            row.push("left marble");
          }
        } else if (startBoard[i][j] === 0 && startBoard[i][j + 1] > 0) {
          if (startBoard[i][j + 1] === 1) {
            row.push("right");
          } else if (startBoard[i][j + 1] === 2) {
            row.push("right marble");
          }
        }
      } else {
        if (startBoard[i][j - 1] > 0 && startBoard[i][j] === 0) {
          if (startBoard[i][j - 1] === 1) {
            row.push("left");
          } else if (startBoard[i][j - 1] === 2) {
            row.push("left marble");
          }
        } else if (startBoard[i][j - 1] === 0 && startBoard[i][j] > 0) {
          if (startBoard[i][j] === 1) {
            row.push("right");
          } else if (startBoard[i][j] === 2) {
            row.push("right marble");
          }
        }
      }
    }

    switches.push(row);
  }
  return switches;
};

const holder = document.getElementById("holder");
const fallenMarblesHolder = document.getElementById("fallenMarblesHolder");

const render = (board, marbles) => {
  const switches = getSwitches(board);
  availableMarbleHolder.innerHTML = "";
  holder.innerHTML = "";

  console.log("current marbles", marbles);

  for (let i = 0; i < availableMarbles; i++) {
    const marble = document.createElement("img");
    marble.src = "../assets/marble.gif";
    marble.classList.add("marble");
    availableMarbleHolder.appendChild(marble);
  }

  for (let i = 0; i < switches.length; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.attributes["data-row"] = i;

    if (i % 2 === 0) row.classList.add("displacement");
    for (let j = 0; j < switches[i].length; j++) {
      const currentSwitch = document.createElement("div");

      currentSwitch.innerHTML = `<div class="switch"">
    ${
      switches[i][j] === "left marble"
        ? '<div class="leftMarble"><img class="marble" src="../assets/marble.gif"><img src="../assets/left.gif" /></div>'
        : switches[i][j] === "right marble"
        ? '<div class="rightMarble"><img class="marble" src="../assets/marble.gif"><img src="../assets/right.gif" /></div>'
        : switches[i][j] === "left"
        ? '<img src="../assets/left.gif "/>'
        : '<img src="../assets/right.gif "/>'
    }
  </div>`;
      row.appendChild(currentSwitch);
    }
    if (i % 2 == 0) {
      if (marbles[i] && marbles[i][0] !== undefined) {
        const marble = document.createElement("img");
        marble.src = "../assets/marble.gif";
        marble.classList.add("marble");
        document.querySelector();
      }
      holder.appendChild(row);
    } else {
      holder.appendChild(row);
      if (marbles[i] && marbles[i][0] !== undefined) {
        const marble = document.createElement("img");
        marble.src = "../assets/marble.gif";
        marble.classList.add("marble");
        holder.appendChild(marble);
      }
    }
  }
  fallenMarblesHolder.innerHTML = "";
  for (let i = 0; i < fallenMarbles; i++) {
    const marble = document.createElement("img");
    marble.src = "../assets/marble.gif";
    marble.classList.add("marble");
    fallenMarblesHolder.appendChild(marble);
  }
};

render(startBoard, []);

let currentFrame = 0;

let renderNext = () => {
  if (currentFrame < allBoardStates.length - 1) {
    currentFrame++;
    render(allBoardStates[currentFrame], allMarbleStates[currentFrame]);
  }
};

let renderPrevious = () => {
  if (currentFrame > 0) {
    currentFrame--;
    render(allBoardStates[currentFrame], allMarbleStates[currentFrame]);
  }
};

let renderLast = () => {
  currentFrame = allBoardStates.length - 1;
  render(allBoardStates[currentFrame], allMarbleStates[currentFrame]);
};

const buttons = document.querySelectorAll(".button");

buttons.forEach((button, index) => {
  button.addEventListener("click", async () => {
    console.log("click", index);
    if (!availableMarbles) return;
    availableMarbles--;

    const result = await fetch("http://127.0.0.1:8000/interpret", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marble_throw: index,
        board: allBoardStates.length
          ? allBoardStates[allBoardStates.length - 1]
          : startBoard,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        //currentFrame = data.boards.length - 1;
        //boardToRender = data.boards[currentFrame];
        fallenMarbles += data.marbles_dropped;
        console.log("data", data);

        allBoardStates.push(...data.boards);
        allMarbleStates.push(...data.marbles, [[]]);
        console.log("alles boards", allBoardStates);
        console.log("alles marbles", allMarbleStates);
        //render(boardToRender);
        // for (let i = 1; i <= data.boards.length; i++) {
        //   setTimeout(() => {
        //     console.log("timeout");
        //     currentFrame++;
        //     startBoard = data.boards[currentFrame];
        //     render(startBoard);
        //   }, 1000 * i);
        // }
      });
  });
});
