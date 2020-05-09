// mongooseを利用
import mongoose from "mongoose";

// Scheduleスキーマを読み込み
import schedule from "./schema/scheduleSchema";

// utilを読み込み
import util from "../utils/logicutil";
import { isNull } from "util";
function getSchedule(hashid: string) {
    return new Promise((resolve, reject) => {
        const ScheduleModel = mongoose.model('schedule', schedule);
        // スケジュールを取得
        ScheduleModel.findById(hashid, (err, result) => {
            if (err) {
                resolve(null);
            } else {
                resolve(result);
            }
        });
    });
}
function getScheduleRules(hashid: string) {
    return new Promise((resolve, reject) => {
        const ScheduleModel = mongoose.model('schedule', schedule);
        // スケジュールを取得
        ScheduleModel.findById(hashid, (err, result) => {
            if (err) {
                resolve(null);
            } else {
                let retval = null;
                if (result != null) {
                    // Todo 動作確認要
                    retval = result.get("rules");
                }
                resolve(retval);
            }
        });
    });
}
function getScheduleRule(hashid: string, rulecategory: string) {
    return new Promise((resolve, reject) => {
        const ScheduleModel = mongoose.model('schedule', schedule);
        // スケジュールを取得
        ScheduleModel.findById(hashid, (err, result) => {
            if (err) {
                resolve(null);
            } else {
                let retval = null;
                if (result != null) {
                    // categoryが指定されていない場合は、nullとする。
                    if (rulecategory && (result.get("rules") != null)) {
                        retval = result.get("rules").find((x: { category: string, val1: string, val2: string, val3: string }) => x.category === rulecategory);
                    }
                }
                resolve(retval);
            }
        });
    });
}

function insertSchedule() {
    return new Promise((resolve, reject) => {
        // スケジュールをinsert
        const ScheduleModel = mongoose.model('schedule', schedule);
        const insertObj = new ScheduleModel();
        // Todo insertObjに対する値の設定
        insertObj.save((err) => {
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
}
function calculateSchedule(hashid: string) {
    return new Promise<Shift | null>((resolve, reject) => {
        // シフト表の設定を取得する
        getSchedule(hashid).then((scheduleSettings) => {
            // シフト表が完成したかどうかフラグ
            let completeFlg = false;
            let calShift: Shift | null = null;
            // 設定をもとにシフト表を計算
            while (!completeFlg) {
                // 1 シフトに値を（ランダムに）設定
                calShift = setMembersToShift(scheduleSettings);
                // 2 作成したシフト表の検査をする
                completeFlg = validateShift(scheduleSettings, calShift, calShift.dayNum);
                // 3 ダメなら2へ
            }
            // 4 返却
            resolve(calShift);
        });
    });
}
export default {
    getSchedule,
    getScheduleRules,
    getScheduleRule,
    insertSchedule,
    calculateSchedule
}

// /**
//  * Todo 別ファイルへ
//  */
// class Member {
//     name:string;
//     constructor(name:string){
//         this.name= name;
//     }
// }

/**
 * メンバーの添え字は1から！
 * Todo 別ファイルへ
 */
export class DaySetting {
    // daySettingパターンId
    patternId: number;
    member: string[][];
    // 1日当たりの人数を引数とする
    constructor(peopleperday: number) {
        this.member = [];
        this.member[0] = [];
        this.member[1] = [];
        for (let i = 1; i <= peopleperday; i++) {
            // 午前
            this.member[0][i] = "";
            // 午後
            this.member[1][i] = "";
        }
        this.patternId = 0;
    }
    public getMorningMembers() {
        return this.member[0];
    }
    public getEveningMembers() {
        return this.member[1];
    }
    public getMorningMember(memberIndex: number) {
        return this.member[0][memberIndex];
    }
    public getEveningMember(memberIndex: number) {
        return this.member[1][memberIndex];
    }
    public setMorningMember(memberIndex: number, val: string) {
        this.member[0][memberIndex] = val;
    }
    public setEveningMember(memberIndex: number, val: string) {
        this.member[1][memberIndex] = val;
    }
}

export class Shift {
    month: string;
    year: string;
    daysMembers: DaySetting[];
    peoplePerDay: number;
    DoW: string;
    dayNum: number;
    public constructor(year: string, month: string, peoplePerDay: number) {
        this.month = month;
        this.year = year;
        this.DoW = this.calDoW(year, month);
        this.dayNum = this.calDayNum(year, month);
        this.peoplePerDay = peoplePerDay;
        this.daysMembers = [];
        for (let i = 0; i < this.dayNum; i++) {
            this.daysMembers[i] = new DaySetting(this.peoplePerDay);
        }
    }

    // Todo プライベート化、全量記載
    // Todo Moment.jsを活用する！！！！
    public calDoW(year: string, month: string) {
        return "1"
    }
    // Todo プライベート化、全量記載
    public calDayNum(year: string, month: string) {
        return 30;
    }

    // Todo すべてのカテゴリ記載
    public static convertDoWCategoryToName(category: string) {
        switch (category) {
            case "1":
                return "日曜日";
            default:
                return "不正な曜日";
        }
    }
}

// Todo:scheduleSettingsのanyをクラス？schema？あたりに。
function setMembersToShift(scheduleSettings: any) {
    /*** 何年、何月のカレンダーか、１日当たりの割り当てメンバー数を指定して
      シフト表オブジェクトを作成 **/
    const year = scheduleSettings.year;
    const month = scheduleSettings.month;
    const peopleperday = scheduleSettings.peopleperday;
    const format = new Shift(year, month, 2);

    // Todo 組み合わせ最適化問題？として問題を解くよう修正？

    /*** 1日の埋め方パターンを作る **/
    const patterns: DaySetting[] = [];
    const nest = 2 * peopleperday;
    const members = scheduleSettings.members;

    // nest階層分直積を計算
    const memberProducts = util.calcProduct(members, nest);
    let patternItemId = 1;
    memberProducts.forEach(e => {
        const patternItem = new DaySetting(peopleperday);
        let memberIndex = 0;
        for (let i = 0; i < 2; i++) {
            // 午前/午後
            for (let j = 1; j <= peopleperday; j++) {
                // メンバーの添え字は1から！
                patternItem.member[i][j] = e[memberIndex].name;
                memberIndex += 1;
            }
        }
        patternItem.patternId = patternItemId;
        patterns.push(patternItem);
        patternItemId += 1;
    });

    // パターンIdは1～patternIdMaxまで。0は未設定状態。
    const patternIdMax = patternItemId - 1;
    // Todo パターンの中で、validationエラーになるものを省く
    // Todo 1日単位のvalidationは外だし


    /*** パターンをもとにシフト表作成 **/
    // メンバーを順に割り当て
    let targetDayNum = 0;
    const dayNumMax = Object.keys(format.daysMembers).length;
    while (targetDayNum < dayNumMax && targetDayNum >= 0) {
        // patternIdは1から降られており、patternsに添え字0から追加されていっているので
        // patternIdはそのまま次のpatternの添え字として利用できる
        const nextPatternId = format.daysMembers[targetDayNum].patternId;
        if (nextPatternId < patternIdMax) {
            // パターンがmaxに行ってない場合は、次のパターンを設定
            format.daysMembers[targetDayNum] = patterns[nextPatternId];
        }
        else {
            // 処理日のdaysmemberを初期化
            format.daysMembers[targetDayNum] = new DaySetting(peopleperday);
            // 処理日を1日前に戻す。
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


// Todo 指定した日付まででvalidate、calculateshiftの処理の中で1日ごとに呼び出し、エラーとなったら次の組み合わせへ
/**
 *
 * @param {*} scheduleSettings
 * @param {*} calShift
 * @param {number} validateDayNumTo 指定した日数を含む
 */
function validateShift(scheduleSettings: any, calShift: Shift, validateDayNumTo: number) {
    // Todo scheduleSettingsを活用
    // 1日当たりの割り当て数
    const peoplePerDay = scheduleSettings.peopleperday;
    // 連続勤務許可日数
    const maxworkdaynum = 3;

    // 計算結果のシフト表をvalidate
    // メンバーを順に割り当て
    const dayNumMax = Object.keys(calShift.daysMembers).length;
    for (let daynum = 0; daynum < dayNumMax; daynum++) {
        const daymember = calShift.daysMembers[daynum];
        // 指定した日付まで検査する。
        if (daynum > validateDayNumTo) {
            break;
        }

        /*** 1日単位のチェック **/
        // 連続勤務許可日数を超えてシフトに入っている場合、アウト
        if (daynum >= maxworkdaynum - 1) {
            // 連続勤務者SET
            let contMembers: Set<string> | null = null;
            // 処理対象日と、その前の日を比較
            for (let checkdaynum = daynum - (maxworkdaynum - 1); checkdaynum < daynum; checkdaynum++) {
                // 本日のメンバーSETを作成
                const todaymemberset = new Set<string>();
                for (const [mormemnum, todaymember] of Object.entries(daymember.getMorningMembers())) {
                    // Todo 最終的にIDになる
                    todaymemberset.add(todaymember);
                }
                for (const [mormemnum, todaymember] of Object.entries(daymember.getEveningMembers())) {
                    // Todo 最終的にIDになる
                    todaymemberset.add(todaymember);
                }
                // チェック対象処理日のメンバーSETを作成
                const checkdaymemberset = new Set<string>();
                for (const [mormemnum, checkdaymember] of Object.entries(calShift.daysMembers[checkdaynum].getMorningMembers())) {
                    // Todo 最終的にIDになる
                    checkdaymemberset.add(checkdaymember);
                }
                for (const [mormemnum, checkdaymember] of Object.entries(calShift.daysMembers[checkdaynum].getEveningMembers())) {
                    // Todo 最終的にIDになる
                    checkdaymemberset.add(checkdaymember);
                }
                // 二つのSETの積集合を計算して、結果が空集合ならOK
                // Todo hasの判定
                const intersectionCont = new Set([...todaymemberset].filter(e => (checkdaymemberset.has(e))));
                if (intersectionCont.size === 0) {
                    // 結果が空の場合は、３連続同じ人が勤務することはないので処理を終了
                    break;
                }
                if (contMembers == null) {
                    contMembers = intersectionCont;
                } else {
                    const contMembersArray: string[] = [...contMembers];
                    contMembers = new Set(contMembersArray.filter(e => (intersection.has(e))));
                }
            }

            if (contMembers != null) {
                // 連続勤務者が存在する場合、エラー
                if (contMembers.size > 0) {
                    return false;
                }
            }
        }

        // ２．午前のmemberと午後のmemberで同じ人がいたらアウト
        // Todo Setでの等価比較どうやってるか？
        const morningMemberSet = new Set();
        for (const [mormemnum, morningmember] of Object.entries(daymember.getMorningMembers())) {
            // Todo 最終的にIDになる
            morningMemberSet.add(morningmember);
        }
        const eveningMemberSet = new Set();
        for (const [evememnum, eveningmember] of Object.entries(daymember.getEveningMembers())) {
            // Todo 最終的にIDになる
            eveningMemberSet.add(eveningmember);
        }
        if (morningMemberSet.size !== peoplePerDay) {
            return false;
        }
        if (eveningMemberSet.size !== peoplePerDay) {
            return false;
        }
        // 二つのSETの積集合を計算して、結果が空集合ならOK
        // Todo hasの判定
        const intersection = new Set([...morningMemberSet].filter(e => (eveningMemberSet.has(e))));
        if (intersection.size > 0) {
            return false;
        }

        for (const [morOrEve, members] of Object.entries(daymember.member)) {
            /*** 午前/午後単位のチェック**/

            for (const [memNum, member] of Object.entries(members)) {
                // 個人のチェック
            }
        }

    }

    // 6日単位で、割り当て人数の均等化☑を実施、ただし最終日でも確認
    if (validateDayNumTo % 6 === 0 || validateDayNumTo === calShift.dayNum - 1) {
        const membercount: Map<string, number> = new Map<string, number>();
        // メンバーで初期化
        scheduleSettings.members.forEach((e: { id: string, name: string, rules: any }) => {
            membercount.set(e.name, 0);
        });
        for (const [mormemnum, daysetting] of Object.entries(calShift.daysMembers)) {
            const members = [...Object.values(daysetting.getMorningMembers()), ...Object.values(daysetting.getEveningMembers())];
            members.forEach((e) => {
                if (e) {
                    let currentCount = membercount.get(e);
                    if (currentCount === undefined) { currentCount = 0 }
                    const nextCount = currentCount + 1;
                    membercount.set(e, nextCount);
                }
            });
        }
        // メンバーごとの合計から、最大値と最小値を取得
        const membersummary = Object.values(membercount);
        // 最大値を取得
        const maxMemberCount = util.getArrayMaxVal(membersummary);
        const minMemberCount = util.getArrayMinVal(membersummary);
        // 勤務日の差が２日以上ある場合は、チェックエラー
        // Todo 1をパラメータ化
        if (maxMemberCount - minMemberCount > 1) {
            return false;
        } else {
            // Todo デバッグ用、後で削除
            if (validateDayNumTo === calShift.dayNum - 1) {
                console.log(membercount);
            }
        }
    }

    return true;
}

