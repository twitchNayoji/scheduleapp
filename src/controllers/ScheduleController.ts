import Express from "express";
import Schedule from "../models/ScheduleLogics";
import { Shift } from "../models/ScheduleLogics";

/**
 * シフト表の設定データ作成
 * @param req リクエスト
 * @param res レスポンス
 * @param next 不明
 */
function doPostSchedule(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  Schedule.insertSchedule().then((result) => {
    res.json(result);
  });
}
/**
 * シフト表の設定データ取得
 * @param req リクエスト
 * @param res レスポンス
 * @param next 不明
 */
function doGetSchedule(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const params = req.params;
  const hashid = params.id;
  if (!hashid) {
    res.json(null);
    return;
  }
  // hashidをもとにscheduleを取得
  Schedule.getSchedule(hashid).then((result) => {
    res.json(result);
  });
}
/**
 * シフト表の設定データ.ルールを取得
 * @param req リクエスト
 * @param res レスポンス
 * @param next 不明
 */
function doGetScheduleRule(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const hashid = req.params.scheduleid;
  const rulecategory = req.params.rulecategory;
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
/**
 * シフト表の設定データをもとに計算を実施する
 * @param req リクエスト
 * @param res レスポンス
 * @param next 不明
 */
function doCalculateShiftSchedule(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const params = req.params;
  const hashid = params.id;
  if (!hashid) {
    res.json(null);
    return;
  }
  // hashidをもとにschedule設定を取得
  Schedule.calculateSchedule(hashid).then((result: Shift | null) => {
    // Todo 読みやすいよう整形しているだけなので後ほど削除
    // for (const [key, element] of Object.entries(result.daysMembers)) {
    //   element.member.morning = element.member[0];
    //   element.member.evening = element.member[1];
    //   // delete element.member[0];
    //   // delete element.member[1];
    // }

    // 計算結果を返却
    // Todo jsonを返却するよう修正　→send=>json、stringify=>削除
    res.send(JSON.stringify(result, null, 4));
  });
}
export default {
  doPostSchedule,
  doGetSchedule,
  doGetScheduleRule,
  doCalculateShiftSchedule
}