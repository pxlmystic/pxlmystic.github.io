"use strict";
var Pico8Color;
(function (Pico8Color) {
    Pico8Color["Black"] = "0:0:0";
    Pico8Color["DarkBlue"] = "29:43:83";
    Pico8Color["DarkPurple"] = "126:37:83";
    Pico8Color["DarkGreen"] = "0:135:81";
    Pico8Color["Brown"] = "171:82:54";
    Pico8Color["DarkGrey"] = "95:87:79";
    Pico8Color["LightGrey"] = "194:195:199";
    Pico8Color["White"] = "255:241:232";
    Pico8Color["Red"] = "255:0:77";
    Pico8Color["Orange"] = "255:163:0";
    Pico8Color["Yellow"] = "255:236:39";
    Pico8Color["Green"] = "0:228:54";
    Pico8Color["Blue"] = "41:173:255";
    Pico8Color["Lavender"] = "131:118:156";
    Pico8Color["Pink"] = "255:119:168";
    Pico8Color["LightPeach"] = "255:204:170";
    // extended
    Pico8Color["BrownishBlack"] = "41:24:20";
    Pico8Color["DarkerBlue"] = "17:29:53";
    Pico8Color["DarkerPurple"] = "66:33:54";
    Pico8Color["BlueGreen"] = "18:83:89";
    Pico8Color["DarkBrown"] = "116:47:41";
    Pico8Color["DarkerGrey"] = "73:51:59";
    Pico8Color["MediumGrey"] = "162:136:121";
    Pico8Color["LightYellow"] = "243:239:125";
    Pico8Color["DarkRed"] = "190:18:80";
    Pico8Color["DarkOrange"] = "255:108:36";
    Pico8Color["LimeGreen"] = "168:231:46";
    Pico8Color["MediumGreen"] = "0:181:67";
    Pico8Color["TrueBlue"] = "6:90:181";
    Pico8Color["Mauve"] = "117:70:101";
    Pico8Color["DarkPeach"] = "255:110:89";
    Pico8Color["Peach"] = "255:157:129";
})(Pico8Color || (Pico8Color = {}));
const MULTIPLIER = 3;
const GRID_SIZE = 64 * MULTIPLIER;
const TILE_SIZE = { w: 8, h: 8 };
const MAX_FRAMES = 5000;
const SAVE_MODE = false;
const MAX_COLORS = 8;
//const COLORS: Pico8Color[] = [Pico8Color.Black, Pico8Color.White, Pico8Color.DarkGrey];
//const COLORS: Pico8Color[] = Object.values(Pico8Color).sort(() => Math.random() - 0.5);
//const COLORS: Pico8Color[] = [Pico8Color.Black, Pico8Color.White, Pico8Color.Red, Pico8Color.Orange, Pico8Color.Yellow, Pico8Color.Green, Pico8Color.Blue, Pico8Color.Lavender];
//const COLORS: Pico8Color[] = [Pico8Color.Black, Pico8Color.White, Pico8Color.LightGrey, Pico8Color.DarkGrey, Pico8Color.DarkerGrey];
const RAINBOW = [Pico8Color.Black, Pico8Color.Black, Pico8Color.Black, Pico8Color.Black, Pico8Color.Red, Pico8Color.Orange, Pico8Color.Yellow, Pico8Color.Green, Pico8Color.Blue, Pico8Color.Lavender, Pico8Color.Black];
const COLORS = RAINBOW.sort(() => Math.random() - 0.5);
function randomColors() {
    let colors = [];
    while (colors.length < MAX_COLORS) {
        let randomColor = random(COLORS);
        if (!colors.find(el => el === randomColor)) {
            colors.push(randomColor);
        }
    }
    return colors;
}
function rgbColor(c) {
    let rgb = c.split(":").map(x => parseInt(x));
    return color(rgb[0], rgb[1], rgb[2]);
}
class Tile {
    constructor(tileSize, colors, pixelSize, row, col, pixels) {
        this.tileSize = tileSize;
        this.colors = colors;
        this.pixelSize = pixelSize;
        this.row = row;
        this.col = col;
        this.pixels = !pixels ? this.randomPixels() : pixels;
    }
    flipHorizontal() {
        let flipped = [];
        for (var x = 0; x < this.pixels.length; x++) {
            let y = this.pixels[x];
            flipped.push(y.reverse());
        }
        this.pixels = flipped;
        return flipped;
    }
    flipVertical() {
        let flipped = [];
        for (var i = this.pixels.length - 1; i >= 0; i--) {
            flipped.push(this.pixels[i]);
        }
        this.pixels = flipped;
        return flipped;
    }
    flipAndRotateRight() {
        let flipped = [];
        for (var y = 0; y < this.pixels.length; y++) {
            for (var x = 0; x < this.pixels.length; x++) {
                if (!flipped[y]) {
                    flipped[y] = [];
                }
                flipped[y].push(this.pixels[y][x]);
            }
        }
        this.pixels = flipped;
        return flipped;
    }
    randomColor(mean, std) {
        //return random(this.colors);
        let baseColors = this.colors;
        //std = Math.floor(random(2, 8));
        let randomIndex = Math.floor(randomGaussian(mean, std));
        randomIndex = constrain(randomIndex, 0, baseColors.length - 1);
        console.log(`mean: ${mean}, std: ${std}, index: ${randomIndex}`);
        let randomColor = baseColors[randomIndex];
        return randomColor;
    }
    randomPixels() {
        let pixels = [];
        let randomMean = Math.floor(this.colors.length / 2);
        //let std = Math.floor(random(6, (this.colors.length / 2) + 6));
        let std = Math.floor(random(2, this.colors.length));
        for (var row = 0; row < this.tileSize.h; row++) {
            let rowPixels = [];
            for (var col = 0; col < this.tileSize.w; col++) {
                let randomColor = this.randomColor(randomMean, std);
                rowPixels.push(randomColor);
            }
            pixels.push(rowPixels);
        }
        return pixels;
    }
    copyPixels() {
        return this.pixels.map(p => p.slice());
    }
    draw() {
        let startX = this.row * this.tileSize.w * this.pixelSize;
        let startY = this.col * this.tileSize.h * this.pixelSize;
        for (var col = 0; col < this.tileSize.w; col++) {
            for (var row = 0; row < this.tileSize.h; row++) {
                let color = rgbColor(this.pixels[row][col]);
                fill(color);
                rect(startX + col * this.pixelSize, startY + row * this.pixelSize, this.pixelSize, this.pixelSize);
            }
        }
    }
}
var tiles = [];
var capturer;
var captureSaved = false;
function setup() {
    console.log('setup');
    let canvas = createCanvas(576, 576);
    canvas.parent("canvasContainer");
    pixelDensity(2);
    colorMode(RGB);
    noStroke();
    if (!SAVE_MODE) {
        noLoop();
        setupTiles();
    }
    else {
        console.log('save mode on');
        capturer = new CCapture({
            format: 'png',
            name: "sketch",
            verbose: true
        });
    }
}
function trippyTransform(tile, row, col) {
    if ((row + 1) % 2 === 0) {
        tile.flipHorizontal();
    }
    if ((col + 1) % 2 === 0) {
        tile.flipAndRotateRight();
    }
}
function trippyTransform2(tile, row, col) {
    if ((row + 1) % 2 === 0) {
        tile.flipVertical();
    }
    if ((col + 1) % 2 === 0) {
        tile.flipAndRotateRight();
    }
}
function mirrorTransform(tile, row, col) {
    if ((row + 1) % 2 === 0) {
        tile.flipVertical();
    }
    if ((col + 1) % 2 === 0) {
        tile.flipHorizontal();
    }
}
function mirrorTransformInverted(tile, row, col) {
    if ((row + 1) % 2 === 0) {
        tile.flipHorizontal();
    }
    if ((col + 1) % 2 === 0) {
        tile.flipVertical();
    }
}
function randomTransformMirror(tile, row, col, rowRotations, colRotations) {
    if ((row + 1) % 2 === 0) {
        for (var i = 0; i < rowRotations; i++) {
            tile.flipVertical();
        }
    }
    if ((col + 1) % 2 === 0) {
        for (var i = 0; i < colRotations; i++) {
            tile.flipHorizontal();
        }
    }
}
function randomTransformTrippy(tile, row, col, rowRotations, colRotations) {
    if ((row + 1) % 2 === 0) {
        for (var i = 0; i < rowRotations; i++) {
            tile.flipHorizontal();
        }
    }
    if ((col + 1) % 2 === 0) {
        for (var i = 0; i < colRotations; i++) {
            tile.flipAndRotateRight();
        }
    }
}
function setupTiles() {
    tiles = [];
    let pixelSize = width / GRID_SIZE;
    let tileSize = {
        w: random([8, 16, 32]) * MULTIPLIER,
        h: random([8, 16, 32]) * MULTIPLIER
    };
    //tileSize = TILE_SIZE;
    console.log(`w: ${tileSize.w}, h: ${tileSize.h}`);
    let numTilesCol = GRID_SIZE / tileSize.w;
    let numTilesRow = GRID_SIZE / tileSize.h;
    let rowRotations = random(1, 4);
    let colRotations = random(1, 4);
    //numTilesCol = 2;
    //numTilesRow = 2;
    let colors = COLORS.sort(() => Math.random() - 0.5);
    for (var col = 0; col < numTilesCol; col++) {
        for (var row = 0; row < numTilesRow; row++) {
            let pixels = tiles.length > 0 ? tiles[0].copyPixels() : undefined;
            let tile = new Tile(tileSize, colors, pixelSize, col, row, pixels);
            mirrorTransform(tile, row, col);
            //mirrorTransformInverted(tile, row, col);
            //randomTransformMirror(tile, row, col, rowRotations, colRotations);
            //trippyTransform(tile, row, col);
            tiles.push(tile);
        }
    }
}
function draw() {
    if (SAVE_MODE) {
        if (captureSaved) {
            return;
        }
        if (frameCount === 1) {
            capturer.start();
        }
        else if (frameCount > MAX_FRAMES) {
            capturer.stop();
            capturer.save();
            captureSaved = true;
            return;
        }
        setupTiles();
    }
    background(rgbColor(Pico8Color.Green));
    for (var tile of tiles) {
        tile.draw();
    }
    if (SAVE_MODE) {
        let canvas = document.getElementById('defaultCanvas0');
        capturer.capture(canvas);
    }
}

function doubleClicked() {
    saveCanvas('mystic-mirror-' + Date.now(), 'png');
}
