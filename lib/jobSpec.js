const yaml = require('yaml');
const path = require('path');
const fs = require('fs');



function parse_job_spec(spec_file, job_name) {
    job_spec_path = path.join(path.dirname(require.main.filename), String(spec_file));
    const job_spec_file = fs.readFileSync(job_spec_path, 'UTF-8');

    job_spec = {};
    jobs = yaml.parse(job_spec_file);
    for (job of jobs['jobs']) {
        if(job['name'] == String(job_name)) {
            if ('steps' in job) {
                job_spec['steps'] = [];
                for (step of job['steps']) {
                    job_spec.steps.push(step['run'])
                }
            }
            if ('mutation' in job) {
                job_spec['mutation'] = {};
                job_spec.mutation.iterations = job.mutation.iterations;
                job_spec.mutation.url = job.mutation.url;
                job_spec.mutation.snapshots = job.mutation.snapshots;
            }

            if ('deploy' in job) {
                return job;
            }
        }
    }
    return job_spec;
}

module.exports = parse_job_spec;