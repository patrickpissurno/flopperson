const fs = require('fs');
const parse = require('midi-file-parser');

const fname = process.argv[4] ? process.argv[4] : 'octave_demo.mid';
const file = fs.readFileSync(fname, 'binary');
const parsed = parse(file);
// fs.writeFileSync(fname + '.json', JSON.stringify(parsed, ' ', 4));

const { Zz } = require('./notes');

const song = {
    tempo: 60000,
    notes: []
};

const notes = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

/**
 *  Parse tempo and time signature from the midiJson
 *  from: https://github.com/Tonejs/MidiConvert/blob/master/src/Header.js
 */
function parseHeader(data){
	var ret = {
		PPQ : data.header.ticksPerBeat
	}
	for (var i = 0; i < data.tracks.length; i++){
		var track = data.tracks[i]
		for (var j = 0; j < track.length; j++){
			var datum = track[j]
			if (datum.type === "meta"){
				if (datum.subtype === "timeSignature"){
					ret.timeSignature = [datum.numerator, datum.denominator]
				} else if (datum.subtype === "setTempo"){
					if (!ret.bpm){
						ret.bpm = 60000000 / datum.microsecondsPerBeat
					}
				}
			}
		}
	}
	ret.bpm = ret.bpm || 120
	return ret
}

/**
 *  Converts ticks to seconds
 *  from: https://github.com/Tonejs/MidiConvert/blob/master/src/Util.js
 */
function ticksToSeconds(ticks, header){
	return (60 / header.bpm) * (ticks / header.PPQ);
}

let transposeDown = false;
let playing = null;
for(let event of parsed.tracks[process.argv[5] != null ? process.argv[5] : 0]){
    if(event.subtype == 'noteOn' || event.subtype == 'noteOff'){
        const note = (event.noteNumber - 24) % 12;
        let octave = Math.floor((event.noteNumber - 24) / 12);
        if(octave > 3)
            transposeDown = true;

        if(event.subtype == 'noteOn'){
            if(playing)
                song.notes[song.notes.length - 1][2] = event.deltaTime;
            else if(event.deltaTime > 0)
                song.notes.push([ Zz, 0, event.deltaTime ]);

            // console.log('Note: ' + notes[note] + octave);            

            song.notes.push([ note, octave, 0 ]);

            playing = { note, deltaTime: event.deltaTime };
        }
        else {
            song.notes[song.notes.length - 1][2] += event.deltaTime;
            playing = null;
        }
    }
}

const header = parseHeader(parsed);
song.notes = song.notes.map(x => {
    x[2] = ticksToSeconds(x[2], header) * 1000;

    //autotranspose feature
    if(transposeDown)
        x[1] = x[1] > 0 ? x[1] - 1 : 0;
    if(x[1] > 3)
        x[1] = 3;
    return x;
});

//autotrim feature
let remove = -1;
for(let i = 0; i < song.notes.length; i++)
    if(song.notes[i][0] == Zz)
        remove = i;
    else
        break;
if(remove != -1)
    song.notes.splice(0, i);

song.notes.push([ -1, -1, -1 ]);

// fs.writeFileSync('n.json', JSON.stringify(song, ' ', 4));

const Floppy = require('./floppy');
const drive = new Floppy(parseInt(process.argv[2]), parseInt(process.argv[3]));
drive.playSong(song.notes, song.tempo);