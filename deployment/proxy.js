const chalk = require('chalk');
const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const winston = require('winston');

const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');


let BLUE = "blue";
let GREEN = "green";

let logger;

class Production
{
    constructor()
    {
        this.TARGET = GREEN;
        setInterval( this.healthCheck.bind(this), 5000 );
    }

    proxy()
    {
        let options = {};
        let proxy   = httpProxy.createProxyServer(options);
        let self = this;
        // Redirect requests to the active TARGET (BLUE or GREEN)
        try {
           let server  = http.createServer(function(req, res) {
              proxy.web(req, res, {target: `http://${self.TARGET}:8080` });
            });
            server.listen(8080);
         }
         catch(error) { 

        }
   }

   failover()
   {
      this.TARGET = BLUE;
   }

   async healthCheck()
   {
      try 
      {
         var url = `http://${this.TARGET}:8080/iTrust2`;
         const response = await got(url, {throwHttpErrors: false});
         let status = response.statusCode == 200 ? chalk.green(response.statusCode) : chalk.red(response.statusCode);
         logger.log('info', `{Health check on ${this.TARGET}}: ${status}`);
         if (!response.statusCode == 200) {
            this.failover();
         }
      }
      catch (error) {
         console.log(error);
         this.failover();
      }
   }
   
}

function main() {
   logger = winston.createLogger({    
      level: 'info',
      format: winston.format.combine(        
         winston.format.timestamp(),        
         winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;        
         })    
         ),    
    transports: [new winston.transports.File({'filename': 'proxy.log'})]
});

   try {
      execSync('lsof -ti tcp:8080 | xargs kill > /dev/null 2>&1');
      
   }
   catch(error) {
   }

   console.log(chalk.keyword('pink')('Starting proxy on 0.0.0.0:8080'));
   let prod = new Production();
   prod.proxy();

}


if (require.main === module) {
   main();
}
