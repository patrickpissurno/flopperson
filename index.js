const { Gpio } = require('onoff');
const pin17 = new Gpio(17, 'out');
pin17.writeSync(1);