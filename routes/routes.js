// expressモジュールの読み込み
const express = require('express')

// expressルーターを生成する
const router = express.Router();

// コントローラを生成する
var scheduleController = require('../controllers/ScheduleController')


// ルートにアクセスした場合の返却（めんどいのでビジネスロジックこのまま）
router.get('/', (req, res) => res.send('Hello'));//webフォルダの中身を公開する
router.use('/st/', express.static('public'));


// schedule
router.get('/schedule/:id', scheduleController.doGetSchedule);
router.post('/schedule', scheduleController.doPostSchedule);
router.get('/schedule/:scheduleid/rules(/:rulecategory)?', scheduleController.doGetScheduleRule);
//シフト表の出力
router.get('/schedule/:id/calculate',scheduleController.doCalculateShiftSchedule);


module.exports = router;



