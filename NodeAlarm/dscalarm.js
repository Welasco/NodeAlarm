#!/usr/bin/env node
/*
 DSC Alarm Bridge
 This NodeJS code will work like a bridge/proxy between Smartthings and DSC IT-100 Serial board
 This code will monitor the DSC IT-100 Serial board and will send the received commands to SmartThings ServiceManager (Also known as SmartApp)

 To install the dependencies just open the npm and type "npm install" inside of the project folder

 SmartTing Reference:
 Building LAN-connected Device Types
 http://docs.smartthings.com/en/latest/cloud-and-lan-connected-device-types-developers-guide/building-lan-connected-device-types/index.html

 The SmartApp
 A Web Services SmartApp
 http://docs.smartthings.com/en/latest/smartapp-web-services-developers-guide/smartapp.html?highlight=mappings

 Cloud-and LAN-connected Devices -> Building LAN-connected Device Types -> Building the Device Type
 http://docs.smartthings.com/en/latest/cloud-and-lan-connected-device-types-developers-guide/building-lan-connected-device-types/building-the-device-type.html

 Service Manager Design Pattern
 http://docs.smartthings.com/en/latest/cloud-and-lan-connected-device-types-developers-guide/understanding-the-service-manage-device-handler-design-pattern.html#basic-overview

 Division of Labor - Architecture
 http://docs.smartthings.com/en/latest/cloud-and-lan-connected-device-types-developers-guide/building-lan-connected-device-types/division-of-labor.html

 Code Reference:
 https://github.com/entrocode/SmartDSC
 https://github.com/isriam/smartthings-alarmserver
 https://github.com/kholloway/smartthings-dsc-alarm
 https://github.com/kholloway/smartthings-dsc-alarm/blob/master/RESTAPISetup.md
 https://github.com/yracine/DSC-Integration-with-Arduino-Mega-Shield-RS-232
 
*/

////////////////////////////////////////
// Starting Variables and Dependencies
////////////////////////////////////////
console.log("Starting DSCAlarm");

// Loading Dependencies
var http = require("http");
var https = require('https');
var express = require("express");
var app = express();
var SerialPort = require('serialport');
var config = require('./config.js');
fs = require('fs');

console.log("Modules loaded");

// Setting Variables
var portStatus = 0
var winCom = config.wincom;
var linuxCom = config.linuxcom;
var alarmPassword = config.alarmpassword;
var baudRate = config.baudRate;

var httpport = config.httpport;

//var isWin = /^win/.test(process.platform);
// Detecting the OS Version to setup the right com port useful for debugging
console.log("Detected OS Version: " + process.platform);
if (process.platform == "win32") {
    var sport = winCom;
}
else {
    var sport = linuxCom;
}

// Example how to List all available Serial ports:
// serialport.list(function (err, ports) {
// ports.forEach(function(port) {
//    console.log(port.comName);
//  });
//});


//////////////////////////////////////////////////////////////////
// Creating Endpoints
// Those Endpoints will receive a HTTP GET Request
// Execute the associated Method to make the following:
//  "/" - Used to check if the alarm is running
//  "/api/alarmArmAway" - Used to arm the alarm in away mode
//////////////////////////////////////////////////////////////////

// Used only to check if NodeJS is running
app.get("/", function (req, res) {
    res.send("<html><body><h1>DSC Alarm Running</h1></body></html>");
});

//app.get("/api/users", function (req, res) {
//    res.set("Content-Type", "application/json");
//    res.send({ name: "Shawn", isValid: true, group: "Admin" });
//    sendSerialData("enviado através do pedido http");
//});

// Used to arm the alarm using the alarm password
app.get("/api/alarmArm", function (req, res) {
    alarmArm();
    //res.send("200 OK");
    res.end();
});

// Used to arm the alarm in Away Mode (password not required)
app.get("/api/alarmArmAway", function (req, res) {
    alarmArmAway();
    //res.send("200 OK");
    res.end();
});

// Used to arm the alarm in Stay Mode (password not required)
app.get("/api/alarmArmStay", function (req, res) {
    alarmArmStay();
    //res.send("200 OK");
    res.end();
});

// Used to disarm the alarm (need a password)
app.get("/api/alarmDisarm", function (req, res) {
    alarmDisarm();
    res.end();
});

// Used to enable or disable Chime
app.get("/api/alarmChimeToggle", function (req, res) {
    alarmChimeToggle();
    res.end();
});

// Used to activate Panic
app.get("/api/alarmPanic", function (req, res) {
    alarmPanic();
    res.end();
});

// Used to Set Alarm Date and Time
app.get("/api/alarmSetDate", function (req, res) {
    alarmSetDate();
    res.end();
});


// Receiving AppID and AccessToken
// I'll use it in V2
//app.post("/api/setappidaccesstoken", function (req, res) {
//    console.log("Received Command: setappidaccesstoken");
//    if (req.method == "POST") {
//        console.log("Received Command is POST");
//        var jsonString = '';
//        req.on('data', function (data) {
//            jsonString += data;
//            var objJSON = JSON.parse(jsonString);
//            saveAppIDAccessToken(objJSON);
//        });
//    }
//    res.end();
//});
//app.get("/api/setappidaccesstoken/:id/:token", function (req, res) {
//    console.log("Este é o ID: " + req.params.id);
//    console.log("Este é o Token: " + req.params.token);
//    res.end();
//});


////////////////////////////////////////
// Creating Server
////////////////////////////////////////
var server = http.createServer(app);
server.listen(httpport);

////////////////////////////////////////
// Creating Serial (RS232) Connection
////////////////////////////////////////

// Instanciating the object myPort 
// Using a baudRate (port speed)
// Setting a parser. Based on IT-100 Board communication pattern everytime
//  a command is sent the board will send a \r\n at the end.
var myPort = new SerialPort(sport, {
    baudRate: baudRate,
    parser: SerialPort.parsers.readline("\r\n")
});


// list serial ports:
//serialport.list(function (err, ports) {
//    ports.forEach(function (port) {
//        console.log(port.comName);
//    });
//});

// The object myPort have 4 functions open, data, close, error
// Defining witch method will be called everytime one of those handlers is called
myPort.on('open', showPortOpen);
myPort.on('data', receivedFromSerial);
myPort.on('close', showPortClose);
myPort.on('error', showError);

// Method used to Open the serial communication with DSC IT-100 Board
function showPortOpen() {
    console.log('Serial Port opened: ' + sport + ' BaudRate: ' + myPort.options.baudRate);
    portStatus = 1;
}

// Method used to Receive serial communication from DSC IT-100 Board
function receivedFromSerial(data) {
    //myPort.write(data);
    parseReceivedData(data);
    //console.log("Received Serial data: " + data);
}

// Method used to close the Serial Port
function showPortClose() {
    console.log('port closed.');
}

// Method used to list any serial communication error
function showError(error) {
    console.log('Serial port error: ' + error);
}

// Method used to send serial data
function sendToSerial(data) {
    console.log("sending to serial: " + data);
    myPort.write(data);
}


//////////////////////////////////////////////////////////////////////////////////////
// Alarm DSC Serial Communication Fucntions
// List of function used to send the action to Alarm Board
//////////////////////////////////////////////////////////////////////////////////////

// Send the Arm command to Alarm
function alarmArm() {
    var cmd = "0331" + alarmPassword + "00";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Send the ArmAway command to Alarm
function alarmArmAway() {
    var cmd = "0301";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Send the ArmStay command to Alarm
function alarmArmStay() {
    var cmd = "0321";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Send the Disarm command to Alarm
function alarmDisarm() {
    var cmd = "0401" + alarmPassword + "00";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Send the Break command to Alarm
function alarmSendBreak() {
    var cmd = "070^";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Send the Enable Chime command to Alarm
function alarmChimeToggle() {
    var cmd = "070c";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
    // wait for 1800 and call alarmSendBreak
    setTimeout(alarmSendBreak, 1800);
}

// Send the Activate Panic command to Alarm
function alarmPanic() {
    var cmd = "0603";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// This command will send the code to the alarm when ever the alarm ask for it with a 900
function alarmSendCode() {
    var cmd = "2001" + alarmPassword + "00";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// alarm Status Request
function alarmUpdate() {
    var cmd = "001";
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// alarm Set Date Time
function alarmSetDate() {
    
    var hour = date.getHours();
    var minute = date.getMinutes();
    var month = date.getMonth()+1;
    var day = date.getDate().toString();
    if(day.length == 1){
        day = "0"+day
    }
    var year = date.getFullYear().toString().substring(2,4);
    var timedate = hour.toString()+minute.toString()+month.toString()+day.toString()+year.toString();

    var cmd = "010" + timedate;
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

////////////////////////////////////////////////////////////////////////////////////////////////
// *** Not in use - function to set the alarm boud rate - *** Not in use
// In cas you want to change the Alarm Board Serial Speed
////////////////////////////////////////////////////////////////////////////////////////////////
function alarmSetBaudRate(speed) {
    // setup and send baud rate command
    // 0=9600, 1=19200, 2=38400, 3=57600, 4=115200

    var cmd = "080";
    if (speed == "9600") {
        cmd = cmd + "0";
    }
    else if (speed == "19200") {
        cmd = cmd + "1";
    }
    else if (speed == "38400") {
        cmd = cmd + "2";
    }
    else if (speed == "57600") {
        cmd = cmd + "3";
    }
    else if (speed == "115200") {
        cmd = cmd + "4";
    }
    else  // By default set to 9600 
    {
        cmd = cmd + "0";
    }  
    cmd = appendChecksum(cmd);
    sendToSerial(cmd);
}

// Function not in use for futue versions
// Function that will receive a JSON from Smartthing with AppID and AccessToken
function saveAppIDAccessToken(data) {
    console.log("Received data: " + JSON.stringify(data))
    fs.writeFile('appid-accesstoken.txt', JSON.stringify(data), function (err) {
        if (err) return console.log(err);
    })
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Method used to append the right checksum at the end of any command sent to DSC IT-100 Board
// According with DSC IT-100 manual each command sent to the board must have a checksum
// This method will calculate the checksum according to the command that need to be sent
// Will return the data ready to be sent to DSC IT-100 Board 
// Alarm Documentation - http://cms.dsc.com/download.php?t=1&id=16238
////////////////////////////////////////////////////////////////////////////////////////////////
function appendChecksum(data) {
    var result = 0;
    var arrData = data.split('');
    arrData.forEach(function (entry) {
        var entryBuffer = new Buffer(entry, 'ascii');
        var entryRepHex = entryBuffer.toString('hex');
        var entryHex = parseInt(entryRepHex, 16);
        //console.log(entryHex + " " + parseInt(entryHex, 10));
        result = result + parseInt(entryHex, 10);
    });
    data = data + (parseInt(result, 10).toString(16).toUpperCase().slice(-2) + "\r\n");
    //console.log(data);
    return data;
}


///////////////////////////////////////////
// Function used to parser all received commands from the Alarm
// We will analise the received data and send the request to SmartThing to control the app
// Based on what we have received we will change the Device Alarm and Zone (Open/Close Sensor) on SmartThing
// Alarm Documentation - http://cms.dsc.com/download.php?t=1&id=16238
///////////////////////////////////////////
function parseReceivedData(data) {
    console.log("Received Serial data: " + data);
    var cmdfullstr = data.toString('ascii');
    console.log(data);
    if (cmdfullstr.length >= 3){
        var cmd = cmdfullstr.substr(0, 3);
        if (cmd == "609") {
            var msg = ("ZN-" + cmdfullstr.substr(0, 6));
            sendSmartThingMsg(msg);
        }
        else if (cmd == "610") {
            var msg = ("ZN-" + cmdfullstr.substr(0, 6));
            sendSmartThingMsg(msg);
        }
        else if (cmd == "621") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "622") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "650") {
            var msg = ("RD-1");
            sendSmartThingMsg(msg);
        }
        else if (cmd == "651") {
            var msg = ("RD-0");
            sendSmartThingMsg(msg);
        }
        else if (cmd == "656") {
            var msg = ("AR-2");
            sendSmartThingMsg(msg);
        }
        else if (cmd == "652") {
            var msg = ("AR-1" + cmdfullstr.charAt(3) + cmdfullstr.charAt(4));
            sendSmartThingMsg(msg);
        }
        else if (cmd == "655") {
            var msg = ("AR-0");
            sendSmartThingMsg(msg);
            var msg = ("AL-0");
            sendSmartThingMsg(msg);
        }
        else if (cmd == "654") {
            var msg = ("AL-1");
            sendSmartThingMsg(msg);
        }
        else if (cmd == "900") {
            alarmSendCode();
        }
        else if (cmd == "901") {
            if (cmdfullstr.indexOf("Door Chime") >= 0) {
                if (cmdfullstr.indexOf("ON") >= 0) {
                    var msg = ("CH-1");
                    sendSmartThingMsg(msg);
                }
                else {
                    var msg = ("CH-0");
                    sendSmartThingMsg(msg);
                }
            }
        }
        else if (cmd == "658") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "670") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "672") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "802") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "803") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "806") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "807") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "810") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "811") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "812") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "813") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "821") {
            var msg = ("SY-" + cmdfullstr.substr(0, 6));
            sendSmartThingMsg(msg);
        }
        else if (cmd == "822") {
            var msg = ("SY-" + cmdfullstr.substr(0, 6));
            sendSmartThingMsg(msg);
        }
        else if (cmd == "829") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "830") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "840") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "841") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "842") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "843") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "896") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else if (cmd == "897") {
            var msg = ("SY-" + cmd);
            sendSmartThingMsg(msg);
        }
        else {

        }
    }
}

///////////////////////////////////////////
// Function to send alarm msgs to SmartThing
///////////////////////////////////////////
function sendSmartThingMsg(command) {
    var app_id = config.appid;
    var access_token = config.accesstoken;

    var pathURL = '/api/smartapps/installations/' + app_id + '/dscalarm/' + command + '?access_token=' + access_token;
    console.log("Sending SmartThing comand: " + pathURL);
    sendHttpRequest(pathURL);
}

///////////////////////////////////////////
// Send HTTPs Request to SmartThings
///////////////////////////////////////////
function sendHttpRequest(pathURL) {
    //https://graph-na02-useast1.api.smartthings.com/api/smartapps/installations/af13cf06-0d14-451f-93de-40ec0189d142/switches/off?access_token=beba4dbc-5513-4149-a7f5-4d89ff8967ab
    //https://graph-na02-useast1.api.smartthings.com/api/smartapps/installations/af13cf06-0d14-451f-93de-40ec0189d142/switches/on?access_token=beba4dbc-5513-4149-a7f5-4d89ff8967ab

    var options = {
        host: config.shardlocation,
        port: 443,
        path: pathURL,
        method: 'GET'
    };

    var req = https.request(options, function (res) {
        console.log(res.statusCode);
        res.on('data', function (d) {
            process.stdout.write(d);
        });
    });
    req.end();

    req.on('error', function (e) {
        console.error(e);
    });
}
console.log("DSCAlarm Started");

