const glsl = require('glslify');
const glob = require('glob');
const fs = require('fs-extra');

const baseDir = __dirname + '/src';
const outDir = __dirname + "/dist";

glob(baseDir + '/**/*.glsl', {}, (err, files) => {
    const length = files.length;

    for (var i = 0; i < length; i++) {
        const srcFile = files[i];
        const src = glsl.file(srcFile);

        const newDir = srcFile.replace(baseDir, outDir) + ".js";
        const newSrc = 'export default "' + prePass(src) + '";';

        fs.outputFile(newDir, newSrc, (err) => {
            if (err) {
                return console.error(err);
            }

            console.log('Input Was - ' + srcFile);
            console.log('Output Was - ' + newDir);
        });
    }
});

function prePass(output) {
    // remove GLSLIFY define (not used)
    output = output.replace('#define GLSLIFY 1', '');

    // Remove carriage returns. Use newlines only.
    output = output.replace('\r', '');

    // Remove C style comments
    const cStyleRegex = /\/\*[\s\S]*?\*\//g;
    output = output.replace(cStyleRegex, '');

    // Remove C++ style comments
    const cppStyleRegex = /\/\/[^\n]*/g;
    output = output.replace(cppStyleRegex, '\n');

    // remove all multiple new-lines
    output = output.replace(/[\r\n]{2,}/g, "\n");

    // perform a final trim
    const splits = output.split('\n');

    var finalOutput = '';

    for (var i = 0; i < splits.length; i++) {
        const split = splits[i].trim();
        finalOutput += split + '\\n';
    }

    return finalOutput;
}