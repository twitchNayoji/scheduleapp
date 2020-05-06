// mongooseを利用
const mongoose = require('mongoose');

// Scheduleスキーマを読み込み
const schedule = require('./schema/scheduleSchema');

// utilを読み込み
const util = require('../utils/logicutil')

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

/**
 * メンバーの添え字は1から！
 */
class daySetting {
    //daySettingパターンId
    patternId;
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
        this.patternId = 0;
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
    var peopleperday = scheduleSettings.peopleperday;
    var format = new shift(year, month, 2);

    //Todo 組み合わせ最適化問題？として問題を解くよう修正？

    /** 1日の埋め方パターンを作る **/
    var patterns = [];
    var nest = 2 * peopleperday;
    var members = scheduleSettings.members;

    //nest階層分直積を計算
    var memberProducts = util.calcProduct(members, nest);
    var patternItemId = 1;
    memberProducts.forEach(e => {
        var patternItem = new daySetting(peopleperday);
        var memberIndex = 0;
        for (let i = 0; i < 2; i++) {
            //午前/午後
            for (let j = 1; j <= peopleperday; j++) {
                //メンバーの添え字は1から！
                patternItem.member[i][j] = e[memberIndex].name;
                memberIndex += 1;
            }
        }
        patternItem.patternId = patternItemId;
        patterns.push(patternItem);
        patternItemId += 1;
    });

    //パターンIdは1～patternIdMaxまで。0は未設定状態。
    const patternIdMax = patternItemId - 1;
    //Todo パターンの中で、validationエラーになるものを省く
    //Todo 1日単位のvalidationは外だし


    /** パターンをもとにシフト表作成 **/
    //メンバーを順に割り当て
    var targetDayNum = 0;
    var dayNumMax = Object.keys(format.daysMembers).length;
    while (targetDayNum < dayNumMax && targetDayNum >= 0) {
        //patternIdは1から降られており、patternsに添え字0から追加されていっているので
        //patternIdはそのまま次のpatternの添え字として利用できる
        var nextPatternId = format.daysMembers[targetDayNum].patternId;
        if (nextPatternId < patternIdMax) {
            //パターンがmaxに行ってない場合は、次のパターンを設定
            format.daysMembers[targetDayNum] = patterns[nextPatternId];
        }
        else {
            //処理日のdaysmemberを初期化
            format.daysMembers[targetDayNum] = new daySetting(peopleperday);
            //処理日を1日前に戻す。
            targetDayNum -= 1;
            console.log("後退した。。。 To：" + targetDayNum);
        }
        if (validateShift(scheduleSettings, format, targetDayNum)) {
            targetDayNum += 1;
            console.log("進んだ！ To：" + targetDayNum);
        }
    }

    return format;
}


//Todo 指定した日付まででvalidate、calculateshiftの処理の中で1日ごとに呼び出し、エラーとなったら次の組み合わせへ
/**
 * 
 * @param {*} scheduleSettings 
 * @param {*} calShift 
 * @param {Number} validateDayNumTo 指定した日数を含む
 */
function validateShift(scheduleSettings, calShift, validateDayNumTo) {
    //Todo scheduleSettingsを活用
    //1日当たりの割り当て数
    const peoplePerDay = scheduleSettings.peopleperday;
    //連続勤務許可日数
    maxworkdaynum = 3;

    //計算結果のシフト表をvalidate
    //メンバーを順に割り当て
    var dayNumMax = Object.keys(calShift.daysMembers).length;
    for (let daynum = 0; daynum < dayNumMax; daynum++) {
        var daymember = calShift.daysMembers[daynum];
        //指定した日付まで検査する。
        if (daynum > validateDayNumTo) {
            break;
        }
        
        /** 1日単位のチェック **/
        //連続勤務許可日数を超えてシフトに入っている場合、アウト
        if (daynum >= maxworkdaynum - 1) {
            //連続勤務者SET
            var contMembers = null;
            //処理対象日と、その前の日を比較
            for (let checkdaynum = daynum - (maxworkdaynum - 1); checkdaynum < daynum; checkdaynum++) {
                calShift.daysMembers[daynum];
                //本日のメンバーSETを作成
                var todaymemberset = new Set();
                for (let [mormemnum, todaymember] of Object.entries(daymember.getMorningMembers())) {
                    //Todo 最終的にIDになる
                    todaymemberset.add(todaymember);
                }
                for (let [mormemnum, todaymember] of Object.entries(daymember.getEveningMembers())) {
                    //Todo 最終的にIDになる
                    todaymemberset.add(todaymember);
                }
                //チェック対象処理日のメンバーSETを作成
                var checkdaymemberset = new Set();
                for (let [mormemnum, checkdaymember] of Object.entries(calShift.daysMembers[checkdaynum].getMorningMembers())) {
                    //Todo 最終的にIDになる
                    checkdaymemberset.add(checkdaymember);
                }
                for (let [mormemnum, checkdaymember] of Object.entries(calShift.daysMembers[checkdaynum].getEveningMembers())) {
                    //Todo 最終的にIDになる
                    checkdaymemberset.add(checkdaymember);
                }
                //二つのSETの積集合を計算して、結果が空集合ならOK
                //Todo hasの判定
                const intersection = new Set([...todaymemberset].filter(e => (checkdaymemberset.has(e))));
                if (intersection.size == 0) {
                    //結果が空の場合は、３連続同じ人が勤務することはないので処理を終了
                    break;
                }
                if(contMembers==null){
                    contMembers = intersection;
                }else{
                    contMembers = new Set([...contMembers].filter(e => (intersection.has(e))));
                }
            }

            if(contMembers!=null){
                //連続勤務者が存在する場合、エラー
                if (contMembers.size > 0) {
                    return false;
                }
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
    }

    // Todo 最終日まで全部埋めたとき限定のチェック処理
    if(validateDayNumTo == calShift.dayNum){
        //メンバー毎の割り当て数を計算し、均等化（MAX - MIN = 1）

    }

    return true;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
