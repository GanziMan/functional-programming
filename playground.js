import { go, filter, map, reduce, log, add, curry, pipe } from "./fx.js";

// 동작 방식이 핵심차이 (즉시평가 vs 느긋한 평가)

// 호출 즉시 모든 요소를 한 번에 배열에 담아 반환
const range = (l) => {
  let i = -1;
  const res = [];

  while (++i < l) {
    res.push(i);
  }
  return res;
};

var list = range(4);

// ## 느긋한 L.range
// 배열을 미리 만들지 않고, 값이 필요할 때마다 하나씩 생성(yield)
// list 자체는 배열이 아니라 이터레이터 객체
const L = {};
L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    yield i;
  }
};

var list = L.range(4);

function test(name, time, f) {
  console.time(name);
  while (time--) f();
  console.timeEnd(name);
}

// test("range", 10, () => reduce(add, range(1000000)));
// test("L.range", 10, () => reduce(add, L.range(1000000)));

// take - 이터러블에서 원하는 길이만큼의 값을 가져오는 함수
const take = curry((l, iter) => {
  let res = [];
  iter = iter[Symbol.iterator]();

  return (function recur() {
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      if (a instanceof Promise) {
        return a
          .then((a) => ((res.push(a), res).length === l ? res : recur()))
          .catch((error) => (error === nop ? recur() : Promise.reject(error)));
      }
      res.push(a);
      if (res.length === l) return res;
    }
    return res;
  })();
});

// 이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation)
// - 제때 계산법
// - 느긋한 계산법
// - 제너레이터이터레이터 프로토콜을 기반으로 구현

const go1 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));

// L.map
L.map = curry(function* (fn, iter) {
  // iter = iter[Symbol.iterator]();
  // let cur;
  // while (!(cur = iter.next()).done) {
  //   const a = cur.value;
  //   yield go1(a, fn);
  // }
  for (const a of iter) {
    yield go1(a, fn);
  }
});

const nop = Symbol("nop");
// L.filter
L.filter = curry(function* (fn, iter) {
  for (const a of iter) {
    const b = go1(a, fn);
    log(b);
    if (b instanceof Promise)
      yield b.then((b) => (b ? a : Promise.reject(nop)));
    else if (b) yield a;
  }
});

L.entries = function* (obj) {
  for (const k in obj) yield [k, obj[k]];
};

const join = curry((sep = ",", iter) =>
  reduce((a, b) => `${a}${sep}${b}`, iter)
);

const queryStr = pipe(
  L.entries,
  L.map(([k, v]) => `${k}=${v}`),
  join("&")
);

const isIterable = (a) => a && a[Symbol.iterator];

L.flatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* a;
    else yield a;
  }
};

L.deepFlat = function* f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* L.deepFlat(a);
    else yield a;
  }
};

L.flatMap = curry(pipe(L.map, L.flatten));
const flatMap = curry(pipe(L.map, L.flatten));

// --------------------------------------------------------------
function add10(a, callback) {
  setTimeout(() => callback(a + 10), 1000);
}

function add20(a) {
  return new Promise((resolove) => setTimeout(() => resolove(a + 20), 1000));
}

const delay100 = (a) =>
  new Promise((resolve) => setTimeout(() => resolve(a), 100));

const add5 = (a) => a + 5;

// go1(go1(10, add5), log);

// go1(go1(delay100(10), add5), log);

// go(
//   Promise.resolve(1),
//   (a) => a + 1,
//   (a) => Promise.reject("error~"),
//   log
// ).catch(log);

go(
  [1, 2, 3, 4, 5],
  L.map((a) => Promise.resolve(a * a)),
  L.filter((a) => Promise.resolve(a % 2)),
  reduce(add),
  log
);
