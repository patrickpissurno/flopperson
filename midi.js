const fs = require('fs');
const parse = require('midi-file-parser');

const file = fs.readFileSync(process.argv[4] ? process.argv[4] : 'octave_demo.mid', 'binary');
const parsed = parse(file);
// fs.writeFileSync('octave_demo.json', JSON.stringify(parsed, ' ', 4));

const { Zz } = require('./notes');

const song = {
    tempo: 60000,
    notes: []
};

const notes = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

let playing = null;
for(let event of parsed.tracks[0]){
    if(event.subtype == 'noteOn' || event.subtype == 'noteOff'){
        const note = (event.noteNumber - 24) % 12;
        const octave = Math.floor((event.noteNumber - 24) / 12);
        // console.log('PLAY: ' + event.subtype + '. Note: ' + notes[note]);

        if(event.subtype == 'noteOn'){
            if(playing)
                song.notes[song.notes.length - 1][2] = event.deltaTime;
            else if(event.deltaTime > 0)
                song.notes.push([ Zz, 0, event.deltaTime ]);

            song.notes.push([ note, octave, 0 ]);

            playing = { note, deltaTime: event.deltaTime };
        }
        else {
            song.notes[song.notes.length - 1][2] += event.deltaTime;
            playing = null;
        }
    }
}

song.notes.push([ -1, -1, -1 ]);

// fs.writeFileSync('n.json', JSON.stringify(song, ' ', 4));

// console.log(song);
const Floppy = require('./floppy');
const drive = new Floppy(parseInt(process.argv[2]), parseInt(process.argv[3]));
drive.playSong(song.notes, song.tempo);