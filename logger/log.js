var log4js = require('log4js'); // include log4js
var path = require('path');
var logs_path = 'logs/'

log4js.configure({ // configure to use all types in different files.
    appenders: [
        {   type: 'dateFile',
            filename: path.join(logs_path,"error.log"), // specify the path where u want logs folder error.log
            category: 'error',
            pattern: "-dd-MM",
            maxLogSize: 20480,
            backups: 10,
            alwaysIncludePattern:false
        },
        {   type: "dateFile",
            filename: path.join(logs_path,"info.log"), // specify the path where u want logs folder info.log
            category: "info",
            pattern: "-dd--MM",
            maxLogSize: 20480,
            backups: 10,
            "alwaysIncludePattern":false
        },
        {   type: 'dateFile',
            filename: path.join(logs_path,"debug.log"), // specify the path where u want logs folder debug.log
            category: 'debug',
            pattern: "-dd--MM",
            maxLogSize: 20480,
            backups: 10,
            alwaysIncludePattern: false
        },
        {   type: 'dateFile',
            filename: path.join(logs_path,"warn.log"), // specify the path where u want logs folder error.log
            category: 'warn',
            pattern: "-dd-MM",
            maxLogSize: 20480,
            backups: 10,
            alwaysIncludePattern:false
        },
        {   type: 'dateFile',
            filename: path.join(logs_path,"fatal.log"), // specify the path where u want logs folder error.log
            category: 'fatal',
            pattern: "-dd-MM",
            maxLogSize: 20480,
            backups: 10,
            alwaysIncludePattern:false
        }
    ]
});

var loggerinfo = log4js.getLogger('info'); // initialize the var to use.
var loggererror = log4js.getLogger('error'); // initialize the var to use.
var loggerdebug = log4js.getLogger('debug'); // initialize the var to use.
var loggerwarn = log4js.getLogger('warn'); // initialize the var to use.
var loggerfatal = log4js.getLogger('fatal'); // initialize the var to use.

loggerinfo.info('This is Information Logger');
loggererror.info('This is Error Logger');
loggerdebug.info('This is debug Logger');
loggerwarn.info('This is warn Logger');
loggerfatal.info('This is fatal Logger');

var log = function(level,message){
    var dotString="-----------------------------------------------------";
    var errString = '\n\n'+message+'\n\n'+dotString; 
    if(level=='error'){
     loggererror.info(errString);
    }
    else if(level == "debug"){
        loggerdebug.info(errString);
    }     
    else if(level == "info"){
        loggerinfo.info(errString);
    }
    else if(level == "warn"){
        loggerwarn.info(errString);
    }
    else if(level == "fatal"){
        loggerfatal.info(errString);
    }    
    return;
}

exports.log=log;