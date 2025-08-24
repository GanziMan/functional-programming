## 코드를 값으로 다루어 표현력 높이기

### go, pipe - 함수를 합성해서 순차적으로 실행하기 위한 도구

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
