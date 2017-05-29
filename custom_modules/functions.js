// Useful Functions
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
