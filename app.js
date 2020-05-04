var express    = require('express');
var app        = express();

//ポート番号を定義
const PORT = 5000

// ルーターを生成する
var router = require('./routes/routes')

//ルーターを使用する
app.use('/', router);

//ポート5000でサーバを立てる
app.listen(PORT, () => console.log(`listening on ${ PORT }`));