///////////////////////////////////////////////////////////////
//                                                           //
//                    CONSTANT STATE                         //

// TODO: DECLARE and INTIALIZE your constants here
var START_TIME = currentTime();

var SHAPES = {circle:0, square:1, triangle:2}
var COLORS = {green:0, purple:1, red:2}
var SHADES = {open:0, solid:1, stripe:2}

var LIGHT_SHADE = 1;
var DARK_SHADE = 0.33;

var BOARD_X = 8;
var BOARD_Y = 6;

var GRID_SIZE = 160;
var GRID_POSITION_X = 320;
var GRID_POSITION_Y = 160;

var SYMBOL_SCALE = 0.8;

var SELECTED_COLOR = makeColor(0,0.75,1);
var GREEN = makeColor(0,0.6,0);
var PURPLE = makeColor(0.4,0,0.6);
var RED = makeColor(1,0,0);
var WHITE = makeColor(0.9,0.9,0.9);

var GAME_STATES = {
    menu:0,
    game:1, 
    end:2,
}

var BUTTONS = {
    right:0,
    left:1, 
    bottom: 2  
}

var RIGHT_BUTTON = {
    x: screenWidth-240,
    y: 560,
    width: 160,
    height: 160
}

var LEFT_BUTTON = {
    x: 80,
    y: 560,
    width: 160,
    height: 160
}

var BOTTOM_BUTTON = {
    x: 720,
    y: screenHeight-130,
    width: 480,
    height: 100
}

var MENU_TRANS = 0.95;
var MENU_FADE_IN_TIME = 1;

// Symbol Images
var GREEN_CIRCLE_OPEN = loadImage("GreenCircleOpen.png");
var GREEN_CIRCLE_SOLID = loadImage("GreenCircleSolid.png");
var GREEN_CIRCLE_STRIPE = loadImage("GreenCircleStripe.png");
var GREEN_SQUARE_OPEN = loadImage("GreenSquareOpen.png");
var GREEN_SQUARE_SOLID = loadImage("GreenSquareSolid.png");
var GREEN_SQUARE_STRIPE = loadImage("GreenSquareStripe.png");
var GREEN_TRIANGLE_OPEN = loadImage("GreenTriangleOpen.png");
var GREEN_TRIANGLE_SOLID = loadImage("GreenTriangleSolid.png");
var GREEN_TRIANGLE_STRIPE = loadImage("GreenTriangleStripe.png");
var PURPLE_CIRCLE_OPEN = loadImage("PurpleCircleOpen.png");
var PURPLE_CIRCLE_SOLID = loadImage("PurpleCircleSolid.png");
var PURPLE_CIRCLE_STRIPE = loadImage("PurpleCircleStripe.png");
var PURPLE_SQUARE_OPEN = loadImage("PurpleSquareOpen.png");
var PURPLE_SQUARE_SOLID = loadImage("PurpleSquareSolid.png");
var PURPLE_SQUARE_STRIPE = loadImage("PurpleSquareStripe.png");
var PURPLE_TRIANGLE_OPEN = loadImage("PurpleTriangleOpen.png");
var PURPLE_TRIANGLE_SOLID = loadImage("PurpleTriangleSolid.png");
var PURPLE_TRIANGLE_STRIPE = loadImage("PurpleTriangleStripe.png");
var RED_CIRCLE_OPEN = loadImage("RedCircleOpen.png");
var RED_CIRCLE_SOLID = loadImage("RedCircleSolid.png");
var RED_CIRCLE_STRIPE = loadImage("RedCircleStripe.png");
var RED_SQUARE_OPEN = loadImage("RedSquareOpen.png");
var RED_SQUARE_SOLID = loadImage("RedSquareSolid.png");
var RED_SQUARE_STRIPE = loadImage("RedSquareStripe.png");
var RED_TRIANGLE_OPEN = loadImage("RedTriangleOpen.png");
var RED_TRIANGLE_SOLID = loadImage("RedTriangleSolid.png");
var RED_TRIANGLE_STRIPE = loadImage("RedTriangleStripe.png");

// Sound Files
var SYMBOL_SELECT = loadSound("WW_PauseMenu_Select.wav");
var SMALL_SUCCESS = loadSound("WW_MainMenu_Select.wav");
var MED_SUCCESS = loadSound("WW_MainMenu_Start.wav");
var LARGE_SUCCESS = loadSound("WW_PressStart.wav");
var TIMES_UP = loadSound("WW_Gong.wav");
var MENU_START = loadSound("WW_MainMenu_CopyErase_Finish.wav");
var BUTTON_SOUND = loadSound("WW_PauseMenu_Save.wav");
var FALL_SOUND = loadSound("WW_Rupee_Bounce.wav");

// Other images
var TIMER_ICON = loadImage("TimerIcon.png");
var REFRESH_ICON = loadImage("RefreshIcon.png");
var BACK_ICON = loadImage("BackArrow.png");
var TITLE_TEXT = loadImage("TitleText.png");

// Animation Stuff
var FALL_SPEED = 30; // pixels per frame

///////////////////////////////////////////////////////////////
//                                                           //
//                     MUTABLE STATE                         //

// TODO: DECLARE your variables here
var gameBoard;

var currentPath;
var previousSymbol;

var State_Machine;

var score;
var best;
var timer;

var fade_timer;
var second_counter;
var next_second;

var MouseX;
var MouseY;

// To prevent the Steve Strat
var new_touch = false;

var example_symbol1 = null;
var example_symbol2 = null;


///////////////////////////////////////////////////////////////
//                                                           //
//                      EVENT RULES                          //

// When setup happens...
function onSetup() {
    // TODO: INITIALIZE your variables here
    gameBoard = makeArray(BOARD_X, BOARD_Y);

    best = 0;
    score = 0;
    timer = 60;

    State_Machine = GAME_STATES.menu;
}

function startGame() {
    score = 0;
    timer = 60;
    fade_timer = 0;
    second_counter = currentTime();
    next_second = second_counter+1;

    createRandomGameBoard();

    currentPath = [];
    previousSymbol = null;

    State_Machine = GAME_STATES.game;
}

function onTouchStart(x,y) {

    if (State_Machine == GAME_STATES.game) {
        new_touch = true;
        processTouch(x,y);
    }
}

function onTouchMove(x,y) {

    if (State_Machine == GAME_STATES.game) {
        if (new_touch) {
            processTouch(x,y);
        }
    }
}

function onTouchEnd(x,y) {

    if (State_Machine == GAME_STATES.game) {
        testButtonPress(BUTTONS.right,x,y);
        testButtonPress(BUTTONS.left,x,y);
        processPath();
    }
    else if (State_Machine == GAME_STATES.end) {
        testButtonPress(BUTTONS.right,x,y);
        testButtonPress(BUTTONS.left,x,y);
    }
    else if (State_Machine == GAME_STATES.menu) {
        testButtonPress(BUTTONS.bottom,x,y);
    }
}

function onMouseMove(x,y) {

    MouseX = x;
    MouseY = y;
}

function processTouch(x,y) {

    grid_coordinates = getGridCoordinates(x,y);

    grid_x = grid_coordinates[0];
    grid_y = grid_coordinates[1];

    // if touch falls on the grid
    if (grid_x != -1 && grid_y != -1) {
        
        symbol = gameBoard[grid_x][grid_y];

        // If first touch
        if (previousSymbol == null) {
            symbol.selected = true;
            previousSymbol = symbol;
            insertFront(currentPath, symbol);
            playSound(SYMBOL_SELECT);
        }

        // If we're on a new tile
        if (symbol != previousSymbol) {    
            if (symbol.selected == true) {
                processPath();
            }
            else if ( !testAdjacent(symbol, previousSymbol) ) {
                processPath();
            }
            else if ( validPair(previousSymbol, symbol) ) {
                symbol.selected = true;
                previousSymbol = symbol;
                insertFront(currentPath, symbol);
                playSound(SYMBOL_SELECT);
            }
            else {
                processPath();
            }
        }
    }
}

function testAdjacent(symbol1, symbol2) {

    return ((symbol1.x == symbol2.x && symbol1.y == symbol2.y + 1) ||
            (symbol1.x == symbol2.x && symbol1.y == symbol2.y - 1) ||
            (symbol1.x == symbol2.x + 1 && symbol1.y == symbol2.y) ||
            (symbol1.x == symbol2.x - 1 && symbol1.y == symbol2.y));

}

// Called 30 times or more per second
function onTick() {
    // Some sample drawing
    doGraphics(); 

    second_counter = currentTime();
    if (State_Machine == GAME_STATES.game && 
        timer > 0 && second_counter >= next_second) {

        timer = timer-1;
        if (timer == 0) {
            endGame();
        }
        else {
            second_counter = currentTime();
            next_second = second_counter + 1;
        }
    }

    if (State_Machine != GAME_STATES.menu) {
        processFalling();
    }
}

function processFalling() {

    // Prevent sound from repeating
    // var soundPlayed = false;

    for (i=0; i<BOARD_X; ++i) {
        var y = length(gameBoard[i]);
        for (j=y-1; j>=0; --j) {
            symbol = gameBoard[i][j];
            var expected_position = symbol.y*GRID_SIZE + GRID_POSITION_Y;
            if ( expected_position != symbol.py ) {
                symbol.py += FALL_SPEED;
                if (symbol.py > expected_position) {
                    symbol.py = expected_position;
                }
            }
        }
    }
}

function endGame() {
    playSound(TIMES_UP);
    if (score > best) {
        best = score;
    }

    forEach(currentPath, function(symbol) { symbol.selected = false });
    currentPath = [];
    previousSymbol = null;

    State_Machine = GAME_STATES.end;
    fade_timer = currentTime() + MENU_FADE_IN_TIME;
}


///////////////////////////////////////////////////////////////
//                                                           //
//                      HELPER RULES                         //

function createRandomGameBoard() {

    for (i=0; i<BOARD_X; ++i) {
        for (j=0; j<BOARD_Y; ++j) {
            symbol = createRandomSymbol(i,j);
            symbol.py = GRID_POSITION_Y - (GRID_SIZE*BOARD_Y) + symbol.py;
            gameBoard[i][j] = symbol;
        }
    }
}

function createRandomSymbol(x,y) {

    var shape = 0;
    var color = 0;
    var shade = 0;
    
    // Choose the shape
    randInt = randomInteger(0,2);
    switch(randInt) {
        case 0:
            shape = SHAPES.circle;
            break;
        case 1:
            shape = SHAPES.square;
            break;
        case 2:
            shape = SHAPES.triangle;
            break;
        default:
            break;
    } 

    // Choose the color
    randInt = randomInteger(0,2);
    switch(randInt) {
        case 0:
            color = COLORS.green;
            break;
        case 1:
            color = COLORS.purple;
            break;
        case 2:
            color = COLORS.red;
            break;
        default:
            break;
    } 

    // Choose the shade
    randInt = randomInteger(0,2);
    switch(randInt) {
        case 0:
            shade = SHADES.open;
            break;
        case 1:
            shade = SHADES.solid;
            break;
        case 2:
            shade = SHADES.stripe;
            break;
        default:
            break;
    } 

    return new symbol_object(x, y, shape, color, shade);
}

function getGridCoordinates(x , y) {
    
    if (x <= GRID_POSITION_X || x >= screenWidth - GRID_POSITION_X) {
        grid_x = -1;
    }
    else {
        grid_x = floor( x / GRID_SIZE ) - GRID_POSITION_X / GRID_SIZE;
    }
    if (y <= GRID_POSITION_Y || y >= screenHeight - GRID_POSITION_Y) {
        grid_y = -1;
    }
    else {
        grid_y = floor( y / GRID_SIZE ) - GRID_POSITION_Y / GRID_SIZE;
    }

    return [grid_x, grid_y];
}

function processPath() {
    
    path_length = length(currentPath);

    if (path_length == 0) {
        return;
    }
    else if (path_length == 1) {
        previousSymbol.selected = false;
    }
    else if (timer > 0) {
        score += (path_length-1)*(path_length)*10;

        removeSymbols();
        playSuccessSound(path_length);
    }

    currentPath = [];
    previousSymbol = null;
    new_touch = false;
}

function removeSymbols( ) {

    // A total hack, update this later
    new_symbols_by_column = [0,0,0,0,0,0,0,0];

    while (length(currentPath) > 0) {
        symbol = removeBack(currentPath);
        var x = symbol.x;
        var y = symbol.y;
        // move up the column, shift everything down
        while ( y > new_symbols_by_column[x] ) {
            next_symbol = gameBoard[x][y-1];
            next_symbol.y = y;
            gameBoard[x][y] = next_symbol;
            y -= 1;
        }
        new_symbols_by_column[x] += 1;
    }
    for (i=0; i<length(new_symbols_by_column); ++i) {
        var num_symbols = new_symbols_by_column[i];
        var j = 0;
        while (j < num_symbols) {
            new_symbol = createRandomSymbol(i,j);
            new_symbol.py = GRID_POSITION_Y - GRID_SIZE*(num_symbols-j);
            gameBoard[i][j] = new_symbol;
            j += 1;
        }
    }
}

function playSuccessSound( path_length ) {
    
    if (path_length <= 3) {
        playSound(SMALL_SUCCESS);
    }
    else if (path_length <= 5) {
        playSound(MED_SUCCESS);
    }
    else if (path_length > 5){
        playSound(LARGE_SUCCESS);
    }

}

function validPair(symbol1, symbol2) {

    return (symbol1.shape != symbol2.shape &&
            symbol1.color != symbol2.color &&
            symbol1.shade != symbol2.shade);

}

function doGraphics() {
    
    fillRectangle(0, 0, screenWidth, screenHeight, makeColor(0,0,0));
    fillRectangle(0,800,640,480,RED);
    fillRectangle(1280,0,640,480,PURPLE);
    fillRectangle(1280,800,640,480,GREEN);
    fillRectangle(GRID_POSITION_X-10, GRID_POSITION_Y-10, GRID_SIZE*BOARD_X+20, GRID_SIZE*BOARD_Y+20, makeColor(0,0,0));
    fillRectangle(GRID_POSITION_X, GRID_POSITION_Y, GRID_SIZE*BOARD_X, GRID_SIZE*BOARD_Y, WHITE);

    if (State_Machine != GAME_STATES.menu) {
        drawSymbols();

        // Hide the falling symbols
        fillRectangle(0,0,screenWidth-640,160,makeColor(0,0,0));
        fillRectangle(screenWidth-640,0,640,160,PURPLE);
        fillRectangle(GRID_POSITION_X+10,GRID_POSITION_Y-10,GRID_SIZE*BOARD_X,10,makeColor(0,0,0));

        // Vertical Lines
        for (i=320; i<=1600; i += 160) {
           strokeLine(i,160,i,screenHeight-160,makeColor(0,0,0),5);
        }
        // Horizontal lines
        for (j=160; j<=1120; j += 160) {
           strokeLine(320,j,screenWidth-320,j,makeColor(0,0,0),5);
        }

        highlightSymbols();
        drawBackground();
    }

    if (State_Machine == GAME_STATES.menu) {
        drawMenu();
    }

    fillText("Score:",25,30,WHITE,"bold 100px sans-serif","left","top");
    fillText(String(score),360,30,WHITE,"bold 100px sans-serif","left","top");
    fillText("Best:",690,30,WHITE,"bold 100px sans-serif","left","top");
    fillText(String(best),965,30,WHITE,"bold 100px sans-serif","left","top");
    drawImage(TIMER_ICON, 25, 190, 100, 100);
    fillText(":",125,190,WHITE,"bold 100px sans-serif","left","top");
    fillText(String(timer),170,195,WHITE,"bold 100px sans-serif","left","top");


}

function drawBackground() {

    var multiplier = length(currentPath)-1;
    
    if (State_Machine == GAME_STATES.game) {
        drawImage(REFRESH_ICON,screenWidth-240,560,160,160);
        testButtonHover(BUTTONS.right);
        drawImage(BACK_ICON,80,560,160,160);
        testButtonHover(BUTTONS.left);
    }
    else if (State_Machine == GAME_STATES.end) {
        drawImage(REFRESH_ICON,screenWidth-240,560,160,160);
        testButtonHover(BUTTONS.right);
        drawImage(BACK_ICON,80,560,160,160);
        testButtonHover(BUTTONS.left);
    }

    if (multiplier > 1) {
        fillText("x",45,340,WHITE,"bold 130px sans-serif","left","top");
        fillText(String(multiplier),130,340,WHITE,"bold 130px sans-serif","left","top");
    }

    // fillText("Connect Dissimilar Symbols!",700,screenHeight-100,WHITE,"bold 40px sans-serif","left","top");
}


function drawMenu() {

    drawImage(TITLE_TEXT, GRID_POSITION_X + GRID_SIZE/2, GRID_POSITION_Y + GRID_SIZE/2,GRID_SIZE*(BOARD_X-1), GRID_SIZE*2);

    strokeLine( GRID_POSITION_X + GRID_SIZE*BOARD_X/2,
                GRID_POSITION_Y + GRID_SIZE*BOARD_Y/2,
                GRID_POSITION_X + GRID_SIZE*BOARD_X/2,   
                GRID_POSITION_Y + GRID_SIZE*BOARD_Y - GRID_SIZE/2,
                makeColor(0,0,0), 5);


    fillText("Symbols have 3 Properties:",370,710,makeColor(0,0,0),"bold 40px sans-serif","left","top");
    fillText("Color:   ",370,820,makeColor(0,0,0),"bold 35px sans-serif","left","top");
    fillText("Green,",516,820,GREEN,"bold 35px sans-serif","left","top"); 
    fillText("Purple,",635,820,PURPLE,"bold 35px sans-serif","left","top");
    fillText("Red",762,820,RED,"bold 35px sans-serif","left","top");  
    fillText("Shape:   Circle, Square, Triangle",370,880,makeColor(0,0,0),"bold 35px sans-serif","left","top");
    fillText("Shade:   Open, Solid, Striped",370,940,makeColor(0,0,0),"bold 35px sans-serif","left","top");

    fillText("Click and drag to draw paths such that",1000,715,makeColor(0,0,0),"bold 30px sans-serif","left","top");
    fillText("no connected symbols share any of the",995,765,makeColor(0,0,0),"bold 30px sans-serif","left","top");
    fillText("same properties, such as the two below:",990,815,makeColor(0,0,0),"bold 30px sans-serif","left","top");

    drawExampleSymbols();

    fillText("Click here to play!",745,screenHeight-105,WHITE,"bold 50px sans-serif","left","top");
    testButtonHover(BUTTONS.bottom);

}

function drawExampleSymbols() {

    if (example_symbol1 == null && example_symbol2 == null) {

        example_symbol1 = createRandomSymbol(1,0);
        example_symbol1.px = 1100;
        example_symbol1.py = 855;
        example_symbol2 = createRandomSymbol(2,0);
        while ( !validPair(example_symbol1,example_symbol2) ) {
            example_symbol2 = createRandomSymbol(2,0);
        }
        example_symbol2.px = 1260;
        example_symbol2.py = 855;
    }

    drawSymbol(example_symbol1);
    drawSymbol(example_symbol2);

}

function testButtonHover( id ) {

    if ( id == BUTTONS.right ) {
        x = RIGHT_BUTTON.x;
        y = RIGHT_BUTTON.y;
        width = RIGHT_BUTTON.width;
        height = RIGHT_BUTTON.height;
    }
    else if ( id == BUTTONS.left ) {
        x = LEFT_BUTTON.x;
        y = LEFT_BUTTON.y;
        width = LEFT_BUTTON.width;
        height = LEFT_BUTTON.height;
    }
    else if ( id = BUTTONS.bottom ) {
        x = BOTTOM_BUTTON.x;
        y = BOTTOM_BUTTON.y;
        width = BOTTOM_BUTTON.width;
        height = BOTTOM_BUTTON.height;
    }

    if (MouseX >= x && 
        MouseX <= x + width &&
        MouseY >= y && 
        MouseY <= y + height ) {
        
        strokeRectangle(x,y,width,height,SELECTED_COLOR,20);
    }
}

function testButtonPress( id, x, y ) {

    var button_x;
    var button_y;

    if ( id == BUTTONS.right ) {
        button_x = RIGHT_BUTTON.x;
        button_y = RIGHT_BUTTON.y;
        width = RIGHT_BUTTON.width;
        height = RIGHT_BUTTON.height;
    }
    else if ( id == BUTTONS.left ) {
        button_x = LEFT_BUTTON.x;
        button_y = LEFT_BUTTON.y;
        width = LEFT_BUTTON.width;
        height = LEFT_BUTTON.height;
    }
    else if ( id = BUTTONS.bottom ) {
        button_x = BOTTOM_BUTTON.x;
        button_y = BOTTOM_BUTTON.y;
        width = BOTTOM_BUTTON.width;
        height = BOTTOM_BUTTON.height;
    }

    if (x >= button_x && 
        x <= button_x + width &&
        y >= button_y && 
        y <= button_y + height ) {

        if ( id == BUTTONS.right ) {
            startGame();
            playSound(BUTTON_SOUND);

        }
        else if ( id == BUTTONS.left ) {
            State_Machine = GAME_STATES.menu;
            score = 0;
            timer = 60;
            example_symbol1 = null;
            example_symbol2 = null;
            playSound(BUTTON_SOUND);
        }
        else if ( id == BUTTONS.bottom ) {
            startGame();
            playSound(MENU_START);
        }
    }

}

function drawSymbols() {

    for (i=0; i<BOARD_X; ++i) {
        for (j=0; j<BOARD_Y; ++j) {
            symbol = gameBoard[i][j];
            drawSymbol(symbol);
        }
    }
}

// Draw symbol at the given coordinates
function drawSymbol(symbol) {
    
    offset = 40;
    grid_x = symbol.x;
    grid_y = symbol.y;
    x = symbol.px + offset;
    y = symbol.py + offset;

    height = 80;
    width = 80;

    switch(symbol.color) {
        case COLORS.green:
            switch(symbol.shape) {
                case SHAPES.circle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(GREEN_CIRCLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(GREEN_CIRCLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(GREEN_CIRCLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.square:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(GREEN_SQUARE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(GREEN_SQUARE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(GREEN_SQUARE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.triangle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(GREEN_TRIANGLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(GREEN_TRIANGLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(GREEN_TRIANGLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        case COLORS.purple:
            switch(symbol.shape) {
                case SHAPES.circle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(PURPLE_CIRCLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(PURPLE_CIRCLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(PURPLE_CIRCLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.square:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(PURPLE_SQUARE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(PURPLE_SQUARE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(PURPLE_SQUARE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.triangle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(PURPLE_TRIANGLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(PURPLE_TRIANGLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(PURPLE_TRIANGLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        case COLORS.red:
            switch(symbol.shape) {
                case SHAPES.circle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(RED_CIRCLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(RED_CIRCLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(RED_CIRCLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.square:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(RED_SQUARE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(RED_SQUARE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(RED_SQUARE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                case SHAPES.triangle:
                    switch(symbol.shade) {
                        case SHADES.open:
                            drawImage(RED_TRIANGLE_OPEN, x, y, width, height);
                            break;
                        case SHADES.solid:
                            drawImage(RED_TRIANGLE_SOLID, x, y, width, height);
                            break;
                        case SHADES.stripe:
                            drawImage(RED_TRIANGLE_STRIPE, x, y, width, height);
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        default:
           break;
    }
}

function highlightSymbols() {

    var x;
    var y;

    for (i=0; i < length(currentPath); ++i) {

        symbol = currentPath[i];
        x = symbol.x*GRID_SIZE + GRID_POSITION_X;
        y = symbol.y*GRID_SIZE + GRID_POSITION_Y;
        strokeRectangle(x,y,GRID_SIZE,GRID_SIZE,SELECTED_COLOR,20);
    }
}


///////////////////////////////////////////////////////////////
//                                                           //
//                   OBJECT CONSTRUCTORS                     //

// use the ENUM variables defined above
function symbol_object(x, y, shape, color, shade) {
    this.x = x;
    this.y = y;
    this.px = x*GRID_SIZE + GRID_POSITION_X;
    this.py = y*GRID_SIZE + GRID_POSITION_Y;
    this.shape = shape;
    this.color = color;
    this.shade = shade;
    this.selected = false;
}


/*

REJECTED CODE


function drawMenu() {

    // Black Screen Fade in
    if (State_Machine == GAME_STATES.end ||
        State_Machine == GAME_STATES.restart) {
        // Change transparancy until it reaches the Desired Level
        var trans;
        var background_trans;
        if (State_Machine == GAME_STATES.end) {
            trans = min(1,(MENU_FADE_IN_TIME - (fade_timer - currentTime()))/MENU_FADE_IN_TIME);
            background_trans = min(MENU_TRANS,MENU_TRANS*trans);
        }
        else {
            trans = max(0,(fade_timer - currentTime()) / MENU_FADE_IN_TIME);
            background_trans = trans;
            if (trans == 0) {
                startGame();
            }
        }
        fillRectangle(0,0,screenWidth,screenHeight,makeColor(0,0,0,background_trans));
        fillText("Times Up!",485,280,makeColor(0.9,0.9,0.9,trans),"bold 200px sans-serif","left","top");
        fillText("Score:",620,500,makeColor(0.9,0.9,0.9,trans),"bold 120px sans-serif","left","top");
        fillText(String(score),1030,500,makeColor(0.9,0.9,0.9,trans),"bold 120px sans-serif","left","top");
        drawButton(BUTTONS.right,560,720,trans);
        fillText("Play Again?",780,750,makeColor(0.9,0.9,0.9,trans),"bold 110px sans-serif","left","top");
    }
}
*/