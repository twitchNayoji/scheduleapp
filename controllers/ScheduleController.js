const express = require('express');
const Schedule = require('../models/Schedule');


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
  }
}