import express from "express";
const app        = express();

// ポート番号を定義
const PORT = 5000;

// DBと接続する
import "./models/dbconnect";

// ルーターを生成する
import router from "./routes/routes";

// ルーターを使用する
app.use('/', router);

// ポート5000でサーバを立てる
app.listen(PORT, () => console.log(`listening on ${ PORT }`));