const gpio = require('rpi-gpio');
gpio.setup(1, gpio.DIR_HIGH, (err) => {
    console.log('HERE (2)');
    if(err)
        throw err;
        
    gpio.write(1, true, () => {
        console.log('HERE (2)');
    });
});