// configの読み込み(default.jsonが読み込まれる)
import conf from "config";

// mongooseを利用
import mongoose from "mongoose";

// 接続先url
const url: string = conf.get("mongodb_uri");

// mongoDB接続のオプション
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,

}

// mongoDBに接続
mongoose.connect(url, connectOption);

// DB接続に成功した場合はログ出力
console.log('Connected successfully to mongoDB server');

// signalでコネくション切断
process.on('SIGINT', () => { mongoose.disconnect(); });