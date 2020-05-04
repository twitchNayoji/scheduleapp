// expressモジュールの読み込み
const express = require('express')

// expressアプリを生成する
const app = express();

//configの読み込み(default.jsonが読み込まれる)
const conf = require('config');

// mongoDBアプリを生成する
const mongoose = require('mongodb').MongoClient;
const mongoDB = require('mongodb');

// 接続先url
const url = conf.mongodb_uri;
const dbname = conf.mongodb_dbname;

// 追加オプションMongoClient

const connectOption = {
    useNewUrlParser:true,
    useUnifiedTopology:true,

}

//ポート番号を定義
const PORT = 5000

class schedule{
    month;
    peopleperday;
	rules;
	members;
    constructor(){
    }
}
class rule{
	category;
	val1;
	val2;
	val3;
	constructor(){}
}
class member{
     id;
	name;
	rules;
	constructor(){}
}
//webフォルダの中身を公開する
app.use('/st/',express.static('public'));

// ルートにアクセスした場合の返却
app.get('/',(req,res) => res.send('Hello'));


// /test/list にアクセスしてきた場合の返却
app.get('/test/list',(req,res) => {
      const retval = [{key:'test',val:'testValue'},
	      {vvv:'dkajklas',jefiji:'v'}
      ];	
	
	res.json(retval);

});

// /scheduleにPOSTした場合の返却
app.post('/schedule',(req,res) => {
//DB接続
mongoose.connect(url, connectOption, (err,client)=>{
	if (err == null){
		client.close;
	}

	//接続に成功した場合はログ出力
	console.log('Connected successfully to server');
        //スケジュールを取得
	let insertObj = new schedule();
	let dbresult = client.db(dbname).collection('schedule').insertOne(insertObj,function(err, result) {
    if (err) throw err;
    client.close();
		const resultJson = {
			"message":"Registration completed.",
			"scheduleId":result.insertedId
		}
	res.json(resultJson);
  });
});
});

// /schedule にGETした場合の返却
app.get('/schedule/:id',(req,res) => {
        var params = req.params;
        var hashid = params.id;
        var retval = null;
	if (!hashid){
	     res.json(null);
		return;
	}

//DB接続
mongoose.connect(url, connectOption, (err,client)=>{
	if (err == null){
		client.close;
	}

	//接続に成功した場合はログ出力
	console.log('Connected successfully to server');

        //スケジュールを取得
	try{
	var idObj = new mongoDB.ObjectID(hashid);
	}catch(e){
            //検索不要
            res.json(null);
		return;
	}
	let key = {}
	key._id = idObj;
	let retval = client.db(dbname).collection('schedule').findOne(key,function(err, result) {
    if (err) throw err;
    client.close();
	res.json(result);
  });
}
);
});


// /rules/id にアクセスしてきた場合の返却
app.get('/schedule/:scheduleid/rules(/:rulecategory)?',(req,res) => {
        var hashid = req.params.scheduleid;
	var rulecategory = req.params.rulecategory;
        var retval = null;
	if (!hashid){
		res.json(null);
		return;
	}

//DB接続
mongoose.connect(url, connectOption, (err,client)=>{
	if (err == null){
		client.close;
	}

	//接続に成功した場合はログ出力
	console.log('Connected successfully to server');

        //スケジュールを取得
	try{
	var idObj = new mongoDB.ObjectID(hashid);
	}catch(e){
            //検索不要
            res.json(null);
		return;
	}
	let key = {}
	key._id = idObj;
	let dbresults = client.db(dbname).collection('schedule').findOne(key,function(err, result) {
    if (err) throw err;
    client.close();
	var retval = null;
        if(result!=null){
	    if(rulecategory&&(result.rules!=null)){
	         retval = result.rules.find((x)=>x.category ===rulecategory);
	    }
	    else{
	         retval = result.rules;
            }
	}
	res.json(retval);
  });
}
);
});


//ポート5000でサーバを立てる
app.listen(PORT, () => console.log(`listening on ${ PORT }`));


