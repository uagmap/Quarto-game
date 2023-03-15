//get access to the segment where there will be alert
const alert = document.getElementById("alert");
//after click in any place on the screen the alert will clear
alert.addEventListener("click", () => alert.className = "");


//game piece class
class Piece {
    //class constructor (init)
    constructor(color, density, height, shape) {
        //collect id of all piece properties
        this.id = [color, density, height, shape].join("");
        //collect value of all properties of a piece
        this.color = Piece.valueFromTraitAndNumber("color", color);
        this.height = Piece.valueFromTraitAndNumber("height", height);
        this.shape = Piece.valueFromTraitAndNumber("shape", shape);
        this.density = Piece.valueFromTraitAndNumber("density", density);
        //at the start of the game we don't know where the piece is positioned
        this.x = undefined;
        this.y = undefined;
        //create each piece in a <span> block
        this.element = document.createElement("span");
        //assign class name to each piece
        this.element.className = ["piece", this.color, this.density, this.height, this.shape].join(" ");
    }

    //method that places piece in a specified position
    place(x, y) {
        //get coordinates
        this.x = x;
        this.y = y;
        //add piece coordinates to the piece style through CSS variables
        this.element.style.setProperty("--x", x);
        this.element.style.setProperty("--y", y);
        //make piece inactive
        this.deactivate();
    }

    //method that puts figure on its initial position for game start
    placeInitial(x, y) {
        //place figure by coordinates
        this.place(x, y);
        //set that property in style of a figure
        this.element.style.setProperty("--initial-x", x);
        this.element.style.setProperty("--initial-y", y);
    }

    //method that removes piece from the board
    reset() {
        //remove style properties
        this.element.style.removeProperty("--x");
        this.element.style.removeProperty("--y");
        //clear coordinate values
        this.x = undefined;
        this.y = undefined;
        this.deactivate();
    }

    //method that activates figure
    activate() {
        //
        this.element.classList.add("active");
    }
    
    //method that deactivates figure
    deactivate() {
        //
        this.element.classList.remove("active");
    }

    //static class method
    //this method can be used only within the class but not the class' objects
    static valueFromTraitAndNumber(trait, number) {
        //method  receives piece property name and its value that it is encoded with
        //after that it returns the property value depending on the code 
        if (trait === "color") return number ? "dark" : "light";    //if 1 then return dark
        if (trait === "height") return number ? "tall" : "short";
        if (trait === "shape") return number ? "square" : "round";
        if (trait === "density") return number ? "hollow" : "solid";
    }
}

//game class
class Game {
    //what happens when creating new game object
    constructor() {
        //get access to ssegment with game board
        this.board = document.getElementById("board");
        //draw field
        this.generateMatrix();
        //place pieces before game
        this.generatePieces();
    }

    //method that checks if the game is over
    detectGameOver(color) {
        //template of states that will lead to game over where binary piece properties are converted to deciimal
        const checks = [
            [0, 1, 2, 3],   [4, 5, 6, 7],
            [8, 9, 10, 11], [12, 13, 14, 15],
            [0, 4, 8, 12],  [1, 5, 9, 13],
            [2, 6, 10, 14], [3, 7, 11, 15],
            [0, 5, 10, 15], [12, 9, 6, 3]
        ];
        //piece properties
        const traits = ["color", "density", "height", "shape"];
        //variable to check matches
        const matches = [];
        //iterate through matrix of conditions of game over
        checks.forEach((indexes) => {
            //arrow function that checks if there is four pieces in a row by filtering out the 'undefined'
            const matrixValues = indexes.map((idx) => this.matrix[idx]).filter((v) => v !== undefined);
            //if thats the case then create arrow function that checks for matches with winning conditions
            if (matrixValues.length === 4) {
                traits.forEach((trait, i) => {
                    const distinct = [...new Set(matrixValues.map((str) => str.charAt(i)))];
                    //if there is a match
                    if (distinct.length === 1) {
                        //get number code of winning condition
                        const value = Piece.valueFromTraitAndNumber(trait, parseInt(distinct[0]));
                        //add the found condition to the variable
                        matches.push({ trait, indexes, value });
                    }
                });
            }
        });


        //if number of matches with winning condition is more than zero then show endgame message
        if (matches.length) {
            this.onGameOver(matches, color);
        }
    }


    //method that creates game field
    generateMatrix() {
        //at start the tiles are empty
        this.matrix = [
            undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined,
        ];
        //iterate through cells
        this.matrix.forEach((_, i) => {
            //get coordinates for each tile
            const y = Math.floor(i / 4);
            const x = i % 4;
            //wrap tile in tag <span>
            const tile = document.createElement("span");
            //class for styles
            tile.className = "tile";
            //label tile
            const xLabel = ["A", "B", "C", "D"][x];
            tile.setAttribute("label", `${xLabel}${y + 1}`);
            //tile listener on click event
            tile.addEventListener("click", () => {
                this.onTileClick(x, y);
            });
            //finally, add tile on the board
            this.board.appendChild(tile);
        });
    }

    //method that creates game pieces
    generatePieces() {
        //there is nothing at start
        this.pieces = {};
        //4 properties in each combination
        const pieces = [
            new Piece(0, 0, 0, 0), new Piece(0, 0, 0, 1), new Piece(0, 0, 1, 0), new Piece(0, 0, 1, 1),
            new Piece(0, 1, 0, 0), new Piece(0, 1, 0, 1), new Piece(0, 1, 1, 0), new Piece(0, 1, 1, 1),
            new Piece(1, 0, 0, 0), new Piece(1, 0, 0, 1), new Piece(1, 0, 1, 0), new Piece(1, 0, 1, 1),
            new Piece(1, 1, 0, 0), new Piece(1, 1, 0, 1), new Piece(1, 1, 1, 0), new Piece(1, 1, 1, 1),
          ];
          //iterate through each piece
          pieces.forEach((piece, i) => {
            //move piece from local variable into a method
            this.pieces[piece.id] = piece;
            //process coordinates
            let x, y;
            //position pieces outside of the board before game start
            if (i < 4) {
                x = i;
                y = -1;
            } else if (i < 8) {
                x = 4;
                y = i % 4;
            } else if (i < 12) {
                x = 3 - (i % 4);
                y = 4;
            } else {
                x = -1;
                y = 3 - (i % 4);
            }
            //place piece on its initial position
            piece.placeInitial(x, y);
            //click and double click processors
            piece.element.addEventListener("click", () => this.onPieceClick(piece));
            piece.element.addEventListener("dblclick", () => this.onPieceDblClick(piece));

            this.board.appendChild(piece.element);
          });
    }

    //method that processes win of one of players
    onGameOver(data, color) {
        //capitalize first letter in the word
        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        //show with a delay 100 ms
        setTimeout(() => {
            //get victory traits
            const text = data.map(({ value }) => cap(value)).join(" / ");
            //set alert the same color as victory trait
            alert.style.setProperty("--color", `var(--color-${color}`);
            //add text to the segment and make it active
            alert.innerHTML = `<div>Game Over!<br>${text}</div>`;
            alert.className = "active";
        }, 100);
    }

    //method processor of figure click
    onPieceClick(piece) {
        //if piece was selected before then make it deactive
        if (this.selectedPieceId === piece.id) {
            piece.deactivate();
            this.selectedPieceId = undefined;
        } else {
            //make previous figure inactive
            if (this.selectedPieceId) {
                this.pieces[this.selectedPieceId].deactivate();
            }
            piece.activate();
            this.selectedPieceId = piece.id;
        }
    }
    
    //method processor of figure double click
    onPieceDblClick(piece) {
        //get current piece position
        const idx = piece.y * 4 + piece.x;
        //if piece was on the board then clear the tile
        if (this.matrix[idx] === piece.id) {
            this.matrix[idx] = undefined;
        }
        //return figure on its position
        piece.reset();
        //remove selected
        this.selectedPieceId = undefined;
    }

    //method processor of tile click
    onTileClick(x, y) {
        //if piece was selected before then put it on this tile
        if (this.selectedPieceId) {
            this.placeSelectedPiece(x, y);
        }
    }

    //method that puts piece on a tile
    placeSelectedPiece(x, y) {
        //get piece
        const piece = this.pieces[this.selectedPieceId];
        //get its position code
        const idx = piece.y * 4 + piece.x;
        //if figure was on a tile then mark this tile as empty
        if (this.matrix[idx] === piece.id) {
            this.matrix[idx] = undefined;
        }
        //place piece by needed coordinates
        piece.place(x, y);
        //update game board with information of placed piece
        this.matrix[y * 4 + x] = this.selectedPieceId;
        //make figure inactive
        this.selectedPieceId = undefined;
        //check if the game is over
        this.detectGameOver(piece.color);
    }
}
    

const game = new Game();