/*
var res = new Buffer('80', 'hex')[0];
console.log(res);


var b = new Buffer(1);
b[0] = 128;
console.log(b.toString('hex'));

*/
var res = new Buffer('61', 'hex');
console.log(res.toString());

var c = new Buffer('a', 'ascii');
console.log(c.toString('hex'));
/*
var res = new Buffer('61', 'hex');
console.log(res.toString());


var c = new Buffer('0301', 'ascii');
//c = 'a';
console.log(c.toString('hex'));

var test = "string";
var arrtest = test.split('');

arrtest.forEach(function (entry) {
    console.log(entry);
});
*/

var entryHex1 = parseInt("30", 16);
var entryHex2 = parseInt("33", 16);
var entryHex3 = parseInt("30", 16);
var entryHex4 = parseInt("31", 16);

entryHex1 = entryHex1 + entryHex2 + entryHex3 + entryHex4;
//console.log(entryHex1.toString('hex'));
//var d = new Buffer(entryHex1.toString(), 'ascii');
//var d = new Buffer("196", 'ascii');
//var entrydec = 0;

//Converting from string to decimal
// var decimal = parseInt(entryHex1.toString(), 10)
// converting from decimal to hex
// var b = decimal.toString(16);
// doing both in one line
// var entrydec = parseInt(entryHex1.toString(), 10).toString(16);

var entrydec = parseInt(entryHex1.toString(), 10).toString(16);
console.log(entrydec);

//console.log(d.toString('hex'));

//funcionando
//var dec = 196;
//console.log(dec.toString(16));


//console.log(entryHex1.toString());

//console.log(entryHex1);



//console.log((parseInt("500", 10).toString(16).toUpperCase().slice(-2)));

//console.log(test.split(''));
//console.log("call da function");

appendChecksum("0301");
appendChecksum("0401180600");
function appendChecksum(data) {
    var result = 0;
    var arrData = data.split('');
    arrData.forEach(function (entry) {
        var entryBuffer = new Buffer(entry, 'ascii');
        var entryRepHex = entryBuffer.toString('hex');
        var entryHex = parseInt(entryRepHex, 16);
        //console.log(entryHex + " " + parseInt(entryHex, 10));
        result = result + parseInt(entryHex,10);
    });
    data = data + (parseInt(result, 10).toString(16).toUpperCase().slice(-2) + "\r\n");
    //console.log(data);
    
}
