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
      hosts.push(`${droplet.address.private} ${droplet["name"]}`);
    }
  
    const ssh = new NodeSSH();
    var privateKey_path = path.join(path.dirname(require.main.filename), ".ssh/private_key");
    var app_archive_path = path.join(path.dirname(require.main.filename), "tmp/iTrust2-10.jar");
    var service_ip;
    for (droplet of droplets) {
      await ssh.connect({host: droplet.address.public, username: "vagrant", privateKey: privateKey_path.toString()});
      role = droplet.role
      for (host of hosts) {
        await ssh.execCommand(`echo '${host}' | sudo tee -a /etc/hosts`);
      }
      if (role == "web") {
        await ssh.putFile(app_archive_path.toString(), "/home/vagrant/iTrust2-10.jar");
      }
      if (role == "proxy") {
        await ssh.putDirectory("deployment", "/home/vagrant/deployment");
        service_ip = droplet.address.public;
      }

      console.log("Running commands on droplet " + droplet.name);
      for (command of job_specs.deploy.roles[role]) {
        console.log(command);
        await ssh.execCommand(command);
      }
    }

    console.log(`Service is available on http://${service_ip}:8080/iTrust2`);
    process.exit();
};


