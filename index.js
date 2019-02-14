const { Gpio } = require('onoff');
const pin17 = new Gpio(17, 'out');
const pin18 = new Gpio(18, 'out');
pin17.writeSync(1);
pin18.writeSync(1);