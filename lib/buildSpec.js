const yaml = require('yaml');
const path = require('path');
const fs = require('fs');
const build_name_import = require('../commands/build.js').build_name;
const spec_file = require('../commands/build.js').spec_file;

let build_spec_path;
if(typeof spec_file !== 'undefined') {
    build_spec_path = path.join(path.dirname(require.main.filename), String(spec_file));
} else {
    build_spec_path = path.join(path.dirname(require.main.filename), 'sample.yml');
}
const build_spec_file = fs.readFileSync(build_spec_path, 'utf8');

let build_name = "";
if(typeof build_name_import !== 'undefinted') {
    build_name = build_name_import;
}
function parse_build_spec() {
    jobs_specs = {};
    build_spec = yaml.parse(build_spec_file);
    for (job of build_spec['jobs']) {
        if(job['name'] == String(build_name)) {
            if ('steps' in job) {
                jobs_specs['steps'] = [];
                for (step of job['steps']) {
                    jobs_specs.steps.push(step['run'])
                }
            }
            if ('mutation' in job) {
                jobs_specs['mutation'] = {};
                jobs_specs.mutation.iterations = job.mutation.iterations;
                jobs_specs.mutation.url = job.mutation.url;
                jobs_specs.mutation.snapshots = job.mutation.snapshots;
            }
        }
    }
    return jobs_specs;
}

module.exports = parse_build_spec();

