
//console.log((new Date()));

//setTimeout(test, 1800);

//function test() {
    //console.log("Executou");
    //console.log((new Date()));
//}

//console.error("test");

//var i = 0;
//if (i == 1) {
    //console.log("igual a 1");
//}
//else if (i == 0){
    //console.log("igual a 0");
//}

//var str = "1234";
//console.log("quarta posicao da string é: " + str.charAt(3))

//fs = require('fs');
//fs.writeFile('helloworld.txt', 'Hello World!', function (err) {
    //if (err) return console.log(err);
    //console.log('Hello World > helloworld.txt');
//});
/*
var cmdfullstr = "902"
if (cmdfullstr.indexOf("2") > -1) {
    console.log(cmdfullstr.indexOf("2"))
    console.log("achou");
}
*/

 //Example how to List all available Serial ports:
var config = require('./config.js');
console.log(config.alarmpassword);

var SerialPort = require('serialport');
 SerialPort.list(function (err, ports) {
 ports.forEach(function(port) {
    console.log(port.comName);
  });
});


