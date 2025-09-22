## L.faltten & L.flatMap

```
const isIterable = (a) => a && a[Symbol.iterator];

L.flatten = function* (iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* a;
    else yield a;
  }
};

L.deepFlat = function* f(iter) {
  for (const a of iter) {
    if (isIterable(a)) yield* f(a);
    else yield a;
  }
};

L.flatMap = curry(pipe(L.map, L.flatten));
```

### 지연성 / 이터러블 중심 프로그래밍 실무적인 코드

- 함수형 프로그래밍이란, 고차 함수를 중심으로 보조 함수를 데이터에 적절히 결합하여, 구체적인 구현보다는 추상적 사고를 통해 문제를 해결하는 프로그래밍 방식.

```
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

```
