# 비동기: 동시성 프로그래밍1

## callback과 Promise

비동기 동시성 프로그래밍 방법 2가지

- callback
- promise기반으로한 메서드 체이닝, async await가 있음.

Promise가 callback과 특별한 차이를 갖는건 then 메서드를 통해 꺼내보내는게 아닌 일급으로 비동기 상황을 일급값으로 다룬다는 점에서 큰 차이가 있다. 대기, 성공, 실패로 다루는 일급 값으로 이루어져있습니다.

대기와 일을 끝내는거들을 코두오ㅓ 컨텍스트로 다류는것이아닌 대기되어지고있다는 어떤 값을 만든다는거에서 callback과 큰 차이가 있습니다.

```
function add20(a) {
  return new Promise((resolove) => setTimeout(() => resolove(a + 20), 1000));
}

const b = add20(20).then(add20).then(add20).then(log);
```

## 모나드와 안전한 함수 합성

### 함수 합성의 문제

```
log(f(g(1))); // 4

log(g(f())); // NaN
```

일반 함수 합성은 입력 값이 없거나 잘못된 경우 안전하게 동작하지 않습니다. 외부 상태에 영향을 주지 않고 안전하게 합성을 보장하기 위한 개념이 바로 **모나드(Monad)**입니다.

### Array와 합성

Array는 값이 없을 수도([]) 있고, 여러 개 있을 수도 있습니다. 그러나 map, filter, forEach 같은 체이닝을 통해 안전하게 합성할 수 있습니다.

```
[1]
  .map(g)
  .map(f)
  .forEach((r) => log(r));

[]
  .map(g)
  .map(f)
  .forEach((r) => log(r)); // 안전하게 합성 가능
```

### Promise와 합성

Promise는 값이 **언제 준비될지 모르는 상황(비동기)**에서도 안전한 합성을 보장합니다. then 체이닝을 통해 함수가 적절한 시점에 평가됩니다.

```
new Promise((resolve) => setTimeout(() => resolve(3), 1000))
  .then(g)
  .then(f)
  .then((res) => log(res));
```

### 정리

- 모나드란: 함수 합성을 안전하게 하기 위한 개념
- Array: 원소가 0개, 여러 개일 수 있는 상황에서도 map 체이닝으로 안전한 합성 가능.
- Promise: 값이 아직 준비되지 않은 비동기 상황에서도 then 체이닝으로 안전한 합성 가능.

  ➡️ 즉, 모나드는 값이 있든 없든, 혹은 시차가 있든 상관없이 함수 합성을 안전하게 보장하는 도구로 볼 수 있습니다.

### Kleisli Composition

- Kleisli Composition은 함수를 합성하여, 실패나 부수효과가 있는 상황에서도 함수 합성을 일관되고 안전하게 수행하는 방식(규칙?)
- 예상과 다른 입력값이 들어오거나, 외부 환경의 영향이나 내부 상태 변화 등으로 인해 정상적인 흐름이 깨질 수 있는 케이스들

즉, **“출력 타입이 모나드 안에 싸여 있을 때 안전하게 합성하는 방식”**이 Kleisli composition
Kleisli 합성은 오류가 발생할 수 있는 상황에서 함수들을 안전하게 합성하는 규칙을 다룹니다. Promise는 `.then()` 체인 중 발생한 오류를 `.catch()`로 잡아내어 전체 합성 과정이 예측 불가능하게 깨지는 것을 방지하며 안전한 흐름 제어를 돕습니다.

### 비동기 필터링 처리에서 'NOP'와 같은 특별한 값을 사용하는 주된 목적

'NOP'는 필터 함수에서 false와 같은 역할을 하지만, Promise를 거부(reject)할 때 발생하는 에러 로깅 없이 해당 값이 이후의 함수 파이프라인을 더 이상 진행하지 않도록 막는 일종의 신호 역할을 합니다.

### async/await

- `async` 함수는 항상 `Promise`를 반환한다. (단순 값 반환도 자동으로 `Promise.resolve()`로 감싸짐)
- 함수 내부 코드는 `await`를 만나기 전까지는 동기적으로 실행된다.
- `await`는 Promise가 **해결(fulfilled)** 될 때까지 기다린 뒤, 결과 값을 반환한다.
- await가 Promise를 평가한다. (Promise의 결과를 await로 꺼내볼 수 있다.)
- Promise가 아닌 값도 `await`하면 `Promise.resolve()`로 처리되어 바로 반환된다.

```
function delay(time) {
  return new Promise((resolve) => setTimeout(() => resolve(), time));
}

async function delayIdentity(a) {
  await delay(a);
  return a;
}

async function f1() {
  const a = await delayIdentity(10);
  const b = await delayIdentity(20);
  return a + b;
}
log(f1()); // Promise { <pending> }
f1().then(log); // 30
```

### 파이프라인은 함수를 합성하는 것이 목적.

Async/Await는 완전히 합성이 아니라 풀어놓으려고 하는 목적을 가지고 있는 것.
둘은 비교대상이 아니라 서로 다른 문제를 해결하고자 하는 두개의 기술
pipe: 어떠한 코드를 리스트로 다루면서 연속적인 함수 실행과 함수 합성을 통해서 이제 더 효과적으로 함수들을 조합하고 또 로직을 테스트하기 쉽고 유지 보수하기 쉽게 만드는 데 목적
async/await: 비동기 상황을 동기적인 문장으로 풀어서 코딩을 하고 싶을 때 사용하는 기법

```
function f5(list) {
  return go(
    list,
    L.map((a) => delayI(a * a)),
    L.filter((a) => delayI(a % 2)),
    L.map((a) => delayI(a + 1)),
    take(3),
    reduce(add)
  );
}
// 복잡한 포문과 if문과 포문을 빠져나가는 로직이나 이런거를 쉽고 안전하게 코딩하기 위함


async function f6(list) {
  const temp = [];
  for (const a of list) {
    const b = await delayI(a * a);
    if (await delayI(b % 2)) {
      const c = await delayI(b + 1);
      temp.push(c);
      if (temp.length === 3) break;
    }
  }
  let res = temp[0],
    i = 0;
  while (++i < temp.length) res = await delayI(res + temp[i]);

  return res;
}
```

- 두 구현은 결과와 점근적 시간복잡도는 동일합니다. 그러나 f5는 지연 평가 기반의 선언적 파이프(L.map → L.filter → take → reduce)로 구성되어 있어 로직 변경 시 수정 반경이 작고(모듈성), take에서 조기 단락이 자연스럽게 보장됩니다. 반면 f6는 루프·조건·중단·누산이 서로 얽혀 있어 변경 비용과 결합도가 큼
