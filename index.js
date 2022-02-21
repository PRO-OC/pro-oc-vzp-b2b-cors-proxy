var express = require('express');
var request = require('request');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();

app.use(bodyParser.text());

var pfxFilePath = fs.readFileSync('cert/cert.pfx');
var pfxPassphrase = fs.readFileSync('cert/cert.pass.txt', 'utf8'); 

var targetURL = 'https://prod.b2b.vzp.cz';

app.all('*', function (req, res, next) {

    console.log(req.method + ': new request');

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'X-Requested-With');

    if (req.method === 'OPTIONS') {
        console.log('OPTIONS: preflight sent');
        res.send();
    } else if (req.method === "GET") {

        return new Promise(resolve => {
            request({ url: targetURL + req.url, method: req.method, headers: {'Content-Type': 'text/xml'}, agentOptions: { pfx: pfxFilePath, passphrase: pfxPassphrase, securityOptions: 'SSL_OP_NO_SSLv3' } },
                function (error, response, body) {
                    if (!error) {
                        resolve(body);
                    }
                }
            );
        }).then(body => {
            console.log('GET: response sent');
            res.send(body);
        });
    } else if (req.method === "POST") {

        return new Promise(resolve => {
            var bodyDecoded = "";
            if(req.body) {
                const asciiBody = Buffer.from(req.body, 'base64').toString('ascii');
                bodyDecoded = decodeURIComponent(asciiBody);
            }
            request({ url: targetURL + req.url, method: req.method, headers: {'Content-Type': 'text/xml'}, body: bodyDecoded, agentOptions: { pfx: pfxFilePath, passphrase: pfxPassphrase, securityOptions: 'SSL_OP_NO_SSLv3' } },
                function (error, response, body) {
                    if (!error) {
                        console.log('POST error:', error);
                        console.log('POST response:', response);
                        console.log('POST body:', body);
                        resolve(body);
                    } else {
                        console.log('ERROR: ' + error);
                    }
                }
            );
        }).then(body => {
            console.log('POST: response sent');
            var bodyBase64 = Buffer.from(encodeURIComponent(body), 'ascii').toString('base64');
            res.send(bodyBase64);
        });
    } else {
        console.log(req.method + ': is not POST, GET or OPTION request');
        next();
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
