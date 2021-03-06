// expressモジュールの読み込み
import express from "express";

// expressルーターを生成する
const router = express.Router();

// コントローラを生成する
import scheduleController from "../controllers/ScheduleController";
import topPageController from　"../controllers/TopPageController";


/*** Webコンテンツ */
// ルートにアクセスした場合の返却（めんどいのでビジネスロジックこのまま）
// router.get('/', (req, res) => res.send('Hello'));// webフォルダの中身を公開する
router.use('/', express.static('public'));
router.get('/:id/', topPageController.doGetTopPage)


/*** Web Api */
// schedule
router.get('/schedule/:id', scheduleController.doGetSchedule);
router.post('/schedule', scheduleController.doPostSchedule);
router.get('/schedule/:scheduleid/rules(/:rulecategory)?', scheduleController.doGetScheduleRule);
// シフト表の出力
router.get('/schedule/:id/calculate',scheduleController.doCalculateShiftSchedule);

export default router;