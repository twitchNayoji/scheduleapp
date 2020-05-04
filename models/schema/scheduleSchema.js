var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schedule = new Schema({
    month: String, // String is shorthand for {type: String}
    peopleperday: Number,
    rules: [{ category: String, val1: String, val2: String, val3: String }],
    members: [{ id: String, name: String, rules: [{ category: String, val1: String, val2: String, val3: String }], val3: String }]
});

module.exports = Schedule;