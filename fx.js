export const products = [
  {
    name: "반팔티",
    price: 15000,
  },
  {
    name: "긴팔티",
    price: 15000,
  },
  {
    name: "핸드폰케이스",
    price: 15000,
  },
  {
    name: "후드티",
    price: 20000,
  },
];

export const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

export const log = console.log;

export const filter = curry((f, iter) => {
  const res = [];

  iter = iter[Symbol.iterator]();
  let cur;

  while ((cur = iter.next()).done === false) {
    const a = cur.value;
    if (f(a)) res.push(a);
  }
  // for (const a of iter) {
  //   if (f(a)) res.push(a);
  // }
  return res;
});

export const go1 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));

export const reduce = curry((f, acc, iter) => {
  // 초기값이 없으면 첫 번째 값을 초기값으로 사용 ex - reduce(add, nums)
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  } else {
    iter = iter[Symbol.iterator]();
  }

  // 해당 로직은 promise에서 then은 새로운 Promise를 반환하기 때문에 불필요한 로드가 생겨 성능 저하가 생긴다.
  // let cur;

  // while (!(cur = iter.next()).done) {
  //   const a = cur.value;
  //   // acc = f(acc, a);
  //   acc = acc instanceof Promise ? acc.then((acc) => f(acc, a)) : f(acc, a);
  // }

  // return acc;

  // 유명함수: 함수에 이름을 붙여서 재귀를 구현하는 방법

  function recur(acc) {
    let cur;
    while (!(cur = iter.next()).done) {
      const a = cur.value;
      acc = f(acc, a);
      if (acc instanceof Promise) return acc.then(recur);
    }
    return acc;
  }

  return go1(acc, recur);
});

export const map = curry((f, iter) => {
  let res = [];
  // for (const a of iter) {
  //   // f함수를 받아 어떤 값을 수집할건지 f함수의 위임을 한다.
  //   res.push(f(a));
  // }
  iter = iter[Symbol.iterator]();
  let cur;

  while (!(cur = iter.next()).done) {
    const a = cur.value;
    res.push(f(a));
  }
  return res;
});

export const add = (a, b) => a + b;

export const mult = curry((a, b, c, d) => a * b * c * d);

export const go = (...args) => reduce((a, f) => f(a), args);

export const pipe =
  (...args) =>
  (a) =>
    go(a, ...args);
