$(document).ready(function() {
	moveCount = MOVES.LEVEL_ONE;
	SetMovesCount();
	//Prepare the tiles board
	SetTiles();
	
	//Bind the Complete toggle checkbox
	$('#chkToggle').change(ToggleComplete);
	$(document).on('click', '#working .col:not(.empty)', TileClickHandler);
	$(document).on('click', '#exceeded', Retry);
	$(document).on('click', '#resetWrapper', Reset);
	$(document).on('keyup', KeyNavigationHandler);
});

const TILE_CLASS = 'col';
const EMPTY_TILE_CLASS = `${TILE_CLASS} empty`;
const TILE_ON = `${TILE_CLASS} on`;
const ONE = 0;
const TWO = 1;
const THREE = 2;
const TILE_TOTAL = 9;
const accolades = ['Excellent!', 'Good Job!', 'Nice!!', 'Impressive!'];
var COORDINATES = { TOP_LEFT : '0,0', TOP_CENTER : '0,1', TOP_RIGHT : '0,2',
				  	CENTER_LEFT : '1,0', CENTER_CENTER : '1,1', CENTER_RIGHT : '1,2',
				  	BOTTOM_LEFT : '2,0', BOTTOM_CENTER : '2,1', BOTTOM_RIGHT : '2,2' };
var MOVES = { LEVEL_ONE : 16, LEVEL_TWO : 18, LEVEL_THREE : 16, LEVEL_FOUR : 20 };

var updateLevelCount = false;
var freeze = false;
var retryFreeze = false;
var onTiles = new Array();
var onTilesWorking = new Array();
var emptyTile;
var emptyTileWorking;
var moveCount = MOVES.LEVEL_ONE;
var level = 1;
var previousLevel = level;
var playableNum = 0;
var Positions = { CENTER:0, DIAGONAL:1, HORIZONTAL:2, VERTICAL:3 };
var postionsPlayable = [Positions.CENTER, Positions.DIAGONAL, Positions.HORIZONTAL, Positions.VERTICAL];
var advancedPositions = { BOX:0, EL:1, _EL:2, _TEE:3, TEE:4 };
var advancedPositionsPlayable = [ advancedPositions.BOX, advancedPositions.EL, advancedPositions._EL, advancedPositions.TEE, advancedPositions._TEE ];

function ToggleComplete () {
	var elComplete = $('#gridComplete');
	//If the Show complete button is checked, display the complete version, else hide it
	if(this.checked) {
		elComplete.fadeIn(800, "linear");
	}
	else {
		elComplete.fadeOut(800, "linear");
	}
}

function TileClickHandler (e) {
	var $el = (e.target);
	
	if(IsFreeze()) 
		return;
	
	//If the Tile is playable, swap it with the empty tile
	if(IsTilePlayable($el.id)) {
		SwapTiles(e.target, document.getElementsByClassName('empty')[0]);
		
		DecrementMovesCount();
	}
}

function IsFreeze() {
	//Freeze play if the user got the pattern right, in order to play the next pattern
	if(freeze) 
		return true;
}

function SwapTiles (tileA, tileB) {
	var temp = tileA.className;
	tileA.className = tileB.className;
	tileB.className = temp;
}

function SetClassName (tile, str) {
	tile.className = str;
}

function GetEmptyTileElementID () {
	return $('.empty')[0].id;
}

function GetTileRow (txtID) {
	var rID = txtID.lastIndexOf("row");
	//If txtID doesn't begin with row, return -1
	if(rID !== 0)
		return -1;
	
	var str = txtID.substring(3, txtID.lastIndexOf("col"));
	
	//If the str is not an interger, return -1
	if(!Number.isInteger(Number(str))) {
		return -1;
	}
	return str;
}

function GetTileCol (txtID) {
	var cID = txtID.lastIndexOf("col");
	//If txtID doesn't have 'col' in it, return -1
	if(cID === -1)
		return -1;
	//
	var str = txtID.substring(txtID.lastIndexOf("col")+3);
	
	//If the str is not an interger, return -1
	if(!Number.isInteger(Number(str))) {
		return -1;
	}
	return str;
}

function IsTilePlayable (tileID) {
	var emptyTileRow, emptyTileCol, emptyTileStr, tileCol, tileRow;
	emptyTileStr = GetEmptyTileElementID();
	emptyTileCol = GetTileCol(emptyTileStr);
	emptyTileRow = GetTileRow(emptyTileStr);
	
	tileCol = GetTileCol(tileID);
	tileRow = GetTileRow(tileID);
	
	//Check if there is no row between the tile and the empty tile, if there is, then the tile is currently unplayable
	if(Math.abs(tileRow - emptyTileRow) > 1) {
		return false;
	}
	
	//The the tile and the empty tile are in the same row
	if(tileRow === emptyTileRow) {
		//If there is a column between them, then tile is currently unplayable
		if(Math.abs(tileCol - emptyTileCol) > 1) {
			return false;
		}
	}
	else {
		//If the tile and the empty tile are in different rows (+-1), then tile can only be playable if it has the same column as the empty tile
		if(tileCol !== emptyTileCol) {
			return false;
		}
	}
	
	return true;
}

//Use arrow keys to control the tiles
function KeyNavigationHandler (e) {
	if(IsFreeze()) 
		return;
	
	var key = e.keyCode;
	/*
	37 - Left Arrow
	38 - Up Arrow
	39 - Right Arrow
	40 - Down Arrow
	*/
	var Navigation = {
		LEFT_ARROW : 37,
		UP_ARROW : 38,
		RIGHT_ARROW : 39,
		DOWN_ARROW : 40
	};
	
	//Don't process key if it is not a navigation key
	if(key < Navigation.LEFT_ARROW || key > Navigation.DOWN_ARROW) {
		return;
	}
	
	var emptyTile = GetEmptyTileElementID();
	var emptyTileRow = GetTileRow(emptyTile);
	var emptyTileCol = GetTileCol(emptyTile);
	
	switch(key) {
		case Navigation.LEFT_ARROW :
			//Check if there is a tile to the right of the empty tile
			if(emptyTileCol >= 3)
				return;
			
			swapArrow(`row${emptyTileRow}col${Number(emptyTileCol)+1}`);
			
			break;
			
		case Navigation.UP_ARROW : 
			//Check if there is a title to the bottom of the empty tile
			
			if(emptyTileRow >= 3)
				return;
			
			swapArrow(`row${Number(emptyTileRow)+1}col${emptyTileCol}`);
		
			break;
			
		case Navigation.RIGHT_ARROW : 
			//Check if there is a title to the left of the empty tile
			
			if(emptyTileCol <= 1)
				return;
			swapArrow(`row${emptyTileRow}col${Number(emptyTileCol)-1}`);
			break;
			
		case Navigation.DOWN_ARROW : 
			//Check if there is a title to the top of the empty tile
			
			if(emptyTileRow <= 1)
				return;
			
			swapArrow(`row${Number(emptyTileRow)-1}col${emptyTileCol}`);
			
			break;
	}
}

function GetMovesAllowed () {
	var moves;
	switch(level) {
		case 1 :
			moves = MOVES.LEVEL_ONE;
			break;
		case 2 :
			moves = MOVES.LEVEL_TWO;
			break;
		case 3 :
			moves = MOVES.LEVEL_THREE;
			break;
		case 4 :
			moves = MOVES.LEVEL_FOUR;
			break;
	}
	
	return moves;
}

function Retry() {
	//Retrun if the user clicks on retry more than once or if the user hasn't exceeded the moves allowable yet
	if(retryFreeze === true || moveCount !== 0)
		return;
	retryFreeze = true;
	
	moveCount = GetMovesAllowed();
	
	RecreateWorkingGrid();
	
	$('#exceeded').fadeOut(500, 'linear', function() {
		freeze = false;
		//Reset the moves count
		SetMovesCount();
		
		retryFreeze = false;
	});
	
}

function SetMovesCount () {
	var str = moveCount;
	if(moveCount < 10) {
		str = '0'+moveCount;
	}
	color = '#000';
	if(moveCount < 6) {
		switch (moveCount) {
			case 5 :
				color = '#af0000';
				break;
			case 4 :
				color = '#bf0000';
				break;			
			case 3 :
				color = '#cf0000';
				break;			
			case 2 :
				color = '#df0000';
				break;
			case 1 :
				color = '#ef0000';
				break;
			case 0 : 
				color = 'ff0000';
				break;
		}
	}
	El('movesCount').style.color = color;
	El('movesCount').textContent = str;
	
}

function RecreateWorkingGrid () {
	//Recreate the working grid
	ResetWorkingGrid();
	for(var i = 0; i < onTilesWorking.length; i++) {
		SetClassName(El(onTilesWorking[i]), TILE_ON);
	}
	//Set the empty tile
	SetClassName(El(emptyTileWorking), EMPTY_TILE_CLASS);
}
function Reset() {
	var timer = setInterval(function (){
		var val = Number(El('working').style.opacity);
		var opacity;
		if(Reset.blur === undefined) 
			opacity = val - 0.1;
		else
			opacity = val + 0.05;
		El('working').style.opacity = opacity;
		if(opacity <= 0.3) {
			Reset.blur=true;
			RecreateWorkingGrid();
		} else if (opacity >= 1) {
			El('working').style.opacity = 1;
			Reset.blur = undefined;
			//Reset the moves count
			moveCount = GetMovesAllowed();
			SetMovesCount();
			clearInterval(timer);
		}
	}, 65);
}

function DecrementMovesCount () {
	//Increment the number of moves 
	moveCount--;
	SetMovesCount();
	
	//Freeze play
	if(CheckIfCorrect() === true) {
		freeze = true; 
	
		//Remove the last playble type e.g. diagonal, horizontal etc.
		if(level < 3)
		{
			postionsPlayable.splice(playableNum, 1);
			if(postionsPlayable.length === 0) {
				NextLevel();
			}
		} else {
			if(!(level === 4 && advancedPositionsPlayable.length === 0)) {
				advancedPositionsPlayable.splice(playableNum, 1);
				if(advancedPositionsPlayable.length === 0) 
					NextLevel();
			}
		}
	
		//If the user has progressed to the new level
		if(previousLevel !== level) {
			//Display the next level in the accolades
			El('newLevel').style.display = 'inline';
			El('newLevel').textContent = 'LEVEL '+level;
			updateLevelCount = true;
			previousLevel = level;
		} 
		
		moveCount = GetMovesAllowed();
		
		$('#loading').fadeIn('850', 'linear', DisplayAccolade);
	} else if(moveCount === 0) {
		freeze = true;
		//If the user has exceeded the number of moves allowed
		$('#exceeded').fadeIn('850', 'linear', function (){
			El('exceeded').style.display = 'flex';
		});
	}
}

function DisplayAccolade () {	
	//Generate a random message
	El('accolade').textContent = accolades[Math.floor(Math.random() * accolades.length)];

	El('thumb').style.backgroundImage = "url('images/thumb_up"+(Math.floor(Math.random() * 2) + 1)+".png')";

	
	El('loading').style.display = 'flex';
	//Reset the tiles
	SetTiles();

	setTimeout(function () {
		UnFreeze();
	}, 2500);
}

function UnFreeze () {
	freeze = false;
	$('#loading').fadeOut('500', 'linear', function () {
		//Hide the New Level
		El('newLevel').style.display = 'none';
		//Remove the accolade text 
		El('accolade').textContent = '';
		//Reset the moves count
		SetMovesCount();
		//Remove the thumb up image
		El('thumb').style.backgroundImage = "";
		if(updateLevelCount === true) {
			//Update the Level count
			El('levelCount').textContent = level;
			updateLevelCount = false;
		}
	});
}

function swapArrow (tileStrID) {
	var tileA = document.getElementById(tileStrID);
	SwapTiles(tileA, document.getElementsByClassName('empty')[0]);
	
	DecrementMovesCount();
}

function SetTiles () {
	if(level >= 3) {
		AdvancedLevel();
	} else {
		GenerateLevel();
	}
}

function RandomGrid() {
	var tilePositions = new Array();
	var coords = [ COORDINATES.BOTTOM_CENTER, COORDINATES.BOTTOM_LEFT, COORDINATES.BOTTOM_RIGHT,
				 COORDINATES.CENTER_CENTER, COORDINATES.CENTER_LEFT, COORDINATES.CENTER_RIGHT,
				 COORDINATES.TOP_CENTER, COORDINATES.TOP_LEFT, COORDINATES.TOP_RIGHT ];
	
	for(var i = 0; i < 5; i++) {
		var rand = Math.floor(Math.random() * coords.length);
		tilePositions.push(coords[rand]);
		//Remove the coordinate so it doesn't set selected again
		coords.splice(rand, 1);
	}
	
	DisplayCompleteGrid(tilePositions);
}

function AdvancedLevel () {
	var count = advancedPositionsPlayable.length;
	//Generate random ON tiles if there are no more positions to play
	if(count <= 0 && level === 4) {
		RandomGrid();
		return;
	}
	
	var rand = Math.floor(Math.random() * count);
	
	switch(advancedPositionsPlayable[rand]) {
		case advancedPositions.BOX :
			Box();
			break;
		case advancedPositions.EL :
			LetterEl();
			break;
		case advancedPositions._EL :
			InvertedLetterEL();
			break;
		case advancedPositions._TEE :
			InvertedLetterTee();
			break;
		case advancedPositions.TEE :
			LetterTee();
			break;
	} 
	
	playableNum = rand;
}

function Box () {
	var tilePositions = new Array();
	
	tilePositions.push(COORDINATES.TOP_LEFT);
	tilePositions.push(COORDINATES.TOP_RIGHT);
	tilePositions.push(COORDINATES.BOTTOM_LEFT);
	tilePositions.push(COORDINATES.BOTTOM_RIGHT);
	
	if(level === 4) {
		tilePositions.push(COORDINATES.CENTER_CENTER);
	}
	
	DisplayCompleteGrid(tilePositions);
}
function LetterEl () {
	var tilePositions = new Array();
	
	for(var row = 0; row < 3; row++) {
		tilePositions.push(`${row},0`);
	}
	
	tilePositions.push(COORDINATES.BOTTOM_CENTER);
	if(level === 4) {
		tilePositions.push(COORDINATES.BOTTOM_RIGHT);
	}
	
	DisplayCompleteGrid(tilePositions);
}
function InvertedLetterEL () {
	var tilePositions = new Array();
	
	for(var row = 0; row < 3; row++) {
		tilePositions.push(`${row},2`);
	}
	
	tilePositions.push(COORDINATES.BOTTOM_CENTER);
	if(level === 4) {
		tilePositions.push(COORDINATES.BOTTOM_LEFT);
	}
	
	DisplayCompleteGrid(tilePositions);
}
function LetterTee () {
	var tilePositions = new Array();
	
	for(var col = 0; col < 3; col++) {
		tilePositions.push(`0,${col}`);
	}
	
	tilePositions.push(COORDINATES.CENTER_CENTER);
	if(level === 4) {
		tilePositions.push(COORDINATES.BOTTOM_CENTER);
	}
	
	DisplayCompleteGrid(tilePositions);
}
function InvertedLetterTee () {
	var tilePositions = new Array();
	
	for(var col = 0; col < 3; col++) {
		tilePositions.push(`2,${col}`);
	}
	
	tilePositions.push(COORDINATES.CENTER_CENTER);
	if(level === 4) {
		tilePositions.push(COORDINATES.TOP_CENTER);
	}
	
	DisplayCompleteGrid(tilePositions);
}

function GenerateLevel(){
	var count = postionsPlayable.length;
	//Return if there are no more positions to play
	if(count <= 0)
		return;
	
	var rand = Math.floor(Math.random() * count);
	
	switch(postionsPlayable[rand]) {
		case Positions.CENTER :
			Center();
			break;
		case Positions.DIAGONAL :
			Diagonal();
			break;
		case Positions.HORIZONTAL :
			Horizontal();
			break;
		case Positions.VERTICAL :
			Vertical();
			break;
	} 
	
	playableNum = rand;
}

function ResetPlayableTiles () {
	postionsPlayable = [];
	advancedPositionsPlayable = [];
	
	if(level < 3)
		postionsPlayable = [Positions.CENTER, Positions.DIAGONAL, Positions.HORIZONTAL, Positions.VERTICAL];
	else
		advancedPositionsPlayable = [ advancedPositions.BOX, advancedPositions.EL, advancedPositions._EL, advancedPositions.TEE, advancedPositions._TEE ];
}

function NextLevel () { 
	level++;
	
	ResetPlayableTiles();
}

function Vertical () {
	var tilePositions = new Array();
	switch (level) {
		case 1 :

			//Randomly generate where the row should be 
			var col = Math.floor(Math.random() * 3);
			
			var res = TwoRandomPositions().split(',');
			tilePositions.push(res[0]+','+col);
			tilePositions.push(res[1]+','+col);


			break;
		case 2 :
			for(var row = 0; row<3; row++) 
				tilePositions.push(`${row},1`);
	}
	
	DisplayCompleteGrid(tilePositions);
}

function Horizontal () {
	var tilePositions = new Array();
	switch (level) {
		case 1 :

			//Randomly generate where the row should be 
			var row = Math.floor(Math.random() * 3);
			
			var res = TwoRandomPositions().split(',');
			tilePositions.push(row+','+res[0]);
			tilePositions.push(row+','+res[1]);

			break;
		
		case 2 :
			for(var col = 0; col<3; col++) 
				tilePositions.push(`1,${col}`);
		}
	
	DisplayCompleteGrid(tilePositions);
}

function Diagonal() {
	var tilePositions = new Array();
	//Shoud it start from the left or right
	var startLeft = Math.floor(Math.random() * 2);
	switch (level) {
		case 1 :

			//Should the second tile be at the far diagonal end or the next diagonal position
			var near = Math.floor(Math.random() * 2);

			//Starting position
			if(startLeft) {
				tilePositions.push(ONE+','+ONE);
				var str = (near) ? TWO+','+TWO : THREE+','+THREE;
				tilePositions.push(str);
			} else {
				tilePositions.push(THREE+','+THREE); 
				var str = (near) ? TWO+','+TWO : THREE+','+ONE;
				tilePositions.push(str);
			}


			break;
			
			case 2 :
				if(startLeft) {
					tilePositions.push('0,0');
					tilePositions.push('1,1');
					tilePositions.push('2,2');
					
				} else {
					tilePositions.push('0,2');
					tilePositions.push('1,1');
					tilePositions.push('2,0');
				}
			break;
	}
	
	DisplayCompleteGrid(tilePositions);
}

function Center () {
	var tilePositions = new Array();
	switch (level) {
		case 1 :
			
			//Shoud it be vertical or horizontal
			var vertical = Math.floor(Math.random() * 2);
			
			var res = TwoRandomPositions().split(',');
			if(vertical) {
				tilePositions.push(res[0]+','+TWO);
				tilePositions.push(res[1]+','+TWO);
			} else {
				tilePositions.push(TWO+','+res[0]);
				tilePositions.push(TWO+','+res[1]);
			}
			
			break;
		case 2 :
			for(var col = 0; col < 3; col++) 
				tilePositions.push(`1,${col}`);
	}
	DisplayCompleteGrid(tilePositions);
}

function TwoRandomPositions () {
	//Generate two random numbers between 1, 2, 3
	var arr = [0, 1, 2];
	var r1 = Math.floor(Math.random() * arr.length);
	var p1 = arr[r1];//Position 1
	//Remove the element randomly generated
	arr.splice(r1, 1);
	var r2 = Math.floor(Math.random() * arr.length);
	var p2 = arr[r2];//Position 2
	
	return `${p1},${p2}`;
}

function DisplayCompleteGrid (onPostions) {
	onTiles = [];//Empty the On Tiles array
	var offPositions = new Array();
	var offCoords = new Array();
	var currentPos;
	for(var row = 0; row < 3; row++) { //Rows
		for(var col = 0; col < 3; col++) { //Columns
			currentEl = `c_row${row+1}col${col+1}`;
			
			currentPos = `${row},${col}`;
			var str = TILE_CLASS;
			if(onPostions.indexOf(currentPos) !== -1) {//If the tile is ON
				//Stroe the ON tile elements
				onTiles.push(El(`row${Number(row)+1}col${Number(col)+1}`));
				str = TILE_ON;
			} else { //If the tile is off, add to the array of OFF tiles
				offPositions.push(currentEl);
				offCoords.push(currentPos);
			}
			SetClassName(El(currentEl), str);
		}
	}
	
	//Randomly choose the empty tile from the OFF positions
	var emptyEl = offPositions[Math.floor(Math.random() * offPositions.length)];
	SetClassName(El(emptyEl), EMPTY_TILE_CLASS);
	//Store the empty tile element 
	emptyTile = El(emptyEl.substring(2));//Substring to remove the 'c_'
	
	DisplayWorkingGrid(onPostions, offCoords);
}

function ResetWorkingGrid () {
	for(var row = 0; row < 3; row++) { //Rows
		for(var col = 0; col < 3; col++) { //Columns 
			SetClassName(El(`row${row+1}col${col+1}`), TILE_CLASS);
		}
	}
}

function El(str) {
	return document.getElementById(str);
}

function DisplayWorkingGrid (onCoords, offCoords) {
	onTilesWorking = [];
	ResetWorkingGrid();
	
	var onCount = onCoords.length;
	//Randomly place the empty tile on an ON position for levels 1 & 2 and an OFF position for level 3
	var emptyTileCoord;
	
	if(level < 3) {
		emptyTileCoord = onCoords[Math.floor(Math.random() * onCount)]; }
	else if (level === 3) {
		var num = Math.floor(Math.random() * offCoords.length);
		emptyTileCoord = offCoords[num];
		//Remove the OFF position selected for the empty tile
		offCoords.splice(num, 1);
	}
	if (level === 4) {
		var num = Math.floor(Math.random() * onCount);
		emptyTileCoord = onCoords[num];
		onCoords.splice(num, 1);
	}
	
	var res = emptyTileCoord.split(',');
	var emptyTileID = `row${Number(res[0])+1}col${Number(res[1])+1}`;
	emptyTileWorking = emptyTileID;
	
	SetClassName(El(emptyTileID), EMPTY_TILE_CLASS);
	
	//Randomly place the ON tiles in the wrong positions so the user/player can figure out the puzzle
	for(var i=onCount; i>0; i--) {
		var coord;
		//If there no more OFF positions i.e. ON positions > OFF positions
		if(offCoords.length <= 0) {
			var pos = Math.floor(Math.random() * onCoords.length);
			coord = onCoords[pos].split(',');
			//Remove the OFF tile coordinate from the array, so it does get selected again
			onCoords.splice(pos, 1);
		} else {
			//Get a random OFF position and Set it to ON
			var pos = Math.floor(Math.random() * offCoords.length);
			coord = offCoords[pos].split(',');

			//Remove the OFF tile coordinate from the array, so it does get selected again
			offCoords.splice(pos, 1);
		}
		var on = `row${Number(coord[0])+1}col${Number(coord[1])+1}`;
		SetClassName(El(on), TILE_ON);
		
		onTilesWorking.push(on);
	}
}

function CheckIfCorrect () {
	//If position that should hold the empty tile isn't empty yet, the user isn't done yet
	if (!emptyTile.classList.contains('empty'))
		return false;
	for(var i = 0; i < onTiles.length; i++) {
		//If any position that should contain an ON tile isn't ON, return false 'cos the user isn't done yet
		if(!onTiles[i].classList.contains('on')) 
			return false;
	}
	
	return true;
}