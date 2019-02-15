const program = require('commander');
const fs = require('fs');
const Floppy = require('./floppy');
const { parseMidi } = require('./midi');

function error(str){
    console.error(str);
    process.exit(1);
}

program
    .arguments('[midi_file]')
    .option('-d, --direction-pin <pin>[,pin2,pin3...]', 'Floppy direction pins (comma-separated list)')
    .option('-s, --step-pin <pin>[,pin2,pin3...]', 'Floppy step pins (comma-separated list)')
    .option('-t, --track <track>[,track2,track3...]', 'The MIDI track\'s id (comma-separated list)')
    .option('--no-transpose', 'Disables auto-transpose feature')
    .option('--no-trim', 'Disables auto-trim feature')
    .option('--no-filter', 'Disables too-quick note filter feature')
    .option('--no-speed-scale', 'Disables track speed scale feature')
    .option('--demo [song]', 'The demo song to be played')
    .option('--config <filename>', 'Load from config file')
    .action(function(midi_file) {
        // if(!midi_file && !program.demo && !program.config)
        //     return error('Please either specify a MIDI file or pass the --demo flag or pass the --config flag');

        if((midi_file ? 1 : 0) + (program.demo ? 1 : 0) + (program.config ? 1 : 0) >= 2)
            return error('Please either specify a MIDI file or pass the --demo flag or pass the --config flag');

        if(program.config)
            return error('Not implemented yet');

        if(!program.directionPin)
            return error('Please specify at least one direction pin');
        
        if(program.directionPin.split(',').map(x => parseInt(x)).filter(x => isNaN(x) || x < 0).length > 0)
            return error('Please specify valid direction pin');
        program.directionPin = program.directionPin.split(',').map(x => parseInt(x));

        if(!program.stepPin)
            return error('Please specify at least one step pin');

        if(program.stepPin.split(',').map(x => parseInt(x)).filter(x => isNaN(x) || x < 0).length > 0)
            return error('Please specify valid step pin');
        program.stepPin = program.stepPin.split(',').map(x => parseInt(x));
        if(program.stepPin.length != program.directionPin.length)
            return error('The number of step pins should match the number of direction pins');

        if(program.track){
            if(program.track.split(',').map(x => parseInt(x)).filter(x => isNaN(x) || x < 0).length > 0)
                return error('Please specify valid track');
            program.track = program.track.split(',').map(x => parseInt(x));
            if(program.track.length != program.stepPin.length)
                return error('The number of tracks should match the number of floppy disks');
        }
        else
            program.track = program.stepPin.map(x => -1);

        if(midi_file && !fs.existsSync(midi_file))
            return error('MIDI file doesn\'t exist');

        if(midi_file)
            program.midi_file = midi_file;

        const pins = [];
        for(let i = 0; i < program.directionPin.length; i++)
            pins.push({ direction: program.directionPin[i], step: program.stepPin[i] });

        if(program.demo)
            playDemo(pins, program.demo == true ? undefined : program.demo);
        else
            playMidi(pins, program.midi_file, program);
    })
    .parse(process.argv);

function playDemo(pins, demo = 'imperial_march'){
    switch(demo.toLowerCase()){
        case 'imperial_march':
        case 'lacie':
            const song = require('./hardcoded_songs/' + demo.toLowerCase());
            const drive = new Floppy(pins[0].direction, pins[0].step);
            drive.playSong(song.notes, song.tempo);
            break;
        default:
            error('Invalid demo song');
            break;
    }
}

async function playMidi(pins, filename = 'octave_demo.mid', opts){
    let songs;
    try {
        songs = await Promise.all(opts.track.map(async track => parseMidi(filename, track, opts)));
    }
    catch(ex){
        return error('Please specify valid track');
    }

    const drives = pins.map(pin => new Floppy(pin.direction, pin.step));

    for(let i = 0; i < songs.length; i++)
        drives[i].playSong(songs[i].notes, songs[i].tempo);
}