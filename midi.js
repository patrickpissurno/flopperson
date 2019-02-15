const fs = require('fs');
const parse = require('midi-file-parser');

async function parseMidi(fname = 'octave_demo.mid', track_id = -1, opts = { transpose: true, trim: true, filter: true, speedScale: true, forcePlayingAllNotes: false }){
    const file = fs.readFileSync(fname, 'binary');
    const parsed = parse(file);

    const { Zz } = require('./notes');

    const song = {
        tempo: 60000,
        notes: []
    };

    /**
     *  Parse tempo and time signature from the midiJson
     *  from: https://github.com/Tonejs/MidiConvert/blob/master/src/Header.js
     */
    function parseHeader(data){
        const ret = {
            PPQ : data.header.ticksPerBeat
        };
        
        for (let track of data.tracks)
            for (let datum of track)
                if (datum.type === "meta"){
                    if (datum.subtype === "timeSignature")
                        ret.timeSignature = [datum.numerator, datum.denominator];
                    else if (datum.subtype === "setTempo" && !ret.bpm)
                        ret.bpm = 60000000 / datum.microsecondsPerBeat;
                }
                
        ret.bpm = ret.bpm || 120;
        return ret;
    }

    /**
     *  Converts ticks to seconds
     *  from: https://github.com/Tonejs/MidiConvert/blob/master/src/Util.js
     */
    function ticksToSeconds(ticks, header){
        return (60 / header.bpm) * (ticks / header.PPQ);
    }

    function getFirstNonEmptyTrack(){
        for(let i = 0; i < parsed.tracks.length; i++)
            if(parsed.tracks[i].filter(event => event.subtype == 'noteOn').length > 0)
                return i;
        return 0;
    }

    let transposeDown = false;
    let playing = null;
    for(let event of parsed.tracks[track_id !== -1 ? track_id : getFirstNonEmptyTrack()]){
        if(event.subtype == 'noteOn' || event.subtype == 'noteOff'){
            const note = (event.noteNumber - 24) % 12;
            let octave = Math.floor((event.noteNumber - 24) / 12);
            if(octave > 3 && opts.transpose)
                transposeDown = true;

            if(event.subtype == 'noteOn'){
                if(playing){
                    if(!opts.forceAllNotes){
                        song.notes[song.notes.length - 1][2] += event.deltaTime;
                        continue;
                    }
                    song.notes[song.notes.length - 1][2] = event.deltaTime;
                }
                else if(event.deltaTime > 0){
                    if(song.notes[song.notes.length - 1][2] == 0)
                        song.notes[song.notes.length - 1][2] = event.deltaTime;
                    else
                        song.notes.push([ Zz, 0, event.deltaTime ]);
                }       

                song.notes.push([ note, octave, 0 ]);

                playing = { note, deltaTime: event.deltaTime };
            }
            else {
                song.notes[song.notes.length - 1][2] += event.deltaTime;
                playing = null;
            }
        }
    }

    if(song.notes.length == 0)
        return console.log('empty track');

    const header = parseHeader(parsed);
    song.notes = song.notes.map(x => {
        x[2] = ticksToSeconds(x[2], header) * 1000;

        //autotranspose feature
        if(transposeDown && opts.transpose)
            x[1] = x[1] > 0 ? x[1] - 1 : 0;
        if(x[1] > 4)
            x[1] = 4;
        return x;
    });

    //autotrim feature
    if(opts.trim){
        let remove = -1;
        for(let i = 0; i < song.notes.length; i++)
            if(song.notes[i][0] == Zz)
                remove = i + 1;
            else
                break;
        if(remove != -1)
            song.notes.splice(0, remove);
    }

    //filter too-quick notes feature
    if(opts.filter){
        song.notes = song.notes.filter(x => x[2] >= 60);

        //auto scale BPM so that tracks play clearer
        if(opts.speedScale){
            let lowest = song.notes.reduce((prev, item) => item[2] < prev[2] ? item : prev)[2];
            if(lowest < 80)
                song.notes = song.notes.map(x => {
                    x[2] *= 80 / lowest;
                    return x;
                })
        }
    }

    song.notes.push([ -1, -1, -1 ]);

    return song;
}

module.exports = { parseMidi };