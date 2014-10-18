#!/usr/bin/env groovy

/*
	BitPagos Integration
 	
 	Method: Checkout Object

 	Transaction Status Check: By Pulling
 */

def proc, transaction

groovy.json.JsonSlurper slurper = new groovy.json.JsonSlurper()

// start

def apiKey = System.console().readLine "\ninsert your ApiKey: "

try {
	println "\nGenerating Checkout Object... \n"

	proc = ["curl", "-k", "-X", "POST", "-H", "Content-Type: application/json", "-H", "Authorization: ApiKey ${apiKey}", "-d", '{"currency": "ARS", "reference_id": "00001", "amount":1, "items":[{"unit_price":1, "quantity":1, "title":"test"}]}', "https://www.bitpagos.net/api/v1/checkout/"].execute()

	proc.waitFor()

	def checkoutObject = slurper.parseText(proc.in.text)

	proc = ["open", "${checkoutObject.checkout_url}"].execute()

	proc.waitFor()
	
	println "Checkout Object generated. Go to: ${checkoutObject.checkout_url} and pay! \n"

	print "Did you pay? please wait... We're checking transaction status. "

	while (true) {

		print ". "		

		proc = ["curl", "-k", "-X", "GET", "-H", "Content-Type: application/json", "-H", "Authorization: ApiKey ${apiKey}", "https://www.bitpagos.net/api/v1/transaction/${checkoutObject.txn_id}/"].execute()

		proc.waitFor()

		transaction = slurper.parseText(proc.in.text)

		if ( transaction.status == "CO" ) break

		sleep 5000
	}

	println "Transaction confirmed!  Detail:\n ${groovy.json.JsonOutput.prettyPrint(transaction)}"

} catch (Exception e) {

	println "ERROR: ${e}"

	println "Response: ${proc.err.text}"
}