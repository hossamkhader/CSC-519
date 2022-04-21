const {NodeSSH} = require("node-ssh");
const fs = require("fs");
const path = require('path');
parse_job_spec = require('../lib/jobSpec');

exports.command = "deploy <inventory> <job_name> <spec_file>";
exports.desc = "deploy application";


exports.handler = async (argv) => {

  inventory_file = process.argv[3];
  job_name = process.argv[4];
  spec_file = process.argv[5];
  job_specs = parse_job_spec(spec_file, job_name);
  
  hosts = [];

	data = fs.readFileSync(inventory_file, "UTF-8");
    droplets = JSON.parse(data.toString());
    for (droplet of droplets) {
      hosts.push(`${droplet["address"]} ${droplet["name"]}`);
    }

    
  
    const ssh = new NodeSSH();
    privateKey_path = path.join(path.dirname(require.main.filename), ".ssh/private_key");
    app_archive_path = path.join(path.dirname(require.main.filename), "tmp/iTrust2-10.jar");
    for (droplet of droplets) {
      await ssh.connect({host: droplet["address"], username: "vagrant", privateKey: privateKey_path.toString()});
      role = droplet.role
      for (command of job_specs.deploy.roles[role]) {
        await ssh.execCommand(command);
      }
      for (host of hosts) {
        await ssh.execCommand(`echo '${host}' | sudo tee -a /etc/hosts`);
      }
      await ssh.putFile(app_archive_path.toString(), "/home/vagrant/iTrust2-10.jar");
    }
    process.exit();

};


