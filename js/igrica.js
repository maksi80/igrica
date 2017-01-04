var renderer;
var stage;
var data = null;
var gameStatus = 0;
var gameStateMOVING = 1;
var gameStateCHECK_WIN = 2;

var INC = [100, 60, 50 ,30, 25]; //moraju da budu celi delioci 3000 tj ncycly*tileinSprite

var tileHEIGHT = 100;
var offsetX   = 50;
var tileWIDTH = 100;

var slotNumber = 5;
var nCycly = 6;
var tilesInSprite = 5;

var creditValueShow = null;
var creditValue 	= 0;
var bets_buttons = {};
var betChoosen = 5;
var figures_buttons = {};
var figureChoosen = "A";
var sumBetNode = null;
var spinBtn  = null;

var tile = [];
var maxPos = [];
var initialPosition = [];
var figures = null;
var audio = null;
var volume  = 1;

PIXI.loader.add('data', 'data/config.json')
						//.on("progress", loadProgressHandler)
						.load(createGame);

function createGame(loader,resources) {

	renderer = PIXI.autoDetectRenderer(1000, 800, { backgroundColor: 0xA8B2A7 });
	document.body.appendChild(renderer.view);
	stage = new PIXI.Container();
	createScene(resources);
	generatePositions(resources);
    animate();
}

function animate() {

	if (gameStatus == gameStateMOVING) {

        for (var i = 0; i < slotNumber; i++) {

            if (maxPos[i] > 0) {
            	for( var j = 0 ; j < 3; j++) {
	                tile[j][i].tilePosition.y   = tile[j][i].tilePosition.y + INC[i];
            	}
                maxPos[i]                   = maxPos[i] - INC[i];
            }
        }
        if (maxPos[slotNumber-1] <= 0 ) {
            gameStatus = gameStateCHECK_WIN;
            spinBtn.interactive = true;
            checkWin();
        }
    }

    requestAnimationFrame(animate);
    renderer.render(stage);
}

function createScene(resources) {
	data = resources.data.data;
	var message = new PIXI.Text(data.betMessage, {fontSize: '15px', fontFamily: 'Arial',fill: '#ff0000',align: 'center'});
    message.x   = 560;
    message.y   = 45;
    stage.addChild(message);

    var credit  = new PIXI.Text('CREDIT:', {fontSize: '18px', fontFamily: 'Arial'});
    credit.x    = 550;
    credit.y    = 10;
    stage.addChild(credit);

    creditValue = data.creditValue;
    creditValueShow = new PIXI.Text(creditValue, {fontSize: '18px', fontFamily: 'Arial'});
    creditValueShow.x   = 628;
    creditValueShow.y   = 10;
    stage.addChild(creditValueShow);

    /*******spin btn ******************/
    spinBtn = new PIXI.Sprite(PIXI.Texture.fromImage(data.imgSpinButton));
    spinBtn.position.set(300, 150);
    spinBtn.interactive = true;
    spinBtn.on("click", spin);
    stage.addChild(spinBtn);

    /*********bets btns *****************/
    var betsBtnsContainer = new PIXI.Container();
    bets_buttons = data.bets_buttons;
    for(var i in bets_buttons){
        bets_buttons[i].obj = new PIXI.Sprite(PIXI.Texture.fromImage(betChoosen == bets_buttons[i].id ? bets_buttons[i].images.active : bets_buttons[i].images.hover));
        bets_buttons[i].obj.controlId = bets_buttons[i].id;
        bets_buttons[i].obj.position.set(bets_buttons[i].position.x, bets_buttons[i].position.y);
        bets_buttons[i].obj.on('click', changeBet);
        bets_buttons[i].obj.interactive = true;
        betsBtnsContainer.addChild(bets_buttons[i].obj);
    }
    betsBtnsContainer.position.set(50,0);
    stage.addChild(betsBtnsContainer);

    /***********figures btns******************/
    var figuresBtnsContainer = new PIXI.Container();
    figures_buttons = data.figures_buttons;
    for(var i in figures_buttons){
        figures_buttons[i].obj = new PIXI.Sprite(PIXI.Texture.fromImage(figureChoosen == figures_buttons[i].id ? figures_buttons[i].images.active : figures_buttons[i].images.hover));
        figures_buttons[i].obj.controlId = figures_buttons[i].id;
        figures_buttons[i].obj.position.set(figures_buttons[i].position.x, figures_buttons[i].position.y);
        figures_buttons[i].obj.on('click', changeFigure);
        figures_buttons[i].obj.interactive = true;
        figuresBtnsContainer.addChild(figures_buttons[i].obj);
    }
    figuresBtnsContainer.position.set(50,30);
    stage.addChild(figuresBtnsContainer);

    sumBetNode = new PIXI.Text(parseInt(betChoosen) * parseInt(figures_buttons[figureChoosen].multiplicator), {fontSize: '20px', fontWeight:'bold', fill: 0xFF1111});
    sumBetNode.position.set(628, 42);
    stage.addChild(sumBetNode);
}

function changeBet(){
	if(gameStatus == gameStateMOVING) {return;}
    
    bets_buttons[betChoosen].obj._texture = PIXI.Texture.fromImage(bets_buttons[betChoosen].images.hover);
    betChoosen = this.controlId;
    setSumBet();
    this._texture = PIXI.Texture.fromImage(bets_buttons[this.controlId].images.active);
}

function changeFigure(){
	if(gameStatus == gameStateMOVING) {return;}

	figures_buttons[figureChoosen].obj._texture = PIXI.Texture.fromImage(figures_buttons[figureChoosen].images.hover);
    figureChoosen = this.controlId;
    setSumBet();
    showFigure();
    this._texture = PIXI.Texture.fromImage(figures_buttons[figureChoosen].images.active);
}

function setSumBet(){
	
    sumBetNode.text = parseInt(betChoosen) * parseInt(figures_buttons[figureChoosen].multiplicator); 
}

function showFigure(){
    for( var j = 0; j < 3; j++) {
	    for (var i = 0; i < slotNumber; i++) {
	    	tile[j][i].tint = 16777215;
	    }
	}

	figures = figures_buttons[figureChoosen].figure;

	for(var i in figures){
		var coordinate = figures[i]; 
		tile[coordinate.x][coordinate.y].tint = 0xFF00FF;
	}

}

function generatePositions(resources) {
	var slotImg        = PIXI.Texture.fromImage(data.imgSlotSprite);
	initialPosition = resources!= undefined ? resources.data.data.initial_position : [];

    var tilesHolder = new PIXI.Container();
    tilesHolder.x = 100;
	tilesHolder.y = 120;
    stage.addChild(tilesHolder);

    for( var j = 0 ; j < 3; j++) {
        tile[j] = [];
        for (var i = 0; i < 5; i++) {
            var random = initialPosition.length ? initialPosition[j][i] :getRandomizer(0,4);
            tile[j][i]                	= new PIXI.extras.TilingSprite(slotImg, tileWIDTH, tileHEIGHT);
            tile[j][i].value            = random;
            tile[j][i].coordinate       = { x: j , y:i };
            tile[j][i].tilePosition.x   = 0;
            tile[j][i].tilePosition.y   = (-random * tileHEIGHT);
            tile[j][i].x                = offsetX + (i * 105);
            tile[j][i].y                = (j+1)*105;

            tilesHolder.addChild(tile[j][i]);
            maxPos[i] = (nCycly * tileHEIGHT * tilesInSprite );
        }  
    }
}

function spin() {
	if(!hasMoney()){
        alert("You don't have money for play"); return;
    }
    playSound('assets/sounds/spin1.mp3');
    this._texture = PIXI.Texture.fromImage(data.imgSpinButtonDisabled);
    this.interactive = false;
	generatePositions();
	gameStatus = gameStateMOVING;
}

function getRandomizer(bottom, top) {
    return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
}

function checkWin(){
	if(gameStatus == gameStateCHECK_WIN) {
		audio.pause();
		audio = null;
		if(checkAllSame(figures_buttons[figureChoosen].figure)){
			showFigure();
			playSound('assets/sounds/win.mp3');
       		creditValue +=  parseInt(betChoosen) * parseInt(figures_buttons[figureChoosen].multiplicator);
		}else{
			creditValue -=  parseInt(betChoosen) * parseInt(figures_buttons[figureChoosen].multiplicator)
		}
		setCredit(creditValue);
	}
}

function setCredit(credit){
	creditValueShow.text = parseInt(credit);
	if(creditValue <=0){
		confirm('Play again?');
        window.location.reload();
	}
	spinBtn._texture = PIXI.Texture.fromImage(data.imgSpinButton);
	spinBtn.interactive = true;
}

function checkAllSame(figure) {
	var coordinateFirst = figure[0];
	for(var i = 1; i < figure.length; i++){
		var coordinate = figure[i];
		if(tile[coordinateFirst.x][coordinateFirst.y].value != tile[coordinate.x][coordinate.y].value){
			return false;
		}
	}
	return true;
}

function hasMoney() {
	if(parseInt(creditValue) < parseInt(betChoosen) * parseInt(figures_buttons[figureChoosen].multiplicator)) {
        return false;
    }
    return true;
}

function playSound(x) {
    audio       = new Audio(x);
    audio.volume    = volume;
    audio.play();
}