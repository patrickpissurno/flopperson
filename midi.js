const fs = require('fs');
const parse = require('midi-file-parser');

const file = fs.readFileSync('imperial_march.mid', 'binary');
const parsed = parse(file);

const { Zz } = require('./notes');

const song = {
    tempo: 60000,
    notes: []
};

const notes = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

let playing = null;
for(let event of parsed.tracks[2]){
    if(event.subtype == 'noteOn' || event.subtype == 'noteOff'){
        const note = (event.noteNumber - 24) % 12;
        const octave = 3;
        // console.log('PLAY: ' + event.subtype + '. Note: ' + notes[note]);

        if(event.subtype == 'noteOn'){
            if(playing)
                song.notes[song.notes.length - 1][2] = event.deltaTime;
            else
                song.notes.push([ Zz, 0, event.deltaTime ]);

            song.notes.push([ note, octave, 0 ]);

            playing = { note, deltaTime: event.deltaTime };

            console.log(notes[note]);
        }
        else {
            song.notes[song.notes.length - 1][2] += event.deltaTime;
            playing = null;
        }
    }
}

// console.log(song);
const Floppy = require('./floppy');
const drive = new Floppy(parseInt(process.argv[2]), parseInt(process.argv[3]));
drive.playSong(song.notes, song.tempo);