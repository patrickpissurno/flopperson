const Floppy = require('./floppy');

const song = require('./hardcoded_songs/imperial_march');

const drive1 = new Floppy(parseInt(process.argv[2]), parseInt(process.argv[3]));
drive1.playSong(song.notes, song.tempo);