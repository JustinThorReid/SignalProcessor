const fs = require('fs');
const pulseWidth = 400.0;


const data = fs.readFileSync('input.txt').toString().split('\n');
const us = getMicroSeconds(data[1]);
console.log("Detection rate: " + us + 'us');

getData(concatStream(data, 'D0:'), pulseWidth, us);

function getMicroSeconds(line) {
    const matches = line.matchAll(/^Acquisition with [0-9]\/[0-9] channels at (\d+) ([a-z])Hz$/ig).next().value;

    let multiplier = 0;
    switch(matches[2]) {
        case 'k':
            multiplier = 1000;
            break;
        default:
            multiplier = 1;
    }

    const hz = parseInt(matches[1]) * multiplier;
    const us = (1 / hz) * 1e+6;
    return us;
}

function getData(line, pulseWidth, dataRate) {
    let data = [];

    let startIndex = 0;
    let value = line[0];
    for (var i = 0; i < line.length; i++) {
        if(line[i] !== value) {
            const length = (i - startIndex) * dataRate;
            const pulses = Math.round(length / pulseWidth);
            for(var j = 0; j < pulses; j++) data.push(parseInt(value));

            value = line[i];
            startIndex = i;
        }
    }
    
    while(data[0] === 0) data.shift();
    console.log(data.join(''));

    let binary = new Uint8Array(Math.ceil(data.length / 8));
    for(var i = 0; i < data.length; i++) {
        const index = Math.floor(i / 8);
        binary[index] = binary[index] | (data[i] << 7 - (i % 8));
    }

    console.log([...binary].map(i => {
        return '0x' + i.toString(16).padStart(2, '0').toUpperCase()
    }).join(', '));
}

function concatStream(lines, prefix) {
    return lines.filter(line => {
        return line.startsWith(prefix);
    }).map(line => line.replace(/^D\d\:/, '').replace(/[^01]/g, '')).join('');
}