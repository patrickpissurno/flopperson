const { Gpio } = require('onoff');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Floppy {
    constructor(directionPin, stepPin){
        this.directionPin = new Gpio(directionPin, 'out');
        this.stepPin = new Gpio(stepPin, 'out');

        this.resetMotor();
    }

    async resetMotor(){
        this.directionPin.writeSync(0);
        for(let i = 0; i < 10; i++){
            this.stepPin.writeSync(1);
            this.stepPin.writeSync(0);
            await sleep(1);
        }
        
        this.directionPin.writeSync(1);
        
        for(let i = 0; i < 10; i++){
            this.stepPin.writeSync(1);
            this.stepPin.writeSync(0);
            await sleep(1);
        }

        await sleep(400);
    }
}

const drive1 = new Floppy(17, 18);