#!/usr/bin/env nodejs
// http://stackoverflow.com/questions/21612980/why-is-usr-bin-env-bash-superior-to-bin-bash

// Global Requires:
var os = require( 'os' )
var smoke = require('smokesignal')
var _ = require('underscore')

// Personal Functions
var pfunctions = require('./custom_modules/functions.js')

// First let's find the IP's that are not local and use one or more for the P2P config in SmokeSignal.
// https://nodejs.org/api/os.html#os_os_networkinterfaces
// http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js

var networkInterfaces = os.networkInterfaces()
//console.log(networkInterfaces)

// Remove IPv6 objects in array
var removedIPv6 = _.each(networkInterfaces, function(IPInfo) {

	// If a pair of objects...
	if (IPInfo.length >1 && IPInfo[1].family == "IPv6") {
		IPInfo.splice(1,1) // remove it from the array
	}
	// If singular...
	if (IPInfo[0].family == "IPv6") {
		IPInfo.splice(0,1) // remove it from the array
	}
});

//console.log(removedIPv6)
//process.exit()

// With the IP's, we should filter out the local addresses.
var newIPs = _.filter(networkInterfaces, function(IPs) {
	// Since the IPs are paired, IPv4 & IPv6, we only need to look at index 0 to see if it is local or "internal".
	if (IPs.length) {
		if (IPs[0].internal === false ) {return 1} else {return 0} // Returning 1 means to the _.filter() that we want it.
	} else {return 0} // Removes the empty index in the array left over from removing the IPv6 above.
})
//console.log(newIPs)


// The IPs are now filtered of local addresses & IPv6 addresses.
// We need to test for Internet connectivity and use that address for the P2P system.

process.exit()

// Loop addresses and init a Smoke on each address, except Seed address if present.
var node = smoke.createNode({
  port: 8495,
  address: smoke.localIp('192.168.2.1/255.255.255.0'), // Tell it your subnet and it'll figure out the right IP for you
  seeds: [{port: 13, address:'192.168.2.100'}] // the address of a seed (a known node)
})

// listen on network events...

node.on('connect', function() {
  // Hey, now we have at least one peer!

  // ...and broadcast stuff -- this is an ordinary duplex stream!
  node.broadcast.write('HEYO! I\'m here')
})

node.on('disconnect', function() {
  // Bah, all peers gone.
})

// Broadcast is a stream
process.stdin.pipe(node.broadcast).pipe(process.stdout)

// Start the darn thing
node.start()

// meh, I'd rather stop it
node.stop()