## 일급

- 값으로 다룰 수 있다.
- 변수에 담을 수 있다.
- 함수의 인자로 사용될 수 있다.
- 함수의 결과로 사용될 수 있다.

### 자바크립트에서의 함수는 일급이다.

- 함수를 값으로 다룰 수 있다.
- 조합성과 추상화의 도구

## 고차함수

- 함수를 값으로 다루는 함수

### 함수를 인자로 받아서 실행하는 함수

```jsx
const apply = (f) => f(1);
const add = (a) => a + 2;
log(apply1(add2)); // 1
log(apply1((a) => a - 1)); // 0

const times = (f, n) => {
  let i = -1;
  while (++i < n) f(i);
};

times(log, 3); // 0,1,2
times((a) => log(a + 10), 3); // 10 11 12
```

### 함수를 만들어 값으로 리턴하는 함수

## 기존과 달라진 ES6에서의 리스트 순회

```jsx
const list = [1, 2, 3];

// ES6 이전
for (var i = 0; i < list.length; i++) {
  log(list[i]);
}

// ES6 이후
for (const a of list) {
  log(a);
}
```

다음과 같이 ES6 이후에 나온 for문이 바뀌면서 코드가 간결하게 작성된 장점도 있지만 이외에 어떤 장점이 있을까요??

### Symbol

- ES6이후에 생겼다.
- Symbol.iterator → 객체의 키로 사용될 수 있다.

```jsx
Array를 통해 알아보기
const array = [1,2,3]
for(const a of array) log(a)
// 1 2 3

Set을 통해 알아보기
const set = new Set([1,2,3]);
for(const a of set) log(a)
// 1 2 3

Map을 통해 알아보기
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
for(const a of map) log(a)
// 1 2 3
```

Symbol.iterator로 실행한 이터레이터를 순회하면서 안쪽에 value로 떨어지는 값을 출력합니다.

```jsx
const arr = [1, 2, 3];
let iter1 = arr[Symbol.iterator]();
for (const a of iter1) console.log(a);

const set = new Set([1, 2, 3]);
let iter2 = set[Symbol.iterator]();
for (const a of iter2) console.log(a);

const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);
let iter3 = map[Symbol.iterator]();
for (const a of iter3) console.log(a);
```

## 제너레이터란?

- 이터러블이며 동시에 이터레이터 = 이터레이터를 리턴하는 함수 (async가 Promise를 리턴하듯이, 제너레이터는 이터레이터를 리턴하는 함수이다.)
- 제네레이터 함수는 일반 함수와는 다른 독특한 동작을 한다. 제너레이터 함수는, 일반 함수 처럼 함수의 코드 블록을 한번에 실행하지 않고 함수 코드 블록의 실행을 중지했다가 필요한 시점에 재시작할 수 있다.

### yield/next

- yield는 제너레이터 함수의 실행을 일시적으로 정지시키며, yield 뒤에 오는 표현식은 제너레이터의 caller에게 반환된다.
- 즉, value 프로퍼티는 yield문이 반환한 값이고 done 프로퍼티는 제너레이터 함수 내의 모든 yield문이 실행되었는지를 나타내는 boolean타입의 값이다.

## 이터러블/이터레이터 프로토콜

- 이터러블: 이터레이터를 리턴하는 [Symbol.iterator]()를 가진 값 → “반복할 수 있는 애”
- 이터레이터: {value, done} 객체를 리턴하는 next()를 가진 값 → “반복을 실제로 수행하는 도구”
- 이터러블/이터레이터 프로토콜: 이터러블을 for…of, 전개 연산자 등과 함께 동작하도록한 규약

### 사용자 정의 이터러블

```jsx
const iterable = {
  [Symbol.iterator]() {
    // 이터레이터를 반환 해야한다.
    let i = 3;
    return {
      next() {
        return i === 0 ? { done: true } : { value: i--, done: false };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  },
};

let iterator = iterable[Symbol.iterator]();

for (const a of iterator) console.log(a);
```

전개 연산자도 같은 개념으로 규약되어있다.

## map

```
const products = [
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
    price: 15000,
  },
];

const map = (f, iter) => {
  let res = [];
  for (const a of iter) {
    // f함수를 받아 어떤 값을 수집할건지 f함수의 위임을 한다.
    res.push(f(a));
  }
  return res;
};
// map은 products라는 이터러블안에 있는 값에 1:1로 매핑되는 값을 수집하는 보조함수를 넣는다.
// map은 고차함수이다. 함수를 값으로 다루면서 내가 원하는 시점에 안에서 인자로 적용하는 그런 함수이다.
console.log(map((p) => p.name, products));

let prices = [];
for (const p of products) {
  prices.push(p.price);
}
console.log(prices);

```

## 이터러블 프로토콜을 따른 map의 다형성

```
console.log([1, 2, 3].map((a) => a + 1));

console.log(map(el => el.nodeName, document.querySelectorAll("*")));

function* gen() {
  yield 2;
  yield 3;
  yield 4;
}

console.log(map((a) => a * a, gen()));

let m = new Map();

m.set("a", 10);
m.set("b", 20);

console.log(map(([key, value]) => [key, value * 2], m));
console.log(new Map(map(([key, value]) => [key, value * 2], m)));

```

## filter

```
let under20000 = [];

// for (const p of products) {
//   if (p.price < 20000) under20000.push(p);
// }

const filter = (f, iter) => {
  const res = [];

  for (const a of iter) {
    if (f(a)) res.push(a);
  }
  return res;
};
```

## reduce - 값을 축약하는 함수

```
const nums = [1, 2, 3, 4, 5];
let total = 0;

for (const n of nums) {
  total = total + n;
}

const reduce = (f, acc, iter) => {
  // 초기값이 없으면 첫 번째 값을 초기값으로 사용 ex - reduce(add, nums)
  if (!iter) {
    iter = acc[Symbol.iterator]();
    acc = iter.next().value;
  }
  for (const a of iter) {
    acc = f(acc, a);
  }

  return acc;
};

const add = (a, b) => a + b;

console.log(
  reduce((total_price, products) => total_price + products.price, 0, products)
);

```

```
// map + filter + reduce 중첩 사용과 함수형 사고
console.log(
  reduce(
    add,
    map(
      (p) => p.price,
      filter((p) => p.price < 20000, products)
    )
  )
);
// 함수형 사고에서는 log, reduce, add까지는 자연스럽게 이어서 작성할 수 있고, 이어서 reduce가 숫자 배열을 입력으로 받아야 한다는 점을 인식하며, 그 배열을 만들기 위한 filter와 map 과정을 평가·조합해 코드를 작성한다.
```

### map과 filter의 보조 함수들이 외부 상태 변경 없이 입력에 대해서만 동작하는 순수 함수이면, 함수의 조합 순서를 바꿔도 결과가 동일하다는 결합 법칙이 성립한다.
