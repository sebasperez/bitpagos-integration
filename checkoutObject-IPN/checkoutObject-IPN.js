/*
	BitPagos Integration
 	
 	Method: Checkout Object

 	Transaction Status Check: By IPN Pushing
 */

'use strict';

var	express = require("express"),
	exec = require('child_process').exec;

var app = express();

app.use(express.urlencoded());

/*
For test:
curl -v -X POST \
-H 'Content-Type:application/x-www-form-urlencoded' \
-d 'transaction_id=#some_transaction_id#' \
'http://localhost:8080/bitpagos-ipn-listener'
*/

app.post ("/bitpagos-ipn-listener", function (req, res, next) {

	console.log("Listener - Received Notification for transaction: " + req.body.transaction_id);

	console.log("Listener - Getting transaction...");

	var command = "curl -k -H 'Content-Type:application/json' -H 'Authorization: ApiKey #your_api_key#' 'https://www.bitpagos.net/api/v1/transaction/$transaction_id/' ";

	exec(command.replace('$transaction_id', req.body.transaction_id), function(error, stdout, stderr) {

		var transaction = JSON.parse(stdout);

		console.log("Listener - Transaction:\n" + JSON.stringify(transaction) );

		res.send (200);
	});
});

/*
For test: 
curl -v -X POST \
-H 'Content-Type:application/x-www-form-urlencoded' \
-d 'api_key=#your_api_key#' \
'http://localhost:8080/bitpagos-checkout-service'
*/

app.post ("/bitpagos-checkout-service", function (req, res, next) {

	console.log("\n\n\n\nCheckout Service - Creating new checkout object...");

	var command = "curl -k -X POST -H 'Content-Type:application/json' -H 'Authorization: ApiKey $api_key' -d '{\"currency\": \"ARS\", \"reference_id\": \"00001\", \"amount\":1, \"items\":[{\"unit_price\":1, \"quantity\":1, \"title\":\"test\"}]}' 'https://www.bitpagos.net/api/v1/checkout/' ";

	exec(command.replace('$api_key', req.body.api_key), function(error, stdout, stderr) {

		var checkoutObject = JSON.parse(stdout);

		console.log("Checkout Service - Checkout Object created.");

		console.log("Checkout Service - Pay URL: " + checkoutObject.checkout_url);

		console.log("Checkout Service - QR base64: " + checkoutObject.bitcoin_link.qrcode_base64);

		res.setHeader("Access-Control-Allow-Origin", "*"); // CORS

		res.send (201, {"url":checkoutObject.checkout_url, "qrcode_base64":checkoutObject.bitcoin_link.qrcode_base64});
	});
});

app.listen(8080);