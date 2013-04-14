var ac = require('argchecker').check({
  expect: {
    '-p': {},
    '-br': {},
    '-mn': {param: 'maxNobr', default: 0},
    'text': {must: true}
  }
});

var xmlRequest = 
    '<?xml version="1.0" encoding="UTF-8"?>' + 
    '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' + 
    'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' + 
        '<soap:Body>' +
            '<ProcessText xmlns="http://typograf.artlebedev.ru/webservices/">' + 
                '<text>' + ac.get('text') + '</text>' + 
                '<entityType>4</entityType>' +
                '<useP>'+ac.isOn('-p')+'</useP>' +
                '<useBr>'+ac.isOn('-br')+'</useBr>' +
                '<maxNobr>'+ac.get('-mn')+'</maxNobr>' +
            '</ProcessText>' +
        '</soap:Body>' +
    '</soap:Envelope>';

http = require('http');

function lengthInUtf8Bytes(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

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
    console.log(chunk.substr(chunk.indexOf('ProcessTextResult')+18, length));
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(xmlRequest);
req.end();