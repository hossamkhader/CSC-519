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
    var app_jar_archive_path = path.join(path.dirname(require.main.filename), "tmp/iTrust2-10.jar");
    var app_war_archive_path = path.join(path.dirname(require.main.filename), "tmp/iTrust2-10.war");
    var service_ip;
    for (droplet of droplets) {
      try {
        await ssh.connect({host: droplet.address.public, username: "root", privateKey: privateKey_path.toString()});
        await ssh.execCommand("useradd vagrant -s /bin/bash");
        await ssh.execCommand("mkdir -p /home/vagrant/.ssh");
        await ssh.execCommand("cp .ssh/authorized_keys /home/vagrant/.ssh");
        await ssh.execCommand("chown -R vagrant:vagrant /home/vagrant");
        await ssh.execCommand("echo 'vagrant ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/vagrant");
        ssh.dispose();
      }
      catch(error) {

      }
      
      await ssh.connect({host: droplet.address.public, username: "vagrant", privateKey: privateKey_path.toString()});
      role = droplet.role
      for (host of hosts) {
        await ssh.execCommand(`echo '${host}' | sudo tee -a /etc/hosts`);
      }
      if (role == "web") {
        await ssh.execCommand("mkdir -p itrust/www");
        await ssh.putFile(app_jar_archive_path.toString(), "itrust/www/iTrust2-10.jar");
        await ssh.putFile(app_war_archive_path.toString(), "itrust/www/iTrust2-10.war");
      }
      if (role == "proxy") {
        await ssh.putDirectory("deployment", "deployment");
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


