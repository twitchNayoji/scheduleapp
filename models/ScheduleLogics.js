// mongooseを利用
const mongoose = require('mongoose');

// Scheduleスキーマを読み込み
const schedule = require('./schema/scheduleSchema');

module.exports = {

    getSchedule: function (hashid) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result);
                }
            });
        });
    },
    getScheduleRules: function (hashid) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
                } else {
                    var retval = null;
                    if (result != null) {
                        retval = result.rules;
                    }
                    resolve(retval);
                }
            });
        });
    },
    getScheduleRule: function (hashid, rulecategory) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
                } else {
                    var retval = null;
                    if (result != null) {
                        //categoryが指定されていない場合は、nullとする。
                        if (rulecategory && (result.rules != null)) {
                            retval = result.rules.find((x) => x.category === rulecategory);
                        }
                    }
                    resolve(retval);
                }
            });
        });
    },

    insertSchedule: function () {
        return new Promise((resolve, reject) => {
            //スケジュールをinsert
            var ScheduleModel = mongoose.model('schedule', schedule);
            var insertObj = new ScheduleModel();
            //Todo insertObjに対する値の設定
            insertObj.save(function (err) {
                if (err) {
                    console.log(err);
                    resolve(err)
                }
                else {
                    const resultJson = {
                        "message": "Registration completed.",
                        "scheduleId": insertObj._id
                    }
                    resolve(resultJson);
                }
            });
        });
    }
}