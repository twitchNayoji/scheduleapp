var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schedule = new Schema({
    month:{
        type: String
      },
    peopleperday: {
        type: Number
      },
    rules: [{ category: String, val1: String, val2: String, val3: String }],
    members: [{ id: String, name: String, rules: [{ category: String, val1: String, val2: String, val3: String }], val3: String }]
}, { collection: 'schedule'});

module.exports = Schedule;