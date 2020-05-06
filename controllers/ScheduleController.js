const express = require('express');
const Schedule = require('../models/ScheduleLogics');


module.exports = {
  doPostSchedule: function (req, res, next) {
    Schedule.insertSchedule().then((result) => {
      res.json(result);
    });
  },
  doGetSchedule: function (req, res, next) {
    var params = req.params;
    var hashid = params.id;
    if (!hashid) {
      res.json(null);
      return;
    }
    // hashidをもとにscheduleを取得
    Schedule.getSchedule(hashid).then((result) => {
      res.json(result);
    });
  },
  doGetScheduleRule: function (req, res, next) {
    var hashid = req.params.scheduleid;
    var rulecategory = req.params.rulecategory;
    if (!hashid) {
      res.json(null);
      return;
    }
    if (rulecategory) {
      // ルールを１件取得
      Schedule.getScheduleRule(hashid, rulecategory).then((result) => {
        res.json(result);
      });
    } else {
      // ルールを全件取得
      Schedule.getScheduleRules(hashid).then((result) => {
        res.json(result);
      });
    }
  },
  //登録した設定をもとに、シフト表を計算して出力
  doCalculateShiftSchedule: function (req, res, next) {
    var params = req.params;
    var hashid = params.id;
    if (!hashid) {
      res.json(null);
      return;
    }
    // hashidをもとにschedule設定を取得
    Schedule.calculateSchedule(hashid).then((result) => {
      //Todo 読みやすいよう整形しているだけなので後ほど削除
      for (let [key, element] of Object.entries(result.daysMembers)) {
        element.member.morning = element.member[0];
        element.member.evening = element.member[1];
        // delete element.member[0];
        // delete element.member[1];
      }
      //計算結果を返却
      //Todo jsonを返却するよう修正　→send=>json、stringify=>削除
      res.send(JSON.stringify(result, null, 4));
    });

  }

}