'use strict';

function reportError(error) {
    //for each key, print line of k/v
    Object.entries(error).forEach(([key, value]) => {
        console.log(key + ' : ' + value);
    });
}

module.exports = {
    reportError
}