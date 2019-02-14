const gpio = require('rpi-gpio');
gpio.setup(1, gpio.DIR_HIGH, (err) => {
    if(err)
        throw err;

    gpio.write(1, true);
});