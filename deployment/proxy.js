const path = require('path');
const os = require('os');
const { exec, execSync } = require('child_process');
const winston = require('winston');

const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');



let logger;

class Production
{
    constructor()
    {
       this.BLUE = 'blue';
       this.GREEN = 'green';

       this.TARGET = this.GREEN;
       setInterval( this.healthCheck.bind(this), 5000 );
    }

    proxy()
    {
       let options = {};
       let proxy = httpProxy.createProxyServer(options);
       proxy.on('error', function (e) {});
       let self = this;
       try {
          let server  = http.createServer(function(req, res) {
             proxy.web(req, res, {target: `http://${self.TARGET}:8080` });
            });
            server.listen(8080);
         }
         catch(error) { 

        }
   }

   async healthCheck()
   {
      this.TARGET = this.GREEN;
      let blue_status = false;
      let green_status = false;
      try 
      {
         const response = await got(`http://${this.GREEN}:8080/iTrust2`, {throwHttpErrors: false});
         green_status = (response.statusCode == 200);
      }
      catch (error) {
      }

      try
      {
         const response = await got(`http://${this.BLUE}:8080/iTrust2`, {throwHttpErrors: false});
         blue_status = (response.statusCode == 200);
      }
      catch (error) {
      }

      if (!green_status) {
         this.TARGET = this.BLUE;
      }

      logger.log('info', `Health check on BLUE: ${blue_status}`);
      logger.log('info', `Health check on GREEN: ${green_status}`);
      logger.log('info', `TARGET: ${this.TARGET}`);
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

   console.log('Starting proxy on 0.0.0.0:8080');
   let prod = new Production();
   prod.proxy();

}


if (require.main === module) {
   main();
}
