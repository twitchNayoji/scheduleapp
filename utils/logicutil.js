
//result[0] = [array[0],array[0],array[0],array[0]]
//result[1] = [array[0],array[0],array[0],array[1]]
//・・・
//result[n^4-1] = [array[n],array[n],array[n],array[n]]
//number = 直積後の次元数
//number = 0 => return null
//number = 1 => return array
//直積かつ、重複排除しない（する場合は↓）
function calcProduct(array, number) {
    if (number == 0) { return null }
    //Todo 重いので、最適なアルゴリズムに修正する。（number=5以上に耐えられなさそう。）
    const x = array.concat();
    var ans = array.concat();
    for (let i = 0; i < number-1; i++) {
        var product = ans.map(e0 => (x.map(e1 => ([e0, e1]))))
            .reduce((acc, e) => ([...acc, ...e]), []);

        ans = product.map(x => {
            if (Array.isArray(x[0])) {
                return [...x[0]].concat(x[1]);
            } else {
                return [x[0]].concat(x[1]);
            }
        });
        //重複を消す場合はこちら
        // ans = ans.filter(x=>{
        //     var setx = new Set(x);
        //     return x.length == setx.size;
        // })
    }

    return ans;
}

/**
 * 配列内の最大値を検索する
 * @param {[]} array 
 */
function getArrayMaxVal(array){
    return array.reduce((a,b)=>a>b?a:b);
}


/**
 * 配列内の最小値を検索する
 * @param {Number[]} array 
 */
function getArrayMinVal(array){
    return array.reduce((a,b)=>a>b?b:a);
}

module.exports = {
    calcProduct,
    getArrayMaxVal,
    getArrayMinVal
}


// var test = [11,2,333,2,0,44,55,-1];
// console.log(getArrayMaxVal(test));
// console.log(getArrayMinVal(test));


// const x = new Set([1, 2, 3]);
// const product = new Set(
//     [...x]
//         .map(e0 => ([...x].map(e1 => ([e0, e1]))))
//         .reduce((acc, e) => ([...acc, ...e]), []));


// var test = [...product].map(x => {
//     if (Array.isArray(x[0])) {
//         return [...x[0]].concat(x[1]);
//     } else {
//         return [x[0]].concat(x[1]);
//     }
// });


// const product2 = new Set(
//     [...product]
//         .map(e0 => ([...x].map(e1 => ([e0, e1]))))
//         .reduce((acc, e) => ([...acc, ...e]), []));

// var test = [...product2].map(x => {
//     if (Array.isArray(x[0])) {
//         return [...x[0]].concat(x[1]);
//     } else {
//         return [x[0]].concat(x[1]);
//     }
// });


// const xx = ["nayoji", "keiko", "he","a1","a2","a3","a4","a5","a6","a7","a8","a9","a10"];
// //const xx = ["nayoji", "keiko", "he","a1","a2","a3","a4"];

// calresult = calcProduct(xx, 4);
// console.log(calresult);
// console.log(calresult.length);
