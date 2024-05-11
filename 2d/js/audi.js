var numberOfWaves = [];
var numberOfInstruments = 0;
var instrumentSelected = [0,0];

var attack = [];
var decay = [];
var sustain = [];
var release = [];
var keyNoteHeld = [];

var context;
var acInit = false;
var notes = [];
var soundArray = [];
var heldNotes = [];

var sampleRate = 48000;
var ups = 30; 	  //updates per second

var adsrOn = true;

var waveAmp = [];
var sampAmp = [];
var triPeak = []
var pulseAmt = []
var phase = []
var type = [];
var octave = [];
var sampleData = [];
var sampStart = [];

var pianoRolls = [];
var rollsPlaying = false;
var measureLength = 120;
var rUps = 100;

var keySetUsing = 0;
var saveSlot = 1;

var gainNode;

var audio_stream;
var audioNode;
var recLength = 0;
var recBuffers = [];
var recordingTrack;

var cwid = 22; //cell width
var cmar = 5; //cell margin;

function addInstrument(setDefaults = true)
{
	var ibDiv = document.getElementById("instrumentBox");
	var addDiv = document.createElement("div");
	addDiv.id = "instrument-" + numberOfInstruments;
	addDiv.innerHTML = '<input id="useBox-bottom-' + numberOfInstruments + '" class="useBoxes-bottom" data-noi="' + numberOfInstruments + '" onclick="useInstrument(this.dataset.noi, 0)" type="button" value="Use bottom" />' + "\n" +
		'<input id="useBox-top-' + numberOfInstruments + '" class="useBoxes-top" data-noi="' + numberOfInstruments + '" onclick="useInstrument(this.dataset.noi, 1)" type="button" value="Use top" />' + "\n" +
		'<input data-noi="' + numberOfInstruments + '" onclick="deleteInstrument(this.dataset.noi)" type="button" value="Delete instrument" />' + "\n" +
		'<input data-noi="' + numberOfInstruments + '" class="rollButton" onclick="addPianoRoll(this.dataset.noi);" type="button" value="Piano Roll" />' + "\n" +
		'Using roll: <input class="rollCheckbox" data-noi="' + numberOfInstruments + '" onchange="inputChange(this.checked, \'usingRoll\', this.dataset.noi);" type="checkbox"></input><span class="pianoRoll"></span>' + "\n" +
		'<br/>Attack: <input class="attack" data-noi="' + numberOfInstruments + '" onchange="inputChange(this.value, \'attack\', this.dataset.noi)" value="0.1">' +  "\n" +
		'Decay: <input class="decay" data-noi="' + numberOfInstruments + '" onchange="inputChange(this.value, \'decay\', this.dataset.noi)" value="0.2">' + "\n" +
		'Sustain: <input class="sustain" data-noi="' + numberOfInstruments + '" type="range" min="0" max="1" step=".01" onchange="inputChange(this.value, \'sustain\', this.dataset.noi)" value="0.5">' +  "\n" +
		'Release: <input class="release" data-noi="' + numberOfInstruments + '" onchange="inputChange(this.value, \'release\', this.dataset.noi)" value="0.25">' + "\n" +
		'<br/>Note Length: <input class="notelength" data-noi="' + numberOfInstruments + '" onchange="inputChange(this.value, \'notelength\', this.dataset.noi)" value="0.25">' + "\n" +
		'<br/><br/>' + "\n" +
		'<div id="waveformInputs-' + numberOfInstruments + '"></div>' +  "\n" +
		'<input data-noi="' + numberOfInstruments + '" onclick="addWaveInputs(this.dataset.noi);" type="button" value="Add Waveform" />' + "\n" +
		'<hr />';
	
	numberOfWaves[numberOfInstruments] = 0;
	
	if(setDefaults)
	{
		attack[numberOfInstruments] = 0.1;
		decay[numberOfInstruments] = 0.2;
		sustain[numberOfInstruments] = 0.5;
		release[numberOfInstruments] = 0.25;
		keyNoteHeld[numberOfInstruments] = 0.25;
		pianoRolls[numberOfInstruments] = new rollObj(88, 4, 4);
		initRollFuncs(pianoRolls[numberOfInstruments]);
		waveAmp[numberOfInstruments] = [];
		sampAmp[numberOfInstruments] = [];
		triPeak[numberOfInstruments] = [];
		pulseAmt[numberOfInstruments] = [];
		phase[numberOfInstruments] = [];
		type[numberOfInstruments] = [];
		octave[numberOfInstruments] = [];
		sampleData[numberOfInstruments] = [];
		sampStart[numberOfInstruments] = [];
		addWaveInputs(numberOfInstruments);
	}
	
	numberOfInstruments++;
}

function rollViewMove(dir, instrNo)
{
	var instrEle = document.getElementById("instrument-" + instrNo);
	var pTable = instrEle.querySelector(".pianoRollTable");
	var pHeight = pTable.rows.length;
	var pWidth = pTable.rows[0].cells.length;
	var iOff = 0;
	
	var pOff = pianoRolls[instrNo].viewOffset + dir;
	
	if(pOff < 0 || pOff >= (88 - pHeight+1))
	{	
		return;
	}
	
	pianoRolls[instrNo].viewOffset += dir;
	
	if(dir == 1)
	{
		pTable.deleteRow(pHeight-1);
	
		var newRow = pTable.insertRow(0);
		var iOff = pHeight - 1;
		
	}
	else if(dir == -1)
	{
		pTable.deleteRow(0);
		var newRow = pTable.insertRow();
	}
	
	generatePianoRow(newRow, instrNo, iOff + pianoRolls[instrNo].viewOffset, pWidth);
}

function generatePianoTable(idx, pHeight = 13)
{	
	var instrEle = document.getElementById("instrument-" + idx);
	var pTable = instrEle.querySelector(".pianoRollTable");

	pTable.innerHTML = "";
	var pWidth = pianoRolls[idx].width;

	for(var i=pHeight-1; i>=0; i--)
	{
		var pRow = pTable.insertRow();
		generatePianoRow(pRow, idx, i+pianoRolls[idx].viewOffset, pWidth+1);
	}
}

//row element, instrument index, row index, divs/measure
function generatePianoRow(pRow, idx, i, pWidth)
{
	var blackKeys = [1, 4, 6, 9, 11];
	for(var j=0; j<pWidth; j++)
	{
		var pCell = pRow.insertCell();
		if(j == 0)
		{
			if(blackKeys.indexOf(i%12) > -1)
			{
				pCell.classList.add("blackSquare");
			}
			else
			{
				pCell.classList.add("whiteSquare");
			}
		}
		else
		{
			var [arRow, arCol] = tableRCtoArray(i, j);
			var pianoRow = pianoRolls[idx].rollData[arRow];
			
			if(pianoRow[arCol] == 0)
			{
				pCell.classList.add("emptySquare");
			}
			else if((arCol+1) < pianoRow.length && pianoRow[arCol + 1] == 2)
			{
				pCell.classList.add("filledSquareExt");
			}
			else
			{
				pCell.classList.add("filledSquare");
			}
			
			if(pianoRow[arCol] == 2)
			{
				pCell.classList.add("filledSquareExtL");
			}
			
			if(j % pianoRolls[idx].divsBeat == 1)
			{
				pCell.classList.add("onBar");
			}
			pCell.setAttribute("onclick", "selectPianoSquare(event, this, " + idx + ", " + i + ", " + j + ");");
			pCell.setAttribute("onmousemove", "hoverOnSquare(event, this, " + idx + ", " + i + ", " + j + ");");
			pCell.setAttribute("onmouseleave", "exitSquare(event, this, " + i + ", " + j + ");");
		}
	}
}

function clearPianoRoll(instrNo)
{
	var rd = pianoRolls[instrNo].rollData;
	
	for(var i=0; i<rd.length; i++)
	{
		for(var j=0; j<rd[i].length; j++)
		{
			rd[i][j] = 0;
		}
	}
	
	var instrEle = document.getElementById("instrument-" + instrNo);
	var rollEle = instrEle.querySelector(".pianoRollTable");
	
	for(i=0; i < rollEle.rows.length; i++)
	{
		var pianoRow = rollEle.rows[i];
		for(var j=0; j<pianoRow.cells.length; j++)
		{
			var pCell = pianoRow.cells[j];
			
			pCell.classList.remove("filledSquare", "filledSquareExt", "filledSquareExtL");
			pCell.classList.add("emptySquare");
		}
	}
}

function addPianoRoll(idx, isUsing = true)
{
	var instrEle = document.getElementById("instrument-" + idx);
	var rollEle = instrEle.querySelector(".pianoRoll");
	rollEle.innerHTML = "<br/><br/>Divs/Beat: <input min=\"0\" onchange=\"inputChange(this.value, \'divsBeat\'," +
        "this.dataset.noi);\" data-noi=\"" + idx + "\" class=\"timeInfoInputDB\" value=\"4\" type=\"number\"> " +
		"Beats/Measure: <input min=\"0\" onchange=\"inputChange(this.value, \'beatsMeasure\', this.dataset.noi);\" " + 
		"data-noi=\"" + idx + "\" class=\"timeInfoInputBM\" value=\"4\" type=\"number\"><br/>" + 
		
		"Randomly mutate: <input class=\"ranMut\" onchange=\"inputChange(this.checked, \'mutate\', this.dataset.noi);\" " +
        "type=\"checkbox\" data-noi=\"" + idx + "\">" +
		"<span style=\"display:none;\" class=\"mutateNotes\" id=\"mutateNotes-" + idx + "\"> " +
		
		"Mutations per measure: <input class=\"spm mpmClass\" type=\"number\" min=\"0\" data-noi=\"" + idx + "\" "+
		"value=\"1\" onchange=\"inputChange(this.value, \'mpm\', this.dataset.noi);\"> " +
		"Mutate probability: <input class=\"spm mpClass\" type=\"number\" min=\"0\" max=\"100\" value=\"100\" " +
		"data-noi=\"" + idx + "\" onchange=\"inputChange(this.value, \'mutateProb\', this.dataset.noi);\"> % &nbsp;" +
		"Add/Delete Proportion: <input class=\"spm addDeleteProportion\" type=\"number\" min=\"0\" max=\"100\" value=\"50\" " +
		"data-noi=\"" + idx + "\" onchange=\"inputChange(this.value, \'addDeleteProportion\', this.dataset.noi);\"> % " +
		
		"<br/>&nbsp;" +
		" C#:<input class=\"csbox\" data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mncs\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;D#:<input class=\"dsbox\" data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnds\', this.dataset.noi);\" type=\"checkbox\">" +
		"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
		" &nbsp;F#:<input class=\"fsbox\" data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnfs\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;G#:<input class=\"gsbox\" data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mngs\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;A#:<input class=\"asbox\" data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnas\', this.dataset.noi);\" type=\"checkbox\">" +
		"<br/>" +
		" C:<input class=\"cbox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnc\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;D:<input class=\"dbox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnd\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;E:<input class=\"ebox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mne\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;F:<input class=\"fbox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnf\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;G:<input class=\"gbox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mng\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;A:<input class=\"abox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mna\', this.dataset.noi);\" type=\"checkbox\">" +
		" &nbsp;B:<input class=\"bbox\" checked data-noi=\"" + idx + "\" onchange=\"inputChange(this.checked, \'mnb\', this.dataset.noi);\" type=\"checkbox\">" +
		
		"</span><br/>" + 
		"<input onclick=\"rollViewMove(1, " + idx + ");\" class=\"rollArrowButton " +
		"ruArrow\" value=\"&uarr;&uarr;\" type=\"button\"><div class=\"rollContainer\">" + 
		"<div class=\"tracker\"></div><table class=\"pianoRollTable\"></table></div>" +
		"<input onclick=\"rollViewMove(-1, " + idx + ");\" class=\"rollArrowButton rdArrow\" value" +
		"=\"&darr;&darr;\" type=\"button\"><input onclick=\"clearPianoRoll(" + idx + ");\" " + 
		"class=\"clearRolls\" value =\"Clear\" type=\"button\">";
		
	var pTable = instrEle.querySelector(".pianoRollTable");
	
	var pCheckbox = instrEle.querySelector(".rollCheckbox");
	pCheckbox.checked = isUsing;
	pianoRolls[idx].usingRoll = isUsing;
	
	generatePianoTable(idx);
	
	var prButton = instrEle.querySelector(".rollButton");
	
	prButton.value = "Hide Roll";
	prButton.setAttribute("onclick", "hidePianoRoll(this.dataset.noi);");
}

function hoverOnSquare(e, cellEle, instrNo, row, col)
{
	var cColor = "violet"; //filled color
	
	var [iRow, rCol] = tableRCtoArray(row, col);
	
	var pianoRow = pianoRolls[instrNo].rollData[iRow];
	
	if(pianoRow[rCol] > 0)
	{
		if((rCol+1) < pianoRow.length && e.offsetX > cwid - cmar) // extend right
		{
			var cellAdj = cellEle.parentElement.children[col + 1];
			if(pianoRow[rCol + 1] < 2)
			{
				cellEle.style.borderRightColor = cColor;
				
				if(pianoRow[rCol + 1] == 0)
				{
					cellAdj.style.backgroundColor = cColor;
				}
				
				if(cellAdj.classList.contains("onBar"))
				{
					cellAdj.style.borderLeftColor = cColor;
				}
			}
			else
			{
				resetSquare(cellEle, col);
			}
		}
		else if((rCol-1) >= 0 && e.offsetX < cmar) //extend left
		{
			var cellAdj = cellEle.parentElement.children[col - 1];
			if(pianoRow[rCol-1] > 0 && pianoRow[rCol] == 1)
			{
				cellAdj.style.borderRightColor = cColor;
				
				if(cellEle.classList.contains("onBar"))
				{
					cellEle.style.borderLeftColor = cColor;
				}
			}
			else if(pianoRow[rCol] == 2)
			{
				resetSquare(cellEle, col);
			}
			else
			{
				cellAdj.style.backgroundColor = cColor;
				cellAdj.style.borderRightColor = cColor;
				
				if(cellEle.classList.contains("onBar"))
				{
					cellEle.style.borderLeftColor = cColor;
				}
			}
		}
		else
		{
			resetSquare(cellEle, col);
		}
	}
}

function exitSquare(e, cellEle, row, col)
{
	resetSquare(cellEle, col);
}

function resetSquare(cellEle, col)
{
	cellEle.style.backgroundColor = "";
	cellEle.style.borderRightColor = "";
	cellEle.style.borderLeftColor = "";
	
	var ceChilds = cellEle.parentElement.children;
	
	if((col+1) < ceChilds.length)
	{
		ceChilds[col + 1].style.backgroundColor = "";
		ceChilds[col + 1].style.borderLeftColor = "";
	}
	
	if((col-1) >= 1)
	{
		ceChilds[col - 1].style.backgroundColor = "";
		ceChilds[col - 1].style.borderRightColor = "";
	}
}

function hidePianoRoll(idx)
{
	var instrEle = document.getElementById("instrument-" + idx);
	var rollEle = instrEle.querySelector(".pianoRoll");
	rollEle.style.display = "none";
	
	var prButton = instrEle.querySelector(".rollButton");
	prButton.value = "Piano Roll";
	prButton.setAttribute("onclick", "showPianoRoll(this.dataset.noi);");
}

function showPianoRoll(idx)
{
	var instrEle = document.getElementById("instrument-" + idx);
	var rollEle = instrEle.querySelector(".pianoRoll");
	rollEle.style.display = "";
	
	var prButton = instrEle.querySelector(".rollButton");
	prButton.value = "Hide Roll";
	prButton.setAttribute("onclick", "hidePianoRoll(this.dataset.noi);");
}

function squareEmptyToFilled(pCell, instrNo, iRow, rCol)
{
	pCell.classList.remove("emptySquare");
	pCell.classList.add("filledSquare");
	pianoRolls[instrNo].rollData[iRow][rCol] = 1;
}

function squareFilledToEmpty(pCell, instrNo, row, col)
{
	var [iRow, rCol] = tableRCtoArray(row, col);
	var pianoRow = pianoRolls[instrNo].rollData[iRow];

	pCell.classList.remove("filledSquare");
	pCell.classList.remove("filledSquareExt");
	pCell.classList.remove("filledSquareExtL");
	pCell.classList.add("emptySquare");
	pianoRow[rCol] = 0;
	
	if((rCol+1) < pianoRow.length && pianoRow[rCol + 1] == 2) //check right
	{
		var pCellAdj = pCell.parentElement.children[col + 1];
		pCellAdj.classList.remove("filledSquareExtL");
		pianoRow[rCol + 1] = 1;
	}
	
	if((rCol-1) >= 0) //check left
	{
		var pCellAdj = pCell.parentElement.children[col - 1];
		
		if(pCellAdj.classList.contains("filledSquareExt"))
		{
			pCellAdj.classList.remove("filledSquareExt");
			pCellAdj.classList.add("filledSquare");
		}
	}
}

function selectPianoSquare(e, pCell, instrNo, row, col)
{
	var instrEle = document.getElementById("instrument-" + instrNo);
	var [iRow, rCol] = tableRCtoArray(row, col);
	var pianoRow = pianoRolls[instrNo].rollData[iRow];
	
	if(pianoRolls[instrNo].rollData[iRow][rCol] == 0)
	{
		squareEmptyToFilled(pCell, instrNo, iRow, rCol);
	}
	else
	{
		if(e.offsetX > cwid - cmar && (rCol+1)<pianoRow.length && pianoRow[rCol + 1] < 2) //extend to right
		{
			pianoRow[rCol + 1] = 2;
			
			var pCellAdj = pCell.parentElement.children[col + 1];
			
			pCell.classList.remove("filledSquare");
			pCell.classList.add("filledSquareExt");
			pCellAdj.classList.remove("emptySquare");
			pCellAdj.classList.add("filledSquare");
			
			if(pCellAdj.classList.contains("onBar"))
			{
				pCellAdj.classList.add("filledSquareExtL");
			}
		}
		else if(e.offsetX < cmar && (rCol-1) >= 0 && pianoRow[rCol] == 1) //extend to left
		{
			pianoRow[rCol] = 2;
			if(pianoRow[rCol - 1] == 0)
			{
				pianoRow[rCol - 1] = 1;
			}
			
			var pCellAdj = pCell.parentElement.children[col - 1];
			
			pCellAdj.classList.remove("emptySquare");
			pCellAdj.classList.add("filledSquareExt");
			
			if(pCell.classList.contains("onBar"))
			{
				pCell.classList.add("filledSquareExtL");
			}
		}
		else  //reset to empty square
		{  
			squareFilledToEmpty(pCell, instrNo, row, col);
		}
	}
}

function tableRCtoArray(row, col)
{
	var iRow = row;
	var rCol = col - 1;
	
	return [iRow, rCol];
}

function playRolls()
{
	initSound();
	
	rollsPlaying = true;
	
	for(var i=0; i<pianoRolls.length; i++)
	{
		pianoRolls[i].barCounter = 0;
	}
	
	var trackerEles = document.getElementsByClassName("tracker");
	for(var i=0; i<trackerEles.length; i++)
	{
		trackerEles[i].style.display = "block";
	}
	
	var rollButton = document.getElementById("playStopRolls");
	
	rollButton.setAttribute("onclick", "stopRolls()");
	rollButton.value = "Stop Rolls";
}

function stopRolls()
{
	rollsPlaying = false;
	
	var trackerEles = document.getElementsByClassName("tracker");
	for(var i=0; i<trackerEles.length; i++)
	{
		trackerEles[i].style.display = "none";
	}
	
	var rollButton = document.getElementById("playStopRolls");
	rollButton.setAttribute("onclick", "playRolls()");
	rollButton.value = "Play Rolls";
}

function rollUpdater()
{
	if(rollsPlaying)
	{
		//var upm = parseInt(measureLength * rUps);   //upm = updates per measure
		
		for(var i=0; i < pianoRolls.length; i++)
		{
			var numDivs = pianoRolls[i].width;
			var beatsMeasure = pianoRolls[i].beatsMeasure;
			
			var upm = (60 * rUps * beatsMeasure) / measureLength; //measureLength is bpm
			
			if(((pianoRolls[i].barCounter * numDivs) % upm) < numDivs)
			{
				var divIdx = Math.floor((pianoRolls[i].barCounter * numDivs) / upm);
				
				if(divIdx >= numDivs)
				{
					continue;
				}
				
				var oldKeySet = keySetUsing;
				keySetUsing = 0;
				var oldInstrSelected = instrumentSelected[keySetUsing];
				instrumentSelected[keySetUsing] = i;
				
				var beatIdx = parseInt(divIdx / pianoRolls[i].divsBeat);
				trackerUpdate(i, divIdx, beatIdx);
				
				for(var j=0; j<pianoRolls[i].height; j++)
				{
					if(pianoRolls[i].rollData[j][divIdx] == 1)
					{
						var divsNoteHeld = 1;  //number of divisions the note is held for
						for(var k=divIdx+1; k<pianoRolls[i].rollData[j].length; k++)
						{
							if(pianoRolls[i].rollData[j][k] == 2)
							{
								divsNoteHeld ++;
							}
							else
							{
								break;
							}
						}
						if(pianoRolls[i].usingRoll)
						{
							playNote(j, (upm * divsNoteHeld) / (rUps * numDivs));
						}
					}
				}
				
				instrumentSelected[keySetUsing] = oldInstrSelected;
				keySetUsing = oldKeySet;
				
				if(pianoRolls[i].mutateOn && divIdx == (numDivs-1)) //randomly mutate
				{
					for(var mut=0; mut<pianoRolls[i].mutatesPerMeasure; mut++)
					{
						var ayn = Math.random() * 100;
						if(ayn < pianoRolls[i].mutateProb)
						{
							mutate(i);
						}
					}
				}
			}
			pianoRolls[i].barCounter = (pianoRolls[i].barCounter + 1) % upm;
		}	
	}
}

function mutate(instrIdx)
{
	var instrEle = document.getElementById("instrument-" + instrIdx);
	var pTable = instrEle.querySelector(".pianoRollTable");
	
	var o = pianoRolls[instrIdx].viewOffset; //low bound
	
	var randRange = [];
	
	for(var j=o; j<o+pTable.rows.length; j++)
	{
		var modj = j % 12;
		
		if(isMutateNoteTrue(modj, instrIdx))
		{
			randRange.push(j);
		}
	}
	
	if(randRange.length > 0)
	{
		var randRowRangeIdx = Math.floor(Math.random() * randRange.length);
		var randRow = randRange[randRowRangeIdx];
		var randRpt = pTable.rows.length-1 - (randRow - o); //row in table element (inverted)
		var randCol = Math.floor(Math.random() * (pTable.rows[randRpt].cells.length - 1) + 1);
		
		var randCell = pTable.rows[randRpt].cells[randCol];
		
		var [iRow, rCol] = tableRCtoArray(randRpt + o, randCol);
		
		for(var j=0; j<randRange.length; j++)
		{
			var jRow = randRange[j];
			if(pianoRolls[instrIdx].rollData[jRow][rCol] == 1)
			{
				var jRpt = pTable.rows.length-1 - (jRow - o);
				var jCell = pTable.rows[jRpt].cells[randCol];
				squareFilledToEmpty(jCell, instrIdx, jRow, randCol);
			}
		}
		
		if(Math.random()*100 < pianoRolls[instrIdx].addDeleteProportion)
		{
			squareEmptyToFilled(randCell, instrIdx, randRow, rCol);
		}
	}
}

function isMutateNoteTrue(n, instrIdx)
{
	var noteOrder = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
	var noteName = noteOrder[n];

	return pianoRolls[instrIdx].mutateNotes[noteName];
}

function trackerUpdate(instr, divIdx, beatIdx)
{
	var instrEle = document.getElementById("instrument-" + instr);
	var trackEle = instrEle.querySelector(".tracker");
	if(pianoRolls[instr].usingRoll)
	{
		trackEle.style.display = "block";
		trackEle.style.left = (23*(divIdx+1) + beatIdx+17) + "px";
	}
	else if(trackEle != null)
	{
		trackEle.style.display = "none";
	}
}

function deleteInstrument(idx)
{
	var eleWav = document.getElementById("instrument-" + idx);
	eleWav.remove();
	
	for(var i = parseInt(idx)+1; true; i++)
	{
		var updateInstr = document.getElementById("instrument-" + i);
		var updateBoxB = document.getElementById("useBox-bottom-" + i);
		var updateBoxT = document.getElementById("useBox-top-" + i);
		var updateWi = document.getElementById("waveformInputs-" + i);
		if(typeof(updateInstr) != 'undefined' && updateInstr != null)
		{
			updateInstr.id = "instrument-" + (i-1);
			updateBoxB.id = "useBox-" + (i-1);
			updateBoxT.id = "useBox-" + (i-1);
			updateWi.id = "waveformInputs-" + (i-1);
			var childs = updateInstr.children;
			for(var j=0; j<childs.length; j++)
			{
				childs[j].dataset.noi = i-1;
			}
		}
		else
		{
			break;
		}
	}
	
	attack.splice(idx, 1);
	decay.splice(idx, 1);
	sustain.splice(idx, 1);
	release.splice(idx, 1);
	keyNoteHeld.splice(idx, 1);
	pianoRolls.splice(idx, 1);
	numberOfWaves.splice(idx, 1);
	
	waveAmp.splice(idx, 1);
	sampAmp.splice(idx, 1);
	triPeak.splice(idx, 1);
	pulseAmt.splice(idx, 1);
	phase.splice(idx, 1);
	type.splice(idx, 1);
	octave.splice(idx, 1);
	sampleData.splice(idx, 1);
	sampStart.splice(idx, 1);
	
	for(var i=0; i<instrumentSelected.length; i++)
	{
		if(instrumentSelected[i] == idx)
		{
			useInstrument(0, i);
		}
	}
	
	numberOfInstruments--;
}

function unhighlightInstruments(keyset = 0)
{
	switch(keyset)
	{
		case 0: boxpos = "bottom"; break;
		case 1: boxpos = "top"; break;
	}

	var useBoxes = document.getElementsByClassName("useBoxes-" + boxpos);
	
	for(var i=0; i<useBoxes.length; i++)
	{
		useBoxes[i].style.border = '';
	}
}

function useInstrument(instr, keyset = 0)
{
	unhighlightInstruments(keyset);
	
	instrumentSelected[keyset] = instr;
	
	var boxpos;
	var boxcolor;
	
	switch(keyset)
	{
		case 0: boxpos = "bottom"; boxcolor = "deepskyblue"; break;
		case 1: boxpos = "top"; boxcolor = "limegreen"; break;
	}
}

function switchInstrument(keyset = 0)
{
	var newIdx = (instrumentSelected[keyset] + 1) % numberOfInstruments;
	
	useInstrument(newIdx, keyset);
}

function addWaveInputs(instrNo, setDefaults = true)
{
	var instrNoW = numberOfWaves[instrNo];

	var wiDiv = document.getElementById("waveformInputs-" + instrNo);
	var addDiv = document.createElement("div");
	addDiv.id = "instr-" + instrNo + "-waveform-" + instrNoW;
	addDiv.innerHTML = '<select class="wavetype" data-noi=' + instrNo + ' data-now=' + instrNoW + 
		' onchange="inputChange(this.value, \'wave\', this.dataset.noi, this.dataset.now);">' + "\n" +
		'<option value="sine">Sine</option>' + "\n" +
		'<option selected value="square">Square</option>' + "\n" +
		'<option value="triangle">Triangle</option>' + "\n" +
		'<option value="noise">Noise</option>' + "\n" +
		'<option value="sample">Sample</option>' + "\n" +
		'</select>' + "\n\n" +

		'<input onclick="recordAudio(this);" class="sampRecord" style="display:none;" value="Record" type="button" data-noi=' + instrNo + ' data-now=' + instrNoW + '></input> ' + "\n" + 
		'<input style="display:none;" class="sampLoadFile" onclick="document.getElementById(\'loadSample-' + instrNo + '-' + instrNoW + '\').click()" type="button" value="Load Wav" />'  + "\n" + 
		'<input id="loadSample-' + instrNo + '-' + instrNoW + '" style="display:none;" onchange="loadSavedSampleFile(this.files, this);" type="file" data-noi=' + instrNo + ' data-now=' + instrNoW + '></input>' + "\n" + 
		'<span style="display:none;" class="sampAmpContainer">SampAmp: <input style="width:30px;" class="sampAmp" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'sampAmp\', this.dataset.noi, this.dataset.now)" value="1"></span>' + "\n" +
		'<span style="display:none;" class="sampStartContainer">Sample start: <input class="sampstart" style="width:50px;" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'sampstart\', this.dataset.noi, this.dataset.now)" value="0"></span>' + "\n" +
		'Octave: <input class="octave" style="width:50px;" type="number" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'octave\', this.dataset.noi, this.dataset.now)" value="3">' + "\n" +
		'Amplitude: <input class="amplitude" type="range" min="0" max="1" step=".01" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'amp\', this.dataset.noi, this.dataset.now)" value="1">' + "\n" +
		'Pulse: <input class="pulse" type="range" min="0" max="1" step=".01" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'pulse\', this.dataset.noi, this.dataset.now)" value="1">' + "\n" +
		'<span style="display:none;" class="triPeakContainer">TriPeak: <input class="tripeak" type="range" min="0" max="1" step=".01" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'tripeak\', this.dataset.noi, this.dataset.now)" value="0"></span> ' + "\n" +
		'Phase: <input class="phase" type="range" min="0" max="1" step=".01" data-noi=' + instrNo + ' data-now=' + instrNoW + ' onchange="inputChange(this.value, \'phase\', this.dataset.noi, this.dataset.now)" value="0">' + "\n" +
		'<input data-noi=' + instrNo + ' data-now=' + instrNoW + ' onclick="deleteWaveInput(this.dataset.noi, this.dataset.now)" type="button" value="Delete" />';
	
	
	if(setDefaults)
	{
		waveAmp[instrNo][instrNoW] = 1;
		sampAmp[instrNo][instrNoW] = 1;
		triPeak[instrNo][instrNoW] = 0;
		pulseAmt[instrNo][instrNoW] = 1;
		phase[instrNo][instrNoW] = 0;
		type[instrNo][instrNoW] = "square";
		octave[instrNo][instrNoW] = 3;
		sampleData[instrNo][instrNoW] = [];
		sampStart[instrNo][instrNoW] = 0;
	}
	
	numberOfWaves[instrNo]++;
	
}

function deleteWaveInput(instr, idx)
{
	var eleWav = document.getElementById("instr-" + instr + "-waveform-" + idx);
	eleWav.remove();
	
	for(var i = parseInt(idx)+1; true; i++)
	{
		var updateWave = document.getElementById("instr-" + instr + "-waveform-" + i);
		if(typeof(updateWave) != 'undefined' && updateWave != null)
		{
			updateWave.id = "instr-" + instr + "-waveform-" + (i-1);
			var childs = updateWave.children;
			for(var j=0; j<childs.length; j++)
			{
				childs[j].dataset.now = i-1;
			}
		}
		else
		{
			break;
		}
	}
	
	waveAmp[instr].splice(idx, 1);
	sampAmp[instr].splice(idx, 1);
	triPeak[instr].splice(idx, 1);
	pulseAmt[instr].splice(idx, 1);
	phase[instr].splice(idx, 1);
	type[instr].splice(idx, 1);
	octave[instr].splice(idx, 1);
	sampleData[instr].splice(idx, 1);
	sampStart[instr].splice(idx, 1);
	
	numberOfWaves[instr]--;
}

function inputChange(val, inType, instrIdx = 0, waveIdx = 0)
{
	switch(inType)
	{
		case "wave": type[instrIdx][waveIdx] = val; waveChange(val, instrIdx, waveIdx); break;
		case "tripeak": triPeak[instrIdx][waveIdx] = Number(val); break;
		case "pulse": pulseAmt[instrIdx][waveIdx] = Number(val); break;
		case "phase": phase[instrIdx][waveIdx] = Number(val); break;
		case "attack": attack[instrIdx] = Number(val); break;
		case "decay": decay[instrIdx] = Number(val); break;
		case "sustain": sustain[instrIdx] = Number(val); break;
		case "release": release[instrIdx] = Number(val); break;
		case "notelength": keyNoteHeld[instrIdx] = Number(val); break;
		case "octave": octave[instrIdx][waveIdx] = Number(val); break;
		case "amp": waveAmp[instrIdx][waveIdx] = Number(val); break;
		case "sampAmp": sampAmp[instrIdx][waveIdx] = Number(val); break;
		case "spm": measureLength = Number(val); break;
		case "usingRoll": pianoRolls[instrIdx].usingRoll = val; break;
		case "saveslot": saveSlot = parseInt(val); break;
		case "sampstart": sampStart[instrIdx][waveIdx] = Number(val); break;
		case "divsBeat": pianoRolls[instrIdx].modifyDivs("divsBeat", parseInt(val), instrIdx); break;
		case "beatsMeasure": pianoRolls[instrIdx].modifyDivs("beatsDiv", parseInt(val), instrIdx); break;
		case "mutate": toggleMutateBlock(instrIdx, val); break;
		case "mna": pianoRolls[instrIdx].mutateNotes["A"] = val; break;
		case "mnb": pianoRolls[instrIdx].mutateNotes["B"] = val; break;
		case "mnc": pianoRolls[instrIdx].mutateNotes["C"] = val; break;
		case "mnd": pianoRolls[instrIdx].mutateNotes["D"] = val; break;
		case "mne": pianoRolls[instrIdx].mutateNotes["E"] = val; break;
		case "mnf": pianoRolls[instrIdx].mutateNotes["F"] = val; break;
		case "mng": pianoRolls[instrIdx].mutateNotes["G"] = val; break;
		case "mnas": pianoRolls[instrIdx].mutateNotes["As"] = val; break;
		case "mncs": pianoRolls[instrIdx].mutateNotes["Cs"] = val; break;
		case "mnds": pianoRolls[instrIdx].mutateNotes["Ds"] = val; break;
		case "mnfs": pianoRolls[instrIdx].mutateNotes["Fs"] = val; break;
		case "mngs": pianoRolls[instrIdx].mutateNotes["Gs"] = val; break;
		case "mutateProb": pianoRolls[instrIdx].mutateProb = Number(val); break;
		case "mpm": pianoRolls[instrIdx].mutatesPerMeasure = Number(val); break;
		case "addDeleteProportion": pianoRolls[instrIdx].addDeleteProportion = Number(val); break;
	}
}

function toggleMutateBlock(instrIdx, val)
{
	pianoRolls[instrIdx].mutateOn = val; 
	
	var mutEle = document.getElementById("mutateNotes-" + instrIdx);
	
	if(val)
	{
		mutEle.style.display = "";
	}
	else
	{
		mutEle.style.display = "none";
	}
}

function waveChange(val, instrIdx, waveIdx)
{	
	var waveSelects = document.getElementById("instr-" + instrIdx + "-" + "waveform-" + waveIdx);
	var sampRecord = waveSelects.querySelector(".sampRecord");
	var sampLoad = waveSelects.querySelector(".sampLoadFile");
	var sampAmpContain = waveSelects.querySelector(".sampAmpContainer");
	var sampStartEle = waveSelects.querySelector(".sampStartContainer");
	var tpContain = waveSelects.querySelector(".triPeakContainer");
	
	if(val == "sample")
	{
		sampRecord.style.display = "";
		sampStartEle.style.display = "";
		sampLoad.style.display = "";
		sampAmpContain.style.display = "";
	}
	else
	{
		sampRecord.style.display = "none";
		sampStartEle.style.display = "none";
		sampLoad.style.display = "none";
		sampAmpContain.style.display = "none";
	}
	
	if(val == "triangle")
	{
		tpContain.style.display = "";
	}
	else
	{
		tpContain.style.display = "none";
	}
}

function recordAudio(ele)
{
	navigator.mediaDevices.getUserMedia({audio: true}).then(function (stream)
	{
		audio_stream = stream;
		initSound();
		var msSource = context.createMediaStreamSource(audio_stream);
		
		var bufferLen = 4096;
		var numChannels = 1;
		audioNode = (context.createScriptProcessor || context.createJavaScriptNode).call(
			context, bufferLen, numChannels, numChannels);
		
		recBuffers = [];
		
		audioNode.onaudioprocess = function(e)
		{
			var inputBuffer = new Float32Array(bufferLen);
			e.inputBuffer.copyFromChannel(inputBuffer, 0);

			recBuffers.push(inputBuffer);
			recLength += inputBuffer.length;
		};
		
		msSource.connect(audioNode);
		audioNode.connect(context.destination);
		recordingTrack = msSource.mediaStream.getTracks()[0];
		
		ele.value = "Stop";
		ele.setAttribute("onclick", "recordAudioStop(this);");
	});
}

function recordAudioStop(ele)
{
	audioNode.disconnect();
	recordingTrack.stop();

	var mergedBuffer = mergeBuffers();

	var normalBuffer = [];
	for (var i = 0; i < mergedBuffer.length; i++)
	{
		normalBuffer.push(mergedBuffer[i]);
	}
	
	sampleData[ele.dataset.noi][ele.dataset.now] = normalBuffer;
	
	recToPlay(ele);
	hideSampLoad(ele.parentElement.querySelector(".sampLoadFile"));
}

function recToPlay(ele)
{
	ele.value = "Play";
	ele.setAttribute("onclick", "samplePlayback(this);");
}

function samplePlayback(ele)
{
	initSound();
	var startOffset = parseInt(sampleRate * sampStart[ele.dataset.noi][ele.dataset.now]);
	var sampData = sampleData[ele.dataset.noi][ele.dataset.now];
	
	soundArray = [];
	for(var i=0; i < sampData.length - startOffset; i++)
	{
		soundArray[i] = sampData[i + startOffset] * sampAmp[ele.dataset.noi][ele.dataset.now];
	}
	
	playBuffer();
}

function mergeBuffers()
{
    var result = new Float32Array(recLength);
    var offset = 0;
    for (var i = 0; i < recBuffers.length; i++) 
	{
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

function saveInstrData()
{	
	var saveArr = [numberOfInstruments, numberOfWaves, attack, decay, sustain, release, 
		keyNoteHeld, waveAmp, triPeak, pulseAmt, phase, type, octave, pianoRolls, 
		measureLength, sampleData, sampStart, sampAmp];
		
	var saveStr = JSON.stringify(saveArr);
	saveTxtToFile("instrumentData.txt", saveStr);

	//setCookie("instrumentData" + saveSlot, saveStr, 400);
}

function loadInstrData(loadStr)
{
	//var loadStr = getCookie("instrumentData" + saveSlot);
	
	if(loadStr == '')
	{
		return;
	}
	
	var loadArr = JSON.parse(loadStr);
	
	var tempNoi;
	var tempNow;
	
	[tempNoi, tempNow, attack, decay, sustain, release, keyNoteHeld, waveAmp, triPeak,
		pulseAmt, phase, type, octave, pianoRolls, measureLength, sampleData, sampStart, sampAmp] = loadArr;
		
	document.getElementById('secMeasure').value = measureLength;
		
	numberOfInstruments = 0;
	numberOfWaves = [];
		
	instrumentBox.innerHTML = '';
	
	for(var i=0; i<tempNoi; i++)
	{
		addInstrument(false);
		
		initRollFuncs(pianoRolls[i]);
		
		var instrEle = document.getElementById("instrument-" + i);
		
		instrEle.querySelector('.attack').value = attack[i];
		instrEle.querySelector('.decay').value = decay[i];
		instrEle.querySelector('.sustain').value = sustain[i];
		instrEle.querySelector('.release').value = release[i];
		instrEle.querySelector('.notelength').value = keyNoteHeld[i];
		
		var tempUsingRoll = pianoRolls[i].usingRoll;
		addPianoRoll(i, pianoRolls[i].usingRoll);
		instrEle.querySelector('.timeInfoInputBM').value = pianoRolls[i].beatsMeasure;
		instrEle.querySelector('.timeInfoInputDB').value = pianoRolls[i].divsBeat;
		
		instrEle.querySelector('.ranMut').checked = pianoRolls[i].mutateOn;
		
		instrEle.querySelector('.asbox').checked = pianoRolls[i].mutateNotes["As"];
		instrEle.querySelector('.csbox').checked = pianoRolls[i].mutateNotes["Cs"];
		instrEle.querySelector('.dsbox').checked = pianoRolls[i].mutateNotes["Ds"];
		instrEle.querySelector('.fsbox').checked = pianoRolls[i].mutateNotes["Fs"];
		instrEle.querySelector('.gsbox').checked = pianoRolls[i].mutateNotes["Gs"];
		instrEle.querySelector('.abox').checked = pianoRolls[i].mutateNotes["A"];
		instrEle.querySelector('.bbox').checked = pianoRolls[i].mutateNotes["B"];
		instrEle.querySelector('.cbox').checked = pianoRolls[i].mutateNotes["C"];
		instrEle.querySelector('.dbox').checked = pianoRolls[i].mutateNotes["D"];
		instrEle.querySelector('.ebox').checked = pianoRolls[i].mutateNotes["E"];
		instrEle.querySelector('.fbox').checked = pianoRolls[i].mutateNotes["F"];
		instrEle.querySelector('.gbox').checked = pianoRolls[i].mutateNotes["G"];
		
		instrEle.querySelector('.mpmClass').value = pianoRolls[i].mutatesPerMeasure;
		instrEle.querySelector('.mpClass').value = pianoRolls[i].mutateProb;
		instrEle.querySelector('.addDeleteProportion').value = pianoRolls[i].addDeleteProportion;
		
		if(pianoRolls[i].mutateOn)
		{
			instrEle.querySelector('.mutateNotes').style = "";
		}
		pianoRolls[i].updateClearButtonPosition(instrEle);
		
		pianoRolls[i].usingRoll = tempUsingRoll;
		
		if(!pianoRolls[i].usingRoll)
		{
			hidePianoRoll(i);
		}
		
		for(var j=0; j<tempNow[i]; j++)
		{
			addWaveInputs(i, false);
			
			var waveEle = document.getElementById("instr-" + i + "-waveform-" + j);
			
			waveChange(type[i][j], i, j);
			
			waveEle.querySelector('.wavetype').value = type[i][j];
			waveEle.querySelector('.octave').value = octave[i][j];
			waveEle.querySelector('.amplitude').value = waveAmp[i][j];
			waveEle.querySelector('.sampAmp').value = sampAmp[i][j];
			waveEle.querySelector('.pulse').value = pulseAmt[i][j];
			waveEle.querySelector('.tripeak').value = triPeak[i][j];
			waveEle.querySelector('.phase').value = phase[i][j];
			waveEle.querySelector('.sampstart').value = sampStart[i][j];
			
			if(sampleData[i][j].length > 0)
			{
				recToPlay(waveEle.querySelector('.sampRecord'));
				hideSampLoad(waveEle.querySelector(".sampLoadFile"));
			}
		}
	}
	
	for(var i=0; i<instrumentSelected.length; i++)
	{
		useInstrument(0, i);
	}
}

function loadSample(data, ele)
{
	var view = new Int16Array(data);

	if(view[0] != 18770)
	{
		return;
	}
	
	var dataStart = view.indexOf(9696);
	
	var sampArr = [];
	
	for(var i=dataStart+1; i < view.length - 1; i+=2)
	{
		var val = (view[i] + view[i+1]) / 65536;
		var idx = (i - (dataStart+1)) / 2;
		
		sampArr[idx] = val;
	}
	
	sampleData[ele.dataset.noi][ele.dataset.now] = sampArr;
	
	var waveEle = document.getElementById("instr-" + ele.dataset.noi + "-waveform-" + ele.dataset.now);
	recToPlay(waveEle.querySelector('.sampRecord'));
	
	hideSampLoad(waveEle.querySelector(".sampLoadFile"));
}

function hideSampLoad(ele)
{
	ele.style.display = "none";
	ele.classList.remove("sampLoadFile");
}

function synthKey(keyIdx, freq)
{
	this.keyIdx = keyIdx;
	this.held = false;
	this.position = 0;
	this.frequency = freq;
}

function rollObj(hei, db, bm)
{
	this.usingRoll = false;
	this.mutateOn = false;
	
	this.mutateProb = 100;
	this.mutatesPerMeasure = 1;
	this.addDeleteProportion = 50;

	this.divsBeat = db;
	this.beatsMeasure = bm;
	
	this.barCounter = 0;
	if(rollsPlaying && pianoRolls.length > 0)
	{
		this.barCounter = pianoRolls[0].barCounter;
	}
	
	this.height = hei;
	this.width = db * bm;
	
	this.viewOffset = 39;
	
	this.rollData = [];
	
	for(var i=0; i<this.height; i++)
	{
		this.rollData[i] = [];
		for(var j=0; j<this.width; j++)
		{
			this.rollData[i][j] = 0;
		}
	}
	
	this.mutateNotes = { 
		A: true, 
		B: true,
		C: true,
		D: true,
		E: true,
		F: true,
		G: true,
		As: false,
		Cs: false,
		Ds: false,
		Fs: false,
		Gs: false
	}
}

function initRollFuncs(roll)
{
	roll.modifyDivs = function(type, val, idx)
	{
		if(Number(val) <= 0)
		{
			return;
		}
		switch(type)
		{
			case "divsBeat": this.divsBeat = Number(val); break;
			case "beatsDiv": this.beatsMeasure = Number(val); break;
		}
		
		var prevWidth = this.width;
		this.width = this.divsBeat * this.beatsMeasure;
		var widthDiff = prevWidth - this.width;
		
		if(widthDiff > 0) //delete cells
		{
			for(var i=0; i<this.height; i++)
			{
				for(var j=0; j<widthDiff; j++)
				{
					this.rollData[i].pop();
				}
			}
		}
		else if(widthDiff < 0) //add cells
		{
			for(var i=0; i<this.height; i++)
			{
				for(var j=prevWidth; j<this.width; j++)
				{
					this.rollData[i][j] = 0;
				}
			}
		}
		
		var instrEle = document.getElementById("instrument-" + idx);
		this.updateClearButtonPosition(instrEle);
		
		generatePianoTable(idx);
	}
	
	roll.updateClearButtonPosition = function(instrEle)
	{
		var clearB = instrEle.querySelector(".clearRolls");
		
		var clearPos = (this.width - 1) * 23 + this.beatsMeasure - 49;
		clearB.style.marginLeft = Math.max(0, clearPos) + "px";
	}
}

function initialize()
{
	loadSavedFile(fetch("song.txt"));
	addInstrument();
	for(var i=0; i<instrumentSelected.length; i++)
	{
		useInstrument(0, i);
	}
	
	setInterval( updateBuffer, 1000 / ups);
	setInterval( rollUpdater, 1000 / rUps );
}

function initSound()
{
	if(!acInit)
	{
		context = new AudioContext();
		initKeys();
		acInit = true;
		
		gainNode = context.createGain();
		gainNode.connect(context.destination);
	}
}

function initKeys()
{
	var numNotes = 88;
	var refPitch = 440;
	var refIdx = 48;
	var twoToOneTwelfth = Math.pow(2, 1/12);
	
	for(var i=0; i<numNotes; i++)
	{
		var freq = refPitch * Math.pow(twoToOneTwelfth, i - refIdx);
		notes[i] = new synthKey(i, freq);
	}
}

function clearBuffer()
{
	soundArray = [];
}

function playSound()
{
	initSound();
	
	clearBuffer();
	
	var c = 39;  //im just specifying the notes I need
	var d = 41;
	var f = 44;
	var g = 46;
	var gs = 47;
	var a = 48;
	var d2 = 53;
	
	var melody = [d,-1,d,-1,d2,-1,-1,-1,a,a,-1,-1,-1,-1,gs,gs,-1,-1,g,
				 -1,-1,-1,f,f,f,f,f,f,d,d,f,f,f,f,g,g,g,-1];
				 
	var noteLength = 1/16;
	for(var i=0; i<melody.length; i++)
	{
		appendNote(melody[i], noteLength);
	}

	playBuffer();
}

function appendNote(keyIdx, noteLength)
{
	if(keyIdx == -1)
	{
		makeSilence(noteLength);
		return;
	}
	
	var sk = notes[keyIdx];
	
	makeWaveform(sk, noteLength);
}

function makeWaveform(sKey, noteLength)
{
	var sxn = sampleRate * noteLength;
	var instr = instrumentSelected[keySetUsing];
	
	var freq = [];
	var period = [];
	var pulsePd = [];
	var pphase = [];
	var tp2 = [];
	var itp2 = [];
	var samp = []
	
	for(var w=0; w<numberOfWaves[instr]; w++)
	{
		var sfreq = sKey.frequency;
		var octMult = Math.pow(2, octave[instr][w] - 3);
		freq[w] = sfreq * octMult;
		
		period[w] = sampleRate / freq[w];
		pulsePd[w] = period[w] * pulseAmt[instr][w];
		
		pphase[w] = parseInt(phase[instr][w] * sxn);
		
		tp2[w] = triPeak[instr][w] / 2;
		itp2[w] = 1 - tp2[w];
	}
		
	for(var i=0; i < sxn; i++)
	{
		var sampleSum = 0;
		for(var w=0; w<numberOfWaves[instr]; w++)
		{
			var oldI = i;
			i = (i + pphase[w]) % period[w];
			
			var perc = (i % period[w]) / pulsePd[w];
			samp = 0;
			if(i % period[w] < pulsePd[w] )
			{
				switch(type[instr][w])
				{
					case "sine": samp = Math.sin( ((i % period[w]) / pulsePd[w]) * 2 * Math.PI ); break;
					case "square": samp = parseInt(i % period[w] / (pulsePd[w] / 2)) * 2 - 1; break;
					case "triangle": 
						if(perc < tp2[w])
						{
							samp = perc / tp2[w];
						}
						else if(perc < itp2[w])
						{
							var perc2 = perc - tp2[w];
							var subPer = perc2 / (itp2[w] - tp2[w]);
							samp = subPer * -2 + 1;
						}
						else
						{
							samp = ((perc - itp2[w]) / tp2[w]) - 1;
						}
						break;
					case "noise": samp = Math.random()*2 - 1; break;
					case "sample":
						var sampData = sampleData[instr][w];
						var refFreq = 349.2282314330038;
						
						var sampPlayRate = freq[w] / refFreq;
						var startOffset = sampleRate * sampStart[instr][w];
						var sampIdx = parseInt(startOffset + oldI * sampPlayRate);
						
						if(sampIdx < sampData.length)
						{
							samp = sampData[sampIdx];
						}
						else
						{
							samp = 0;
						}
						
						break;
				}
			}
			
			sampleSum += samp * waveAmp[instr][w] * sampAmp[instr][w];
			
			i = oldI;
		}

		var amp = 1 / Math.sqrt(numberOfWaves[instr]);
		var useSamp = sampleSum * amp;
		appendSample( useSamp, i / sxn );
	}
}

function minMax(val, min, max)
{
    return Math.min(Math.max(min, val), max);
}

function appendSample(value, thruNote)
{
	if(adsrOn)
	{
		value = adsr(value, thruNote);
	}
	value = minMax(value, -1, 1);
	soundArray.push(value);
}

function adsr(value, thruNote)
{	
	var instr = instrumentSelected[keySetUsing];

	if(thruNote < attack[instr])
	{
		var thruAttack = thruNote / attack[instr];
		value *= thruAttack;
	}
	else if(thruNote < (attack[instr] + decay[instr]))
	{
		var thruDecay = (thruNote - attack[instr]) / decay[instr];
		var susValue = sustain[instr] * value;
		
		value = (1 - thruDecay) * (value - susValue) + susValue;
	}
	else if(thruNote > (1 - release[instr]))
	{
		var thruRelease = (thruNote - (1 - release[instr])) / release[instr];
		var susValue = sustain[instr] * value;
		
		value = (1 - thruRelease) * susValue;
	}
	else
	{
		value *= sustain[instr];
	}

	return value;
}

function makeSilence(noteLength)
{
	var sxn = sampleRate * noteLength
	for(var i=0; i < sampleRate * noteLength; i++)
	{
		var thruNote = i / sxn;
		appendSample(0, thruNote);
	}
}

function playBuffer()
{	
	if(soundArray.length <= 0)
	{
		return;
	}

	var arrayBuffer = context.createBuffer(2, soundArray.length, context.sampleRate);
	
	for(var channel = 0; channel < arrayBuffer.numberOfChannels; channel++)
	{
		var samples = arrayBuffer.getChannelData(channel);
		for(var i=0; i < arrayBuffer.length; i++)
		{
			samples[i] = soundArray[i];
		}
	}
	
	var source = context.createBufferSource();
	source.buffer = arrayBuffer;
	source.connect(gainNode);
	source.start(context.currentTime);
}

function playNote(note, notelength = "empty")
{
	if(acInit)
	{
		clearBuffer();
		
		if(notelength == "empty")
		{
			notelength = keyNoteHeld[instrumentSelected[keySetUsing]];
		}
		
		if(numberOfWaves[instrumentSelected[keySetUsing]] > 0)
		{
			appendNote(note, notelength);
			playBuffer();
		}
	}
}

function holdNote(keyNum)
{
	if(heldNotes.indexOf(keyNum) == -1)
	{
		heldNotes.push(keyNum);
		notes[keyNum].held = true;
		notes[keyNum].position = 0;
	}
}

function releaseNote(keyNum)
{
	var hIdx = heldNotes.indexOf(keyNum);
	heldNotes.splice(hIdx, 1);
	notes[keyNum].held = false;
	notes[keyNum].position = 0;
}

function keyCodeToIdx(keyCode)
{
	keySetUsing = 0;
	
	switch(keyCode)
	{
		case 90:  return 0;   //Z
		case 83:  return 1;   //S
		case 88:  return 2;   //X
		case 68:  return 3;   //D
		case 67:  return 4;   //C
		case 86:  return 5;   //V
		case 71:  return 6;   //G
		case 66:  return 7;   //B
		case 72:  return 8;   //H
		case 78:  return 9;   //N
		case 74:  return 10;  //J
		case 77:  return 11;  //M
		case 188: return 12;  //,
	}
	
	keySetUsing = 1;
	
	switch(keyCode)
	{
		case 87:  return 0;   //W
		case 51:  return 1;   //3
		case 69:  return 2;   //E
		case 52:  return 3;   //4
		case 82:  return 4;   //R
		case 84:  return 5;   //T
		case 54:  return 6;   //6
		case 89:  return 7;   //Y
		case 55:  return 8;   //7
		case 85:  return 9;   //U
		case 56:  return 10;  //8
		case 73:  return 11;  //I
		case 79:  return 12;  //O
	}
	
	return -1;
}


function updateBuffer()
{
	paintKeyboard();
}

function paintKeyboard()
{

}

function ctxDrawLine(x1, y1, x2, y2)
{
    ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function setCookie(cname, cvalue, exdays) 
{
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  let cookieStr = cname + "=" + cvalue + ";" + expires + ";path=/";
  document.cookie = cookieStr;
}

function getCookie(cname) 
{
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function loadSavedFile(files)
{
	var reader = new FileReader();
	
	reader.onload = function(e)
	{
		var fileContents = e.target.result;
		loadInstrData(fileContents);
	}
	
	reader.readAsText(files[0]);
}

function loadSavedSampleFile(files, ele)
{
	var reader = new FileReader();
	
	reader.onload = function(e)
	{
		var fileContents = e.target.result;
		loadSample(fileContents, ele);
	}
	
	reader.readAsArrayBuffer(files[0]);
}

function saveTxtToFile(fileName, textData) 
{
  const blobData = new Blob([textData], { type: 'text/plain' });
  const urlToBlob = window.URL.createObjectURL(blobData);

  const a = document.createElement('a');
  a.style.setProperty('display', 'none');
  document.body.appendChild(a);
  a.href = urlToBlob;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(urlToBlob);
  a.remove();
}

//window.onclick = playSound;
initialize();
