let spaces = document.querySelectorAll(".space");
let unopenSpaces = document.querySelectorAll(".unopen");
let rows = document.querySelectorAll(".rows");
let score = document.getElementById("score");

let mark = "&#128681;"; // ??
let bomb = "&#128163;"; // ??

function loadScore()
{
    score.innerHTML = localStorage.getItem("score");
    if (score.innerHTML == null)
    {
        score.innerHTML = "0";
        localStorage.setItem("score", 0);
    }
}

loadScore();

function randomMineAssign(amount) {
    let unopenSpacesCopy = [...unopenSpaces]; // Create a copy of unopenSpaces
    let placedMines = []; // Keep track of placed mines

    for (let i = 0; i < amount; i++) {
        if (unopenSpacesCopy.length === 0) break; // Break if there are no more available spaces

        let randomNum = Math.floor(Math.random() * unopenSpacesCopy.length);
        let randomSpace = unopenSpacesCopy[randomNum];

        // Check if this space already has a mine
        if (!randomSpace.classList.contains("mine")) {
            randomSpace.classList.add("mine");
            placedMines.push(randomSpace);
        }

        unopenSpacesCopy.splice(randomNum, 1); // Remove the chosen space from the copy
    }
}


randomMineAssign(10);

// Define a function to get the single-digit class from an element
Element.prototype.getSingleDigitClass = function() {
    // Get the list of classes on the element
    const classes = this.classList;
  
    // Iterate through the classes to find the single-digit class
    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      // Check if the class is a single digit (0-8)
      if (/^[0-8]$/.test(cls)) {
        return cls;
      }
    }
    // Return null if no single-digit class is found
    return null;
  };

function calculateSpacesValue() {
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].childElementCount; j++) {
            if (rows[i].children[j].classList.contains("mine")) {
                continue;
            }
            
            let mineCount = 0;

            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;

                    const newRow = i + x;
                    const newCol = j + y;

                    if (
                        newRow >= 0 && newRow < rows.length &&
                        newCol >= 0 && newCol < rows[newRow].childElementCount &&
                        rows[newRow].children[newCol].classList.contains("mine")
                    ) {
                        mineCount++;
                    }
                }
            }

            if (rows[i].children[j].getSingleDigitClass() !== null)
            {
                rows[i].children[j].classList.remove(rows[i].children[j].getSingleDigitClass());
            }
            rows[i].children[j].classList.add(mineCount);
        }
    }
}

calculateSpacesValue();

function revealAllSpaces()
{
    spaces.forEach(space => {
        space.classList.remove("unopen");
        space.classList.add("open")
        space.innerHTML = !space.classList.contains("0") ? space.getSingleDigitClass() : "";
        if (space.classList.contains("mine"))
        {
            space.innerHTML = bomb;
        }else if (space.classList.contains("0"))
        {
            space.innerHTML = "";
        } else {
            space.innerHTML = space.getSingleDigitClass();
        }
    })
}

function revealZeros(startingSpace) {
    // Get the row and column index of the starting space
    const rowIndex = Array.from(startingSpace.parentNode.children).indexOf(startingSpace);
    const columnIndex = Array.from(startingSpace.parentNode.parentNode.children).indexOf(startingSpace.parentNode);

    // Define a function to reveal an empty cell and its neighbors
    function revealEmptyCell(row, col) {
        const cell = rows[col].children[row];

        if (cell.classList.contains("0") && cell.classList.contains("unopen")) {
            cell.classList.remove("unopen");
            cell.classList.add("open");
            cell.innerHTML = "";

            // Get the neighboring cells
            const neighbors = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

            for (const [dRow, dCol] of neighbors) {
                const newRow = row + dRow;
                const newCol = col + dCol;
                if (newRow >= 0 && newRow < rows[0].childElementCount &&
                    newCol >= 0 && newCol < rows.length) {
                    revealEmptyCell(newRow, newCol);
                }
            }
        } else if (cell.classList.contains("unopen")) {
            // If the cell is already open and not a mine, reveal its value
            console.log(cell);
            const digitClass = cell.getSingleDigitClass();
            cell.innerHTML = digitClass === 0 ? "" : digitClass;
            cell.classList.remove("unopen");
            cell.classList.add("open");
        }
    }

    revealEmptyCell(rowIndex, columnIndex);
}

function restartGame()
{
    for (let i=0; i<spaces.length; i++)
    {
        spaces[i].className = "space unopen";
        spaces[i].innerHTML = "";
    }
    randomMineAssign(10);
    calculateSpacesValue();
    firstclick = true;
}

// if all spaces which have class unopen also have class bomb then win
function checkforWin()
{
    let win = true;
    for (let i=0; i<spaces.length; i++)
    {
        if (spaces[i].classList.contains("unopen") && !spaces[i].classList.contains("mine"))
        {
            win = false;
            break;
        }
    }
    if (win)
    {
        setTimeout(function() {
            score.innerHTML = Number(score.innerHTML)+1;
            localStorage.setItem("score", Number(score.innerHTML));
            alert("You Win!");
            restartGame();
        }, 300);
        
    }
}

let firstclick = true;

// Add a click event listener to each space element
spaces.forEach(space => {
    space.addEventListener("click", function() {
        if (space.classList.contains("click-not-allowed"))
        {
            return;
        }
        if (firstclick)
        {
            firstclick = false;
            if (space.classList.contains("mine"))
            {
                randomNum = Math.floor(Math.random() * spaces.length);
                while (spaces[randomNum].classList.contains("mine") || spaces[randomNum] === space)
                {
                    randomNum = Math.floor(Math.random() * spaces.length);
                }
                console.log("Moved to " + randomNum)
                spaces[randomNum].className = "unopen space mine";
                spaces[randomNum].innerHTML = "";
                space.classList.remove("mine");
                calculateSpacesValue();
            }
        }
        // Perform your logic here when a space element is clicked
        // For example, you can check if it contains a mine and update the UI accordingly
        if (space.classList.contains("mine")) {
            // Handle the case when a mine is clicked
            revealAllSpaces();
            // Use setTimeout to delay the alert
            setTimeout(function() {
                alert("Game Over!");
            }, 300);
            setTimeout(function() {
                restartGame();
            }, 300);
        } else {
            // Handle the case when a safe space is clicked
            if (space.classList.contains("0"))
            {
                revealZeros(space);
            }
            space.classList.remove("unopen")
            space.classList.add("open")
            space.innerHTML = !space.classList.contains("0") ? space.getSingleDigitClass() : "";
            checkforWin();
        }
    });
    space.addEventListener("contextmenu", function() {
        if (space.classList.contains("open"))
        {
            return;
        }
        
        if ("&#" + space.innerHTML.codePointAt(0) + ";" != mark) {
            space.innerHTML = mark;
            space.classList.add("click-not-allowed");
        } else {
            space.innerHTML = "";
            space.classList.remove("click-not-allowed");
        }
        event.preventDefault();
    })
});
