const yaml = require('yaml');
const path = require('path');
const fs = require('fs');
const build_name = require('../commands/build.js').build_name;
const spec_file = require('../commands/build.js').spec_file;

const build_spec_path = path.join(path.dirname(require.main.filename), String(spec_file));
const build_spec_file = fs.readFileSync(build_spec_path, 'utf8');

function parse_build_spec() {
    commands = [];
    build_spec = yaml.parse(build_spec_file);
    for (job of build_spec['jobs']) {
        for (step of job['steps']) {
            commands.push(step['run'])
        }
    }
    return commands;
}

module.exports = parse_build_spec();

