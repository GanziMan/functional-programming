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
  console.log("2");
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
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    res.push(a);
    if (res.length === l) return res;
  }
  return res;
});

// 이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation)
// - 제때 계산법
// - 느긋한 계산법
// - 제너레이터이터레이터 프로토콜을 기반으로 구현

// L.map
L.map = curry(function* (fn, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    yield fn(a);
  }
  // for (const a of iter) yield fn(a);
});

// L.filter
L.filter = curry(function* (fn, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    if (fn(a)) yield a;
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

log(queryStr({ limit: 10, offset: 20, type: "notice" })); // limit=10&offset=20&type=notice

// 이터러블 중심 프로그래밍 실무적인 코드
L.flatten = function* (iter) {
  for (const a of iter) {
    if (a && a[Symbol.iterator]) {
      for (const b of a) yield b;
    } else yield a;
  }
};

const users = [
  {
    name: "a",
    age: 21,
    family: [
      { name: "a1", age: 53 },
      { name: "a2", age: 51 },
      { name: "a3", age: 50 },
      { name: "a4", age: 49 },
    ],
  },
  {
    name: "b",
    age: 22,
    family: [
      { name: "b1", age: 54 },
      { name: "b2", age: 52 },
      { name: "b3", age: 48 },
      { name: "b4", age: 46 },
    ],
  },
  {
    name: "c",
    age: 23,
    family: [
      { name: "c1", age: 55 },
      { name: "c2", age: 53 },
    ],
  },
  {
    name: "d",
    age: 24,
    family: [
      { name: "d1", age: 57 },
      { name: "d2", age: 54 },
      { name: "d3", age: 52 },
      { name: "d4", age: 48 },
    ],
  },
];

const takeAll = take(Infinity);
go(
  users,
  L.map((u) => u.family),
  L.flatten,

  L.filter((u) => u.age < 50),
  L.map((u) => u.name),
  takeAll,
  log
);
