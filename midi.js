const fs = require('fs');
const parse = require('midi-file-parser');

const fname = process.argv[4] ? process.argv[4] : 'octave_demo.mid';
const file = fs.readFileSync(fname, 'binary');
const parsed = parse(file);
fs.writeFileSync(fname + '.json', JSON.stringify(parsed, ' ', 4));

const { Zz } = require('./notes');

const song = {
    tempo: 60000,
    notes: []
};

const notes = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

let playing = null;
for(let event of parsed.tracks[process.argv[5] != null ? process.argv[5] : 0]){
    if(event.subtype == 'noteOn' || event.subtype == 'noteOff'){
        const note = (event.noteNumber - 24) % 12;
        const octave = Math.floor((event.noteNumber - 24) / 12);

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

song.notes = song.notes.map(x => {
    x[2] *= 307.692;
    return x;
});

song.notes.push([ -1, -1, -1 ]);

// fs.writeFileSync('n.json', JSON.stringify(song, ' ', 4));

const Floppy = require('./floppy');
const drive = new Floppy(parseInt(process.argv[2]), parseInt(process.argv[3]));
drive.playSong(song.notes, song.tempo);