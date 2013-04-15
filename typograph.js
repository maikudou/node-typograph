var http = require('http'),
    program = require('commander');

var start = function(params){
    if(params.text != null){
        send(params)
    } else {
        error("Text not found!")
    }
}

var send = function(params){
    var xmlRequest = 
        '<?xml version="1.0" encoding="UTF-8"?>' + 
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' + 
        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' + 
            '<soap:Body>' +
                '<ProcessText xmlns="http://typograf.artlebedev.ru/webservices/">' + 
                    '<text>' + params.text + '</text>' + 
                    '<entityType>4</entityType>' +
                    '<useP>'+params.usep+'</useP>' +
                    '<useBr>'+params.usebr+'</useBr>' +
                    '<maxNobr>'+params.maxmobr+'</maxNobr>' +
                '</ProcessText>' +
            '</soap:Body>' +
        '</soap:Envelope>';

    var options = {
        hostname: 'typograf.artlebedev.ru',
        port: 80,
        path: '/webservices/typograf.asmx',
        method: 'POST',
        headers: {
            'Content-length': lengthInUtf8Bytes(xmlRequest),
            "content-type":"text/xml; charset=UTF-8"
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var start = chunk.indexOf('ProcessTextResult')+18;
            var length = chunk.indexOf('</ProcessTextResult') - start;
            response(chunk.substr(chunk.indexOf('ProcessTextResult')+18, length))
        });
    });
    
    req.on('error', function(e) {
        error('Problem with request: ' + e.message);
    });
    
    // write data to request body
    req.write(xmlRequest);
    req.end();
}

var response = function(typoText){
    console.log(typoText);
}

var error = function(errorText){
    console.log('Error: ' + errorText);
}

function lengthInUtf8Bytes(str) {
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}


exports.start = start;
exports.success = response;
exports.error = response;

