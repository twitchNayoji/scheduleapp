import logicutil from "../../src/utils/logicutil";


/*** test CalcProduct**/
test('array 要素数3, number = 3', () => {
    const testArray = ["hoge","fuga","piyo"];
    const num = 3;
    const expectedval = [["hoge","hoge","hoge"],
    ["fuga","hoge","hoge"],
    ["piyo","hoge","hoge"],
    ["hoge","fuga","hoge"],
    ["fuga","fuga","hoge"],
    ["piyo","fuga","hoge"],
    ["hoge","piyo","hoge"],
    ["fuga","piyo","hoge"],
    ["piyo","piyo","hoge"],
    ["hoge","hoge","fuga"],
    ["fuga","hoge","fuga"],
    ["piyo","hoge","fuga"],
    ["hoge","fuga","fuga"],
    ["fuga","fuga","fuga"],
    ["piyo","fuga","fuga"],
    ["hoge","piyo","fuga"],
    ["fuga","piyo","fuga"],
    ["piyo","piyo","fuga"],
    ["hoge","hoge","piyo"],
    ["fuga","hoge","piyo"],
    ["piyo","hoge","piyo"],
    ["hoge","fuga","piyo"],
    ["fuga","fuga","piyo"],
    ["piyo","fuga","piyo"],
    ["hoge","piyo","piyo"],
    ["fuga","piyo","piyo"],
    ["piyo","piyo","piyo"]
    ];
    const actual = logicutil.calcProduct(testArray,num)
    // expect(actual).toEqual(expectedval);
    expect(actual).toMatchSnapshot();
  });

