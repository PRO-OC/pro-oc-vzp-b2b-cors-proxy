var express = require('express');
var request = require('request');
var xmlparser = require('express-xml-bodyparser');
var fs = require('fs');
var app = express();

app.use(xmlparser());

var pfxFilePath = fs.readFileSync('assets/cert.pfx');
var pfxPassphrase = fs.readFileSync('assets/cert.pass.txt');

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
            request({ url: targetURL + req.url, method: req.method, headers: {'Content-Type': 'text/xml'}, body: req.rawBody, agentOptions: { pfx: pfxFilePath, passphrase: pfxPassphrase, securityOptions: 'SSL_OP_NO_SSLv3' } },
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
            res.send(body);
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
