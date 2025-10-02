import {
  go,
  filter,
  map,
  reduce,
  log,
  add,
  curry,
  pipe,
  nop,
  go1,
  take,
  range,
  noop,
} from "./fx.js";

// 동작 방식이 핵심차이 (즉시평가 vs 느긋한 평가)

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

// 이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation)
// - 제때 계산법
// - 느긋한 계산법
// - 제너레이터이터레이터 프로토콜을 기반으로 구현

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

// L.filter
L.filter = curry(function* (fn, iter) {
  for (const a of iter) {
    const b = go1(a, fn);

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
const C = {};

const catchNoop = (arr) => (
  arr.forEach((a) => (a instanceof Promise ? a.catch(noop) : a)), arr
);
C.take = curry((l, iter) => take(l, catchNoop([...iter])));
C.reduce = curry((f, acc, iter) => {
  const iter2 = iter ? [...iter] : [...acc];
  iter2.forEach((a) => a.catch(noop));
  return iter ? reduce(f, acc, iter2) : reduce(f, iter2);
});
C.takeAll = C.take(Infinity);
C.map = curry(pipe(L.map, C.takeAll));
C.filter = curry(pipe(L.filter, C.takeAll));

// 지연된 함수열을 병렬적으로 평가하기 - C.reduce, C.take
const delay500 = (a, name) =>
  new Promise((resolve) => {
    log(`${name}: ${a}`);
    setTimeout(() => resolve(a), 500);
  });

const delay1000 = (a, name) =>
  new Promise((resolve) => {
    log(`${name}: ${a}`);
    setTimeout(() => resolve(a), 1000);
  });

const delayI = (a) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(a), 100);
  });

go(
  [1, 2, 3, 4, 5],
  L.map((a) => delay1000(a * a)),
  L.filter((a) => delay1000(a % 2)),
  L.map((a) => delay1000(a * a)),
  reduce(add),
  log
);

map((a) => delay1000(a * a), [1, 2, 3, 4, 5]).then(log);
filter((a) => delay1000(a % 2), [1, 2, 3, 4, 5]).then(log);
C.map((a) => delay1000(a * a), [1, 2, 3, 4, 5]);
C.filter((a) => delay1000(a % 2), [1, 2, 3, 4, 5]);
console.time(""),
  go(
    [1, 2, 3, 4, 5, 6, 7, 8],
    L.map((a) => delay500(a * a, "map1")),
    L.filter((a) => delay500(a % 2, "filter1")),
    L.map((a) => delay500(a + 1, "map3")),
    take(4),
    // reduce(add),
    log,
    (_) => console.timeEnd("")
  );
