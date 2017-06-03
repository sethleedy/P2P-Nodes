// Useful Functions

// Module Requirements.
var smoke = require('smokesignal')

// Module
module.exports = {
    // Check for Internet connectivity.
    checkInternet: function(cb) {
        require('dns').lookup('google.com', function(err) {
            if (err && err.code == "ENOTFOUND") {
                cb(false);
            } else {
                cb(true);
            }
        })
    },
    // Start localhost P2P Smoke for testing purposes of code
    startupLocalSmoke: function(defaultSeeds = ["127.0.0.1", "13131"]) {
        console.log("startupLocalSmoke: " + defaultSeeds[0])

        var localNode = smoke.createNode({
            port: parseInt(defaultSeeds[1]),
            //address: smoke.localIp("127.0.0.1/255.0.0.0") // Tell it your subnet and it'll figure out the right IP for you
            //address: smoke.localIp("192.168.0.207") // Tell it your subnet and it'll figure out the right IP for you
            address: "192.168.0.207"
                //,seeds: [{port: defaultSeeds[1], address:defaultSeeds[0]}] // the address of a seed (a known node)
        })

        // listen on network events...

        localNode.on('connect', function() {
            // Hey, now we have at least one peer!

            // ...and broadcast stuff -- this is an ordinary duplex stream!
            //localNode.broadcast.write('Cast: LocalNode: HEYO! I\'m here.\n')
        })

        localNode.on('disconnect', function() {
            // Bah, all peers gone.
        })

        // Broadcast is a stream
        localNode.broadcast.pipe(process.stdout)
            //process.stdin.pipe(localNode.broadcast).pipe(process.stdout)

        // Start the darn thing
        localNode.start()
    }
};

// Clean array of values, even undefined/empty/null
/*test = new Array("", "One", "Two", "", "Three", "", "Four").clean("");
test2 = [1, 2,, 3,, 3,,,,,, 4,, 4,, 5,, 6,,,,];
test2.clean(undefined);*/
Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};


// Start localhost P2P Smoke for testing purposes of code
// function startupLocalSmoke(defaultSeeds = ["127.0.0.1", "13"]) {
//     console.log("Made it")

//     var localNode = smoke.createNode({
//         port: defaultSeeds[1],
//         address: smoke.localIp(defaultSeeds[0] + '/255.255.255.0'), // Tell it your subnet and it'll figure out the right IP for you
//         seeds: [] // the address of a seed (a known node)
//     })
// }
