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
