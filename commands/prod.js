const chalk = require("chalk");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const sshpk = require("sshpk");

exports.command = "prod <target_status>";
exports.desc = "provision instances on the cloud provider";
exports.builder = (yargs) => {
  target_status = process.argv[3];
};

exports.handler = async (argv) => {

  token = process.env.NCSU_DOTOKEN;
  if( !token ) {
    console.log(chalk`{red.bold NCSU_DOTOKEN is not defined!}`);
    console.log(`Please set your environment variables with appropriate token.`);
    console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
    process.exit(1);
  }

  

  console.log(chalk.green("provisioning instances on the cloud provider..."));





  let client = new DigitalOceanProvider(token);
  
  for (ssh_key of await client.get_ssh_keys()) {
    if (ssh_key["name"] == "pipeline") {
      client.delete_ssh_key(ssh_key["id"]);
    }
  }
  keyPair = gen_ssh_keys();
  key_id = await client.create_ssh_key("pipeline", keyPair["publicKey"]);
  
  if (target_status == "up") {
    var droplets = [];
    for (i of ["test01"]) {
      var dropletId = await client.createDroplet(i, "nyc1", "ubuntu-20-04-x64", [key_id]);
      dropletAddress = await client.dropletInfo(dropletId);
      droplets.push({"id": dropletId, "name": i, "address": dropletAddress});
    }
    fs.writeFileSync("inventory", JSON.stringify(droplets));
  }

  if (target_status == "down") {
    data = fs.readFileSync("inventory.json", "UTF-8");
    droplets = JSON.parse(data.toString());
    for (droplet of droplets) {
      await client.deleteDroplet(droplet["id"]);
    }
  }

};


function gen_ssh_keys() 
{
	const keyPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: "pkcs1",
			format: "pem"
		},
		privateKeyEncoding: {
			type: "pkcs8",
    		format: "pem",
		}
	});

	keyPair["publicKey"] = sshpk.parseKey(keyPair["publicKey"], "pem").toString("ssh");

	fs.writeFileSync(".ssh/public_key", keyPair["publicKey"].toString());
	fs.writeFileSync(".ssh/private_key", keyPair["privateKey"]);
	return keyPair;
}



class DigitalOceanProvider
{
	constructor (token) 
	{
		this.headers = {'Content-Type':'application/json', Authorization: 'Bearer ' + token};
	}
	
	
	async createDroplet (dropletName, region, imageName, sshKeys )
	{
		if( dropletName == "" || region == "" || imageName == "" )
		{
			console.log( chalk.red("You must provide non-empty parameters for createDroplet!") );
			return;
		}

		var data = 
		{
			"name": dropletName,
			"region":region,
			"size":"s-1vcpu-1gb",
			"image":imageName,
			"ssh_keys": sshKeys,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		console.log("Attempting to create: "+ JSON.stringify(data) );

		let response = await axios.post("https://api.digitalocean.com/v2/droplets", 
		data,
		{
			headers:this.headers,
		}).catch( err => 
			console.error(chalk.red(`createDroplet: ${err}`)) 
		);

		if( !response ) return;

		if(response.status == 202)
		{
			return response.data.droplet.id;
		}
	}

	async dropletInfo (id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		let response = await axios.get('https://api.digitalocean.com/v2/droplets/' + id, { headers: this.headers })
							 .catch(err => console.error(`dropletInfo ${err}`));

		if( !response ) return;

		if( response.data.droplet )
		{
			let droplet = response.data.droplet;
			for( let network of droplet["networks"]["v4"])
			{
				if (network["type"] == "public") 
				{
					return network["ip_address"];
				}
				
			}
		}

	}

	async deleteDroplet(id)
	{
		if( typeof id != "number" )
		{
			console.log( chalk.red("You must provide an integer id for your droplet!") );
			return;
		}

		let response = await axios.delete('https://api.digitalocean.com/v2/droplets/' + id, { headers: this.headers })
							 .catch(err => console.error(`deleteDroplet ${err}`));

		if( !response ) return;

		if(response.status == 204)
		{
			console.log(`Deleted droplet ${id}`);
		}

	}

  	async get_ssh_keys()
	{

		let response = await axios.get('https://api.digitalocean.com/v2/account/keys', { headers: this.headers })
							 .catch(err => console.error(`get_ssh_keys ${err}`));

		if( !response ) return;

		if(response.status == 200)
		{
			return response.data["ssh_keys"];
		}

	}

	async create_ssh_key(name, public_key)
	{

		var data = {"name": name, "public_key": public_key};

		let response = await axios.post('https://api.digitalocean.com/v2/account/keys', data, { headers: this.headers })
							 .catch(err => console.error(`create_ssh_key ${err}`));

		if( !response ) return;

		if(response.status == 201)
		{
			return response.data.ssh_key.id;
		}

	}

	async delete_ssh_key(id)
	{

		let response = await axios.delete('https://api.digitalocean.com/v2/account/keys/' + id, { headers: this.headers })
							 .catch(err => console.error(`delete_ssh_key ${err}`));

	}

};
