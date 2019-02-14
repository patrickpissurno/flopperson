const { promisify } = require('util');
const { Gpio } = require('onoff');
const timer1 = new (require('nanotimer'))();
const timer2 = new (require('nanotimer'))();
const timestamp = new Date();

function sleep(ms) {
    // return new Promise(resolve => setTimeout(resolve, ms));
    return new Promise(resolve => timer1.setTimeout(resolve, '', ms + 'm'));
}
function microsleep(us) {
    return new Promise(resolve => timer2.setTimeout(resolve, '', us + 'u'));
}

function millis(){
    return new Date() - timestamp;
}

const {
    Cn, Cs, Dn, Ds, En, Fn, Fs, Gn, Gs, An, As, Bn, Zz,
    Bs, Df, Dn2, Ef, En2, Es, Gf, Gn2, Af, An2, Bf, Bn2, Zz2
} = require('./notes');

/**
 * Frequencies in hundredths of Hz, e.g. middle A = 44000
 * 4 Octaves with 12 notes per octave, i.e. C to B
 */
const freq = [
    [ 13081,13859,14683,15556,16481,17461,18500,19600,20765,22000,23308,24694 ],
    [ 26163,27718,29366,31113,32963,34923,36999,39200,41530,44000,46616,49388 ],
    [ 52325,55437,58733,62225,65925,69846,73999,78399,83061,88000,93233,98777 ],
    [ 104650,110873,117466,124451,131851,139691,147998,156798,166122,176000,186466,197553 ]
];

/**
 * Frequency (in Hz) is converted to Floppy Delay using the formula:
 *    314000 / frequency = floppy delay
 * so middle A = 314000 / 440 = 714
 *
 * Lowest realistic note is delay = 1550
 * Highest realistic note is delay = 210
 */
const floppyConv = 31400000;

// Calculate all our floppy delays at the start
const floppyDelay = JSON.parse(JSON.stringify(freq));
for (let octave = 0; octave < 4; octave++)
    for (let note = 0; note < 12; note++)
        floppyDelay[octave][note] = floppyConv / freq[octave][note];

const notesNames = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

class Floppy {
    constructor(directionPin, stepPin){
        this.directionPin = new Gpio(directionPin, 'out');
        this.stepPin = new Gpio(stepPin, 'out');
        this.directionPin.write = promisify(this.directionPin.write);
        this.stepPin.write = promisify(this.stepPin.write);

        this.resetMotor();
    }

    async resetMotor(){
        await this.directionPin.write(0);
        for(let i = 0; i < 10; i++){
            await this.stepPin.write(1);
            await this.stepPin.write(0);
            await sleep(1);
        }
        
        await this.directionPin.write(1);
        
        for(let i = 0; i < 10; i++){
            await this.stepPin.write(1);
            await this.stepPin.write(0);
            await sleep(1);
        }

        await sleep(400);
    }

    async playNote(note, octave, length){
        console.log('Note: ' + notesNames[note] + (octave + 1));   

        let dir = 1;
        const pause = floppyDelay[octave][note] * 10;
    
        const endTime = millis() + length;
        while (millis() < endTime){
            await this.directionPin.write(dir);
            
            //dir = 1 ? 0 : 1
            dir = 1 - dir;
    
            await this.stepPin.write(1);
            await this.stepPin.write(0);
            await microsleep(pause);
        }
    }

    async rest(length){
        const endTime = millis() + length;
        while (millis() < endTime)
            await sleep(5);
    }

    /**
     * song[note_num][note, octave, length]
     */
    async playSong(song, tempo)
    {
        // Convert tempo in BPM to millisecs
        const noteLen = 60000 / tempo;

        for (let i = 0; song[i][0] != -1; i++){
            const length = song[i][2] * noteLen;

            if (song[i][0] == Zz)
                await this.rest(length);
            else {
                await this.playNote(song[i][0], song[i][1], (7 * length) / 8);
                await this.rest(length / 8);
            }
        }
    }
}

module.exports = Floppy;