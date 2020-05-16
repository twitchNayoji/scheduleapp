import Express from "express";
import Schedule from "../models/ScheduleLogics";
const viewsPath = "../views/";

/**
 * 
 * @param req リクエスト
 * @param res レスポンス
 * @param next 不明
 */
function doGetTopPage(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    const params = req.params;
    const hashid = params.id;
    res.render(viewsPath + 'index.ejs',{id:hashid});
}
export default {
    doGetTopPage
  }