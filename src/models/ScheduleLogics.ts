// mongooseを利用
import mongoose from "mongoose";

// deepCopyにlodashを利用
import lodash from "lodash";

// Scheduleスキーマを読み込み
import schedule from "./schema/scheduleSchema";

// utilを読み込み
import util from "../utils/logicutil";

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
                // Todo ロジック整理し直し
                // 1 シフトに値を（ランダムに）設定
                calShift = setMembersToShift(scheduleSettings);
                // 2 作成したシフト表の検査をする
                // completeFlg = validateShift(scheduleSettings, calShift, calShift.dayNum);
                completeFlg = true;
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

// 集計用
type MemberTotal = {
    contDayNum: number,
    totalDayNum: number
}

/**
 *
 * Todo 別ファイルへ
 */
export class DaySetting {
    // daySettingパターンId
    patternId: number;
    member: string[][];
    // Todo 当日の集計状況の断面
    memTotals: Map<string, MemberTotal> | null;
    // 1日当たりの人数を引数とする
    constructor(peopleperday: number) {
        this.member = [];
        this.member[0] = [];
        this.member[1] = [];
        for (let i = 0; i < peopleperday; i++) {
            // 午前
            this.member[0][i] = "";
            // 午後
            this.member[1][i] = "";
        }
        this.patternId = 0;
        this.memTotals = null;
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
    public getAllMember() {
        return [...this.member[0], ...this.member[1]];
    }
    public setMorningMember(memberIndex: number, val: string) {
        this.member[0][memberIndex] = val;
    }
    public setEveningMember(memberIndex: number, val: string) {
        this.member[1][memberIndex] = val;
    }
}


// Todo コントローラにわたすためのDTOとしてクラス作成
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


// Todo:scheduleSettingsのanyをクラス？schema？あたりに。←mongoose.documentを継承したインタフェースにする
function setMembersToShift(scheduleSettings: any) {
    /*** 何年、何月のカレンダーか、１日当たりの割り当てメンバー数を指定して
      シフト表オブジェクトを作成 **/
    const year = scheduleSettings.year;
    const month = scheduleSettings.month;
    const peopleperday = scheduleSettings.peopleperday;
    const format = new Shift(year, month, 2);


    // Todo 組み合わせ最適化問題？として問題を解くよう修正？

    /*** 1日の埋め方パターンを作る **/
    const patterns: DaySetting[] = createDayMemberPattern(peopleperday, scheduleSettings);
    const patternIdMax = util.getArrayMaxVal(patterns.map(x => x.patternId));

    /*** 集計用のMapをメンバーをもとに初期化 */
    let memberTotals = createZeroMemberTotals(scheduleSettings);

    /*** パターンをもとにシフト表作成 **/
    // メンバーを順に割り当て
    let targetDayNum = 0;
    const dayNumMax = Object.keys(format.daysMembers).length;
    while (targetDayNum < dayNumMax && targetDayNum >= 0) {
        // patternIdは1から降られており、patternsに添え字0から追加されていっているので
        // patternIdはそのまま次のpatternの添え字として利用できる
        let tempMemberTotals = memberTotals;
        const nextPatternId = format.daysMembers[targetDayNum].patternId;
        if (nextPatternId < patternIdMax) {
            // パターンがmaxに行ってない場合は、次のパターンを設定
            const nextPattern = patterns[nextPatternId];
            format.daysMembers[targetDayNum] = nextPattern;
            tempMemberTotals = addDaySettingMemberToMemberTotals(memberTotals, nextPattern);
        }
        else {
            // 処理日のdaysmemberを初期化
            format.daysMembers[targetDayNum] = new DaySetting(peopleperday);
            // 処理日を1日前に戻す。
            targetDayNum -= 1;
            if (targetDayNum > 0) {
                // 集計結果を前々日の結果に戻す。
                const preMemTotals = format.daysMembers[targetDayNum - 1].memTotals;
                if (preMemTotals) {
                    memberTotals = preMemTotals;
                }
            } else if (targetDayNum === 0) {
                // 初日に戻った場合は、集計結果を初期値に戻す。
                memberTotals = setZeroToMemberTotals(memberTotals);
            }
            console.log("後退した。。。 To：" + targetDayNum);
            continue;
        }
        if (validateShift(scheduleSettings, format, targetDayNum, tempMemberTotals)) {
            memberTotals = tempMemberTotals;
            format.daysMembers[targetDayNum].memTotals = memberTotals;
            targetDayNum += 1;
            console.log("進んだ！ To：" + targetDayNum);
        }
    }

    if (targetDayNum < 0) {
        console.log("見つからず・・・");
    }

    return format;
}

function createZeroMemberTotals(scheduleSettings: any) {
    const retVal = new Map<string, MemberTotal>();
    scheduleSettings.members.forEach((e: { id: string, name: string, rules: any }) => {
        const obj: MemberTotal = {
            contDayNum: 0,
            totalDayNum: 0
        }
        retVal.set(e.name, obj);
    });
    return retVal;
}

function setZeroToMemberTotals(memberTotals: Map<string, MemberTotal>) {
    for (const key of memberTotals.keys()) {
        const obj: MemberTotal = {
            contDayNum: 0,
            totalDayNum: 0
        }
        memberTotals.set(key, obj);
    }
    return memberTotals;
}

function addDaySettingMemberToMemberTotals(memberTotals: Map<string, MemberTotal>, nextPattern: DaySetting): Map<string, MemberTotal> {
    // 割り当て数、連続数の更新
    const allMember = nextPattern.getAllMember();
    // 破壊しないよう・・・
    const retTotals = lodash.cloneDeep(memberTotals);
    allMember.forEach(member => {
        const memTotal = retTotals.get(member);
        if (memTotal !== undefined) {
            memTotal.contDayNum += 1;
            memTotal.totalDayNum += 1;
            retTotals.set(member, memTotal);
        }
    });

    const resetTargetMember: string[] = [];
    // 連続してない人の初期化
    retTotals.forEach((val, key) => {
        // 連続数の更新
        if (!allMember.includes(key)) {
            resetTargetMember.push(key);
        }
    });

    resetTargetMember.forEach(member => {
        const memTotal = retTotals.get(member);
        if (memTotal !== undefined) {
            memTotal.contDayNum = 0;
            retTotals.set(member, memTotal);
        }
    })

    return retTotals;
}

function createDayMemberPattern(peopleperday: number, scheduleSettings: any): DaySetting[] {
    const patterns: DaySetting[] = [];
    const nest = 2 * peopleperday;
    const members = scheduleSettings.members;

    // nest階層分直積を計算
    const memberProducts = util.calcProduct(members, nest);
    let patternItemId = 1;
    memberProducts.forEach(e => {
        // memberProductsをもとにDaySettingのメンバーを設定
        let memberIndex = 0;
        const patternItem = new DaySetting(peopleperday);
        for (let i = 0; i < 2; i++) {
            // 午前/午後
            for (let j = 0; j < peopleperday; j++) {
                // 各メンバー
                patternItem.member[i][j] = e[memberIndex].name;
                memberIndex += 1;
            }
        }

        // DaySettingがvalidの場合、パターンとして登録する
        if (validateDaySettingMember(patternItem, peopleperday)) {
            patternItem.patternId = patternItemId;
            patterns.push(patternItem);
            patternItemId += 1;
        }
    });
    return patterns;
}

// Todo 指定した日付まででvalidate、calculateshiftの処理の中で1日ごとに呼び出し、エラーとなったら次の組み合わせへ
/**
 *
 * @param {*} scheduleSettings
 * @param {*} calShift
 * @param {number} validateDayNumTo 指定した日数を含む
 */
function validateShift(scheduleSettings: any, calShift: Shift, validateDayNumTo: number, memberTotals: Map<string, MemberTotal>) {
    // Todo scheduleSettingsを活用
    // 1日当たりの割り当て数
    const peoplePerDay = scheduleSettings.peopleperday;
    // 連続勤務許可日数
    const maxworkdaynum = 3;

    /*** 当日だけのチェックを実施 */
    // 勤務日の均等化チェック
    const memberTotalsummary = [...memberTotals.values()].map(x => x.totalDayNum);
    // 最大値と最小値を取得
    const maxMemberCount = util.getArrayMaxVal(memberTotalsummary);
    const minMemberCount = util.getArrayMinVal(memberTotalsummary);
    // 勤務日の差が２日以上ある場合は、チェックエラー
    // Todo 1をパラメータ化
    if (maxMemberCount - minMemberCount > 1) {
        return false;
    }

    // 連続勤務者チェック
    // Todo 3 をパラメータ化
    const memberContsummary = [...memberTotals.values()].map(x => x.contDayNum).filter(x => x >= 3);
    // 一人以上対象者がいた場合はエラー
    if (memberContsummary.length > 0) {
        return false;
    }

    // Todo 以下、現状処理が存在しないため、コメントアウト
    // 計算結果のシフト表をvalidate
    // メンバーを順に割り当て
    // const dayNumMax = Object.keys(calShift.daysMembers).length;
    // for (let daynum = 0; daynum < dayNumMax; daynum++) {
    //     const daymember = calShift.daysMembers[daynum];
    //     // 指定した日付まで検査する。
    //     if (daynum > validateDayNumTo) {
    //         break;
    //     }
    // }

    return true;
}

/**
 * DaySettingのmemberに関するvalidation
 * @param daySetting validation対象のDaySettingインスタンス
 */
function validateDaySettingMember(daySetting: DaySetting, peopleperday: number): boolean {
    // ２．午前のmemberと午後のmemberで同じ人がいたらアウト
    // Todo Setでの等価比較どうやってるか？
    const morningMemberSet = new Set<string>();
    const eveningMemberSet = new Set<string>();
    daySetting.getMorningMembers().forEach(ele => morningMemberSet.add(ele));
    daySetting.getEveningMembers().forEach(ele => eveningMemberSet.add(ele));

    // 午前メンバー、午後メンバーに、同じ人が入っていた場合は、NG
    if (morningMemberSet.size !== peopleperday) {
        return false;
    }
    if (eveningMemberSet.size !== peopleperday) {
        return false;
    }

    // 午前と午後に同じメンバーが入っていた場合はNG
    // →二つのSETの積集合を計算して、結果が空集合でなかったらNG
    // Todo hasの判定
    const intersection = new Set([...morningMemberSet].filter(e => (eveningMemberSet.has(e))));
    if (intersection.size > 0) {
        return false;
    }

    return true;
}
