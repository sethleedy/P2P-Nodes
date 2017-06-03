#!/usr/bin/env nodejs
 // http://stackoverflow.com/questions/21612980/why-is-usr-bin-env-bash-superior-to-bin-bash

'use strict'

// Clear screen
process.stdout.write('\x1Bc');

// Global Requires:
var os = require('os')
var smoke = require('smokesignal')
var _ = require('underscore')

// Personal Functions
var pfunctions = require('./custom_modules/functions.js')

// Take the passed JSON formatted argument and place it into a handy variable
var jsonArgs = process.argv
jsonArgs[2] = JSON.parse(process.argv[2])
	// Test to see if "startNonLocalP2P" is there. If not, set default to true.
if (!("startNonLocalP2P" in jsonArgs[2])) {
	jsonArgs[2]["startNonLocalP2P"] = true
}
//console.log(jsonArgs[2]["startNonLocalP2P"])
//process.exit()

// First let's find the IP's that are not local and use one or more for the P2P config in SmokeSignal.
// https://nodejs.org/api/os.html#os_os_networkinterfaces
// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js

var networkInterfaces = JSON.parse(JSON.stringify(os.networkInterfaces())) // Converts the weird string format to JSON and then to an Object.
	//console.log(networkInterfaces)

// Remove,
//		IPv6 objects
//		Local Addresses
// in array.
var removedIPv6 = _.each(networkInterfaces, function(value, key, list) { //If list is a JavaScript object, iterator's arguments will be (value, key, list).
	//console.log(key)
	//console.log(value[0].address)

	// Check each value for IPv6 addresses. Value typically is 1 or 2 in array.
	var checkForIPv6 = _.reject(value, function(value2) {

		if (value2.family == "IPv6") {
			return true // TRUE, filter it!
		}
		if (value2.internal == true) {
			return true // TRUE, filter it!
		}
	})

	// Replace the current key with the newly change value from above
	list[key] = checkForIPv6

	// Test and see if the KEY is now empty from the above checkForIPv6 function. Remove it from the object if so.
	if (list[key].length == 0) {
		delete list[key]
	}

});
var newIPs = removedIPv6
	//console.log(newIPs)
	//console.log(newIPs["eth1"][0].address)

// The IPs are now filtered of local addresses & IPv6 addresses.
// We need to test for Internet connectivity and use that address for the P2P system.

// Loop addresses and init a Smoke on each address, except Seed address if present.

// Default Seeds for now.
var defaultSeeds = ["127.0.0.1", 13131]
if (jsonArgs[2].startLocalP2P === true) { pfunctions.startupLocalSmoke(defaultSeeds) } // jsonArgs[2].startLocalP2P == true

// Create an object to hold the nodes and information about them
var nodes = {}
	// Start the main P2P node here and then start listening for messages.
_.each(newIPs, function(value1, key1, list1) {
	_.each(value1, function(value2, key2, list2) {

		nodes["node-" + value2.address] = smoke.createNode({
			port: 8495,
			address: value2.address,
			seeds: [{ address: defaultSeeds[0], port: defaultSeeds[1] }] // the address of a seed (a known node)
		})
		console.log("Startup node-" + value2.address)

	})
})

// listen on network events...
_.each(nodes, function(node, key, list) {
	node.on('connect', function() {
		// Hey, now we have at least one peer!

		// ...and broadcast stuff -- this is an ordinary duplex stream!
		node.broadcast.write(node.id + ': ' + 'Now online on its local LAN IP: ' + node.options.address + '.\n')
	})

	// Broadcast is a stream
	//localNode.broadcast.pipe(process.stdout)
	//process.stdin.pipe(node.broadcast).pipe(process.stdout)

	// Test: Check peers for messages and send some.


	node.on('disconnect', function() {
		// Bah, all peers gone.
	})


	// Start the darn thing
	node.start()

	// meh, I'd rather stop it
	//node.stop()

})

// Test: Check peers for messages and send some.
var newPeerList
	//console.log(nodes)
var test1 = nodes[Object.keys(nodes)[0]] // Grab first key value in object.
newPeerList = nodes["node-192.168.0.207"]
console.log(newPeerList.peerlist)

process.exit()
