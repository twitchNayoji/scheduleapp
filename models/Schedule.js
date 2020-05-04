//configの読み込み(default.jsonが読み込まれる)
const conf = require('config');

// mongoDBアプリを生成する
const mongoose = require('mongodb').MongoClient;
const mongoDB = require('mongodb');

// Scheduleスキーマを読み込み
const scheduleSchema = require('./schema/scheduleSchema');

// 接続先url
const url = conf.mongodb_uri;
const dbname = conf.mongodb_dbname;

// 追加オプションMongoClient
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}

module.exports = {

    getSchedule: function (hashid) {
        // Todo Promise勉強
        return new Promise((resolve, reject) => {
            //DB接続
            mongoose.connect(url, connectOption, (err, client) => {
                if (err) throw err;

                //接続に成功した場合はログ出力
                console.log('Connected successfully to server');

                //Todo mongooseを利用してmodelを作成してみる
                //スケジュールを取得
                try {
                    var idObj = new mongoDB.ObjectID(hashid);
                } catch (e) {
                    //検索不要
                    resolve(null);
                    return;
                }
                let key = {}
                key._id = idObj;
                let retval = client.db(dbname).collection('schedule').findOne(key, function (err, result) {
                    client.close();
                    if (err) {
                        throw err;
                    } else {
                        resolve(result);
                    }
                });
            }
            );
        });
    },
    getScheduleRules: function (hashid) {
        return new Promise((resolve, reject) => {
            //DB接続
            mongoose.connect(url, connectOption, (err, client) => {
                if (err) throw err;

                //接続に成功した場合はログ出力
                console.log('Connected successfully to server');

                //スケジュールを取得
                try {
                    var idObj = new mongoDB.ObjectID(hashid);
                } catch (e) {
                    //検索不要
                    resolve(null);
                    return;
                }
                let key = {}
                key._id = idObj;
                let dbresults = client.db(dbname).collection('schedule').findOne(key, function (err, result) {
                    client.close();
                    if (err) {
                        throw err;
                    } else {
                        var retval = null;
                        if (result != null) {
                            retval = result.rules;
                        }
                        resolve(retval);
                    }
                });
            });
        });
    },
    getScheduleRule: function (hashid, rulecategory) {
        return new Promise((resolve, reject) => {
            //DB接続
            mongoose.connect(url, connectOption, (err, client) => {
                if (err) throw err;

                //接続に成功した場合はログ出力
                console.log('Connected successfully to server');

                //スケジュールを取得
                try {
                    var idObj = new mongoDB.ObjectID(hashid);
                } catch (e) {
                    //検索不要
                    resolve(null);
                    return;
                }
                let key = {}
                key._id = idObj;
                let dbresults = client.db(dbname).collection('schedule').findOne(key, function (err, result) {
                    client.close();
                    if (err) {
                        throw err;
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
        });
    },

    insertSchedule: function () {
        return new Promise((resolve, reject) => {
            //DB接続
            mongoose.connect(url, connectOption, (err, client) => {
                if (err) throw err;

                //接続に成功した場合はログ出力
                console.log('Connected successfully to server');
                //スケジュールを取得
                //Todo mongooseを利用してmodelを作成してみる
                //Todo Fix scheduleSchemaからobjectを取得した場合に、一部のメンバーが消えてしまう。(functionで定義されてしまっているため。)
                let insertObj = scheduleSchema.obj;
                let dbresult = client.db(dbname).collection('schedule').insertOne(insertObj, function (err, result) {
                    client.close();
                    if (err) {
                        throw err;
                    } else {
                        const resultJson = {
                            "message": "Registration completed.",
                            "scheduleId": result.insertedId
                        }
                        resolve(resultJson);
                    }
                });
            });
        });
    }
}