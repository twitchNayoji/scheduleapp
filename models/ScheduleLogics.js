// mongooseを利用
const mongoose = require('mongoose');

// Scheduleスキーマを読み込み
const schedule = require('./schema/scheduleSchema');

module.exports = {

    getSchedule: function (hashid) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
                } else {
                    resolve(result);
                }
            });
        });
    },
    getScheduleRules: function (hashid) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
                } else {
                    var retval = null;
                    if (result != null) {
                        retval = result.rules;
                    }
                    resolve(retval);
                }
            });
        });
    },
    getScheduleRule: function (hashid, rulecategory) {
        return new Promise((resolve, reject) => {
            var ScheduleModel = mongoose.model('schedule', schedule);
            //スケジュールを取得
            ScheduleModel.findById(hashid, function (err, result) {
                if (err) {
                    resolve(null);
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
    },

    insertSchedule: function () {
        return new Promise((resolve, reject) => {
            //スケジュールをinsert
            var ScheduleModel = mongoose.model('schedule', schedule);
            var insertObj = new ScheduleModel();
            //Todo insertObjに対する値の設定
            insertObj.save(function (err) {
                if (err) {
                    console.log(err);
                    resolve(err)
                }
                else {
                    const resultJson = {
                        "message": "Registration completed.",
                        "scheduleId": insertObj._id
                    }
                    resolve(resultJson);
                }
            });
        });
    },
    calculateSchedule: function (hashid) {
        return new Promise((resolve, reject) => {
            //シフト表の設定を取得する
            this.getSchedule(hashid).then((scheduleSettings) => {
                //シフト表が完成したかどうかフラグ
                var completeFlg = false;

                //設定をもとにシフト表を計算
                while (!completeFlg) {
                    //1 シフトに値を（ランダムに）設定
                    var calShift = setMembersToShift(scheduleSettings);
                    //2 作成したシフト表の検査をする
                    completeFlg = validateShift(scheduleSettings, calShift);
                    //3 ダメなら2へ
                }
                //4 返却
                resolve(calShift);
            });
        });
    }
}

class member {
    name;
}

class daySetting {
    member;
    //1日当たりの人数を引数とする
    constructor(number) {
        this.member = {};
        this.member[0] = {};
        this.member[1] = {};
        for (let i = 1; i <= number; i++) {
            //午前
            this.member[0][i] = "";
            //午後
            this.member[1][i] = "";
        }
    }
    getMorningMembers() {
        return this.member[0];
    }
    getEveningMembers() {
        return this.member[1];
    }
    getMorningMember(number) {
        return this.member[0][number];
    }
    getEveningMember(number) {
        return this.member[1][number];
    }
    setMorningMember(number, val) {
        this.member[0][number] = val;
    }
    setEveningMember(number, val) {
        this.member[1][number] = val;
    }
}

class shift {
    month;
    year;
    daysMembers;
    peoplePerDay;
    DoW;
    dayNum;
    constructor(year, month, peoplePerDay) {
        this.month = month;
        this.year = year;
        this.DoW = this.calDoW(year, month);
        this.dayNum = this.calDayNum(year, month);
        this.peoplePerDay = peoplePerDay;
        this.daysMembers = {};
        for (let i = 0; i < this.dayNum; i++) {
            this.daysMembers[i] = new daySetting(this.peoplePerDay);
        }
    }

    //Todo プライベート化、全量記載
    //Todo Moment.jsを活用する！！！！
    calDoW(year, month) {
        return "1"
    }
    //Todo プライベート化、全量記載
    calDayNum(year, month) {
        return 30;
    }

    //Todo すべてのカテゴリ記載
    static convertDoWCategoryToName(category) {
        switch (category) {
            case "1":
                return "日曜日";
            default:
                return "不正な曜日";
        }
    }
}
function setMembersToShift(scheduleSettings) {
    /** 何年、何月のカレンダーか、１日当たりの割り当てメンバー数を指定して
      シフト表オブジェクトを作成 **/
    var year = scheduleSettings.year;
    var month = scheduleSettings.month;
    var peopleperady = scheduleSettings.peopleperday;
    var format = new shift(year, month, 2);

    //Todo 組み合わせ最適化問題？として問題を解くよう修正？
    
    //1日の埋め方パターンを作る
//    pattern[0] pattern[15]
    //Todo パターンの中で、validationエラーになるものを省く
    //Todo 1日単位のvalidationは外だし


    /** シフト表の割り当て可能メンバーをもとにシフト表作成 **/
    var availableMembers = scheduleSettings.members;
    var maxnum = availableMembers.length;
    var totalAssignNum = 0;
    //メンバーを順に割り当て
    for (let [day, daymembers] of Object.entries(format.daysMembers)) {
        //1日単位の処理
        for (let [morOrEve, members] of Object.entries(daymembers.member)) {
            //午前/午後単位の処理
            for (let [memNum, member] of Object.entries(members)) {
                // Todo 総当たりで設定するよう修正
                //ランダムな数値（0～アサイン可能メンバーの数-1）を取得
                //var assignNum = getRandomInt(maxnum);    
                assignNum = totalAssignNum%maxnum;
                //メンバー単位の処理
                format.daysMembers[day].member[morOrEve][memNum] = availableMembers[assignNum].name;
                totalAssignNum += 1;
            }
            validateShift(scheduleSettings,);
        }
    }

    return format;
}


//Todo 指定した日付まででvalidate、calculateshiftの処理の中で1日ごとに呼び出し、エラーとなったら次の組み合わせへ
function validateShift(scheduleSettings, calShift,validateDayNumTo) {
    //Todo scheduleSettingsを活用
    //1日当たりの割り当て数
    const peoplePerDay = scheduleSettings.peopleperday;
    //連続勤務許可日数
    maxworkdaynum = 3;

    //計算結果のシフト表をvalidate
    //メンバーを順に割り当て
    var daynum = 1;
    for (let [day, daymember] of Object.entries(calShift.daysMembers)) {
        /** 1日単位のチェック **/
        //連続勤務許可日数を超えてシフトに入っている場合、アウト
        if(daynum>=maxworkdaynum){
            //処理対象日と、その前の日を比較
            for(let checkdaynum=daynum-maxworkdaynum+1;checkdaynum<daynum;checkdaynum++){
                format.daysMembers[daynum]
                format.daysMembers[checkdaynum];
            }
        }

        //２．午前のmemberと午後のmemberで同じ人がいたらアウト
        //Todo Setでの等価比較どうやってるか？
        var morningMemberSet = new Set();
        for (let [mormemnum, morningmember] of Object.entries(daymember.getMorningMembers())) {
            //Todo 最終的にIDになる
            morningMemberSet.add(morningmember);
        }
        var eveningMemberSet = new Set();
        for (let [evememnum, eveningmember] of Object.entries(daymember.getEveningMembers())) {
            //Todo 最終的にIDになる
            eveningMemberSet.add(eveningmember);
        }
        if (morningMemberSet.size != peoplePerDay) {
            return false;
        }
        if (eveningMemberSet.size != peoplePerDay) {
            return false;
        }
        //二つのSETの積集合を計算して、結果が空集合ならOK
        //Todo hasの判定
        const intersection = new Set([...morningMemberSet].filter(e => (eveningMemberSet.has(e))));
        if (intersection.size > 0) {
            return false;
        }

        for (let [morOrEve, members] of Object.entries(daymember.member)) {
            /** 午前/午後単位のチェック**/

            for (let [memNum, member] of Object.entries(members)) {
                //個人のチェック
            }
        }
        daynum += 1;
    }
    return true;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
