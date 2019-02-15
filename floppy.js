const { promisify } = require('util');
const { Gpio } = process.platform == 'linux' ? require('onoff') : { Gpio: function(){ this.write = (err, cb) => cb() } };
const nanotimer = require('nanotimer');
const timestamp = new Date();

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
    [ 104650,110873,117466,124451,131851,139691,147998,156798,166122,176000,186466,197553 ],
    [ 209300,221746,234931,248901,263702,279382,295995,313596,332243,352000,372931,395106 ]
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
for (let octave = 0; octave < freq.length; octave++)
    for (let note = 0; note < freq[0].length; note++)
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

        this._timer1 = new nanotimer();
        this._timer2 = new nanotimer();

        this.sleep = (ms) => {
            // return new Promise(resolve => setTimeout(resolve, ms));
            return new Promise(resolve => this._timer1.setTimeout(resolve, '', ms + 'm'));
        };
        this.microsleep = (us) => {
            return new Promise(resolve => this._timer2.setTimeout(resolve, '', us + 'u'));
        };

        this.resetMotor();
    }

    async resetMotor(){
        await this.directionPin.write(0);
        for(let i = 0; i < 10; i++){
            await this.stepPin.write(1);
            await this.stepPin.write(0);
            await this.sleep(1);
        }
        
        await this.directionPin.write(1);
        
        for(let i = 0; i < 10; i++){
            await this.stepPin.write(1);
            await this.stepPin.write(0);
            await this.sleep(1);
        }

        await this.sleep(400);
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
            await this.microsleep(pause);
        }
    }

    async rest(length){
        const endTime = millis() + length;
        while (millis() < endTime)
            await this.sleep(5);
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