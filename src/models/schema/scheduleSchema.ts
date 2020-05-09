import mongoose from "mongoose";
import ScheduleController from "../../controllers/ScheduleController";
const Schema = mongoose.Schema;

const Schedule =new Schema({
  year: {
    type: Number
  },
  month: {
    type: Number
  },
  peopleperday: {
    type: Number
  },
  rules: [{ category: String, val1: String, val2: String, val3: String }],
  members: [{ id: String, name: String, rules: [{ category: String, val1: String, val2: String, val3: String }], val3: String }]
}, { collection: 'schedule' });

export default Schedule;