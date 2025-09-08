## go, pipe - 함수를 합성해서 순차적으로 실행하기 위한 도구

- go: 즉시 실행되는 함수 합성
- 0 → a + 1 → a + 10 → a + 100 → console.log
  실행 결과를 순서대로 전달하면서 데이터 흐름을 함수로 표현 - 값을 흘려보내며 즉시 실행하는 방식

```
const go = (...args) => reduce((a, f) => f(a), args);
go(
  0,
  (a) => a + 1,
  (a) => a + 10,
  (a) => a + 100,
  console.log
); // 111
```

- pipe: 함수 합성 자체를 값(새로운 함수)으로 만드는 역할
- 내부에서 go를 사용한다.

```
const pipe =
  (f, ...fns) =>
  (...as) =>
    go(f(...as), ...fns);

const f = pipe(
  (a, b) => a + b,
  (a) => a + 10,
  (a) => a + 100
);

f(0, 1); // 111
```

- 위에서 부터 아래로 읽을 수 있어 직관적
- 각 단계에서 어떤 변환이 일어나는지 명확하게 드러난다.

```
go(
  products,
  (products) => filter((p) => p.price < 20000, products),
  (products) => map((p) => p.price, products),
  (prices) => reduce(add, prices),
  console.log
);
```

## curry - 여러 개의 인자를 받는 함수를 인자를 하나씩만 받는 함수들의 연속으로 변환하는 기법

```
export const curry =
  (f) =>
  (a, ..._) =>
    _.length ? f(a, ..._) : (..._) => f(a, ..._);

// 커링을 통해 각 함수가 하나의 인자만 받는 형태로 변환되었기 때문에 인자를 바로 넘겨줄 수 있다.
// 예를 들어, filter 함수는 이제 (조건, 배열) 형태가 아니라 (조건) 형태로 사용할 수 있다.
// 이로 인해 코드가 더 간결해지고 가독성이 높아진다.

go(
  products,
  filter((p) => p.price < 20000),
  map((p) => p.price),
  reduce(add),
  log
);


```

## 함수 조합으로 함수 만들기

```
// pipe - 함수들이 나열되어있는 합성된 함수를 만드는 것 (함수를 리턴하는 함수이기에 () => {})

const total_price = pipe(
  map((p) => p.price),
  reduce(add)
);

const base_total_price = (predi) => pipe(filter(predi), total_price);

go(products, base_total_price, log);
```

```
const products = [
  { name: "반팔티", price: 15000, quantity: 1 },
  { name: "청바지", price: 30000, quantity: 2 },
  { name: "운동화", price: 50000, quantity: 3 },
  { name: "모자", price: 10000, quantity: 4 },
];

// sum은 추상화 레벨이 높아진 함수
const sum = curry((f, iter) => go(iter, map(f), reduce(add)));
const total_quantity = sum((product) => product.quantity);

const total_price = sum((product) => product.price * product.quantity);

const products = [
  { name: "반팔티", price: 15000, quantity: 1 },
  { name: "청바지", price: 30000, quantity: 2 },
  { name: "운동화", price: 50000, quantity: 3 },
  { name: "모자", price: 10000, quantity: 4 },
];

// sum은 추상화 레벨이 높아진 함수
const sum = curry((f, iter) => go(iter, map(f), reduce(add)));
const total_quantity = sum((product) => product.quantity);

const total_price = sum((product) => product.price * product.quantity);
```

## 동작 방식이 핵심차이 (즉시평가 vs 느긋한 평가)

```
// 호출 즉시 모든 요소를 한 번에 배열에 담아 반환

const range = (l) => {
  let i = -1;
  const res = [];

  while (++i < l) {
    res.push(i);
  }
  return res;
};


// 배열을 미리 만들지 않고, 값이 필요할 때마다 하나씩 생성(yield), list 자체는 배열이 아니라 이터레이터 객체

const L = {};
L.range = function* (l) {
  let i = -1;
  while (++i < l) {
    yield i;
  }
};

```

| 구분        | `range`                   | `L.range`                             |
| ----------- | ------------------------- | ------------------------------------- |
| 평가 방식   | 즉시(Eager)               | 느긋(Lazy)                            |
| 반환값      | 완성된 배열               | Generator (이터레이터)                |
| 메모리 사용 | `n` 크기의 배열           | 1개 값만 유지 (메모리 효율 ↑)         |
| 활용 적합   | 작은 크기, 즉시 쓰는 경우 | 큰 데이터, 스트리밍, 부분만 필요할 때 |

### take - 이터러블에서 원하는 길이만큼의 값을 가져오는 함수

- `take(l, iter)`는 이터러블에서 앞에서부터 `l`개만 뽑아 배열로 반환한다.
- 핵심은 **지연 평가 체인(L.\*)와 만나면, 필요한 만큼만 실제로 생성/계산된다**는 점.

```
const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length === l) return res;
  }
  return res;
});

go(range(10000), take(5), reduce(add), log);

go(L.range(10000), take(5), reduce(add), log);
```

### 이터러블 중심 프로그래밍에서의 지연 평가 (Lazy Evaluation)

- 제때 계산법
- 느긋한 계산법
- 제너레이터이터레이터 프로토콜을 기반으로 구현

```
L.map = function* (fn, iter) {
  for (const a of iter) yield fn(a);
};

const it = L.map(a => a + 10, [1,2,3])

log(it.next()); // 원하는 값만 계산하고 싶을 떄, 제때 계산법
```

```
L.filter = function* (fn, iter){
  for (const a of iter) if(fn(a)) yield a;
}

const it = L.filter(a => a % 2 , [1, 2, 3, 4]);

log(it.next());
log(it.next());
log(it.next());
log(it.next());
```

### L.map

```
L.map = curry(function* (fn, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    yield fn(a);
  }
  // for (const a of iter) yield fn(a);
});
```

### L.filter

```
L.filter = curry(function* (fn, iter) {
  iter = iter[Symbol.iterator]();
  let cur;
  while (!(cur = iter.next()).done) {
    const a = cur.value;
    if (fn(a)) yield a;
  }
});
```
