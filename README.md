# flopperson
Make floppy music great again (pun intended)

## How to use
1. [Search the web](https://www.instructables.com/id/Floppy-Drive-music-w-Raspberry-Pi/) and get your Raspberry Pi correctly wired to at least one Floppy Drive
2. Install a recent Node version (I'm running on v11.9.0 and that's the only one I have tested)
3. Run `npm install -g flopperson`
4. Run `flopperson --help` for the latest help
```
Usage: index [options] [midi_file]

Options:
  -d, --direction-pin <pin>[,pin2,pin3...]  Floppy direction pins (comma-separated list)
  -s, --step-pin <pin>[,pin2,pin3...]       Floppy step pins (comma-separated list)
  -t, --track <track>[,track2,track3...]    The MIDI track's id (comma-separated list)
  --no-transpose                            Disables auto-transpose feature
  --no-trim                                 Disables auto-trim feature
  --no-filter                               Disables too-quick note filter feature
  --no-speed-scale                          Disables track speed scale feature
  --demo [song]                             The demo song to be played
  --config <filename>                       Load from config file
  -h, --help                                output usage information
```

## Pin naming convention
This tool uses the [BCM convention](https://pinout.xyz/).


## Examples
- Play Imperial March: `flopperson --direction-pin 17 --step-pin 18 --demo`
- Play C major scale: `flopperson --direction-pin 17 --step-pin 18`
- Play a MIDI file: `flopperson --direction-pin 17 --step-pin 18 skyrim.mid`

## Acknowledgement
Some of this code was based on the awesome work of other people, like:
- [@KristobalJunta](https://github.com/KristobalJunta/floppymusic)
- [@Tonejs](https://github.com/Tonejs/MidiConvert)
- [@fivdi](https://github.com/fivdi/onoff)

Thank you guys! This project wouldn't be possible without you.

## License
MIT License

Copyright (c) 2019 Patrick Pissurno

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
