const gpio = require('rpi-gpio');
(async () => {
    await gpio.setup('1', gpio.DIR_HIGH);
    await gpio.write('1', true);
    console.log('DONE');
})();