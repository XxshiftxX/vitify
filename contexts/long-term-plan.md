# Vitify 장기 계획

## 목표

`zennbot-webapp`에서 검증된 Vite SSR 구조를 Fastify 백엔드 API 앱에서 재사용할 수
있는 경량 유틸/플러그인으로 만든다.

Vitify의 포지션은 명확하다.

- 범용 SSR 프레임워크가 아니라 Fastify용 Vite SSR 유틸이다.
- Fastify 앱이 서버 생명주기, API 라우트, 인증, 로깅, 배포를 계속 소유한다.
- API 서버와 SSR 서버를 분리하지 않아도 되는 모노레포 구성을 돕는다.
- 라우팅 자동화보다 Fastify route 안에서 명시적으로 `reply.vitify.render()`를
  호출하는 방식을 우선한다.
- Vite, React, Fastify 위에 얇게 올라간다.

Vitify가 소유할 범위:

- Fastify plugin 등록.
- 개발 환경 Vite dev middleware 연결.
- 운영 환경 client asset 정적 서빙.
- HTML template 로드와 slot 치환.
- 개발/운영 환경 server entry 로드.
- Vite manifest에서 client JS/CSS asset 조회.
- SSR data 직렬화, escape, client-side 읽기.
- 반복되는 `renderToString`, `hydrateRoot` 패턴을 줄이는 React helper.
- 모노레포에서 `apps/api`와 `apps/web`의 경로를 연결하는 옵션 체계.

애플리케이션이 계속 소유할 범위:

- Fastify app 생성과 서버 시작.
- API 라우트 등록.
- 인증, 쿠키, 세션, 권한.
- logger, observability, env, database client, queue.
- 페이지별 data loading, redirect, status code.
- React component와 styling.
- 배포 구조와 process management.

## 현재 Zennbot 구조

중요한 파일:

- `src/app.ts`: 현재는 Express app을 만들고, 개발 환경에서는 Vite middleware를
  붙이며, 운영 환경에서는 `dist/client`를 정적 서빙한다. API/client route도
  여기서 등록한다.
- `src/utils/render-client.ts`: 가장 먼저 분리할 후보. `index.html`을 읽고, 개발
  환경에서는 Vite로 transform하며, `entry-server.tsx`를 로드하고,
  HTML/head/data/client entry tag를 주입한다.
- `vite.config.ts`: 모든 `entry-client.tsx`를 `rollupOptions.input`에 수동으로
  나열한다.
- `src/pages/*/entry-server.tsx`: 대부분 같은 `renderToString` 패턴을 반복한다.
  일부 페이지만 page-specific `head`를 가진다.
- `src/pages/*/entry-client.tsx`: 대부분 같은 `hydrateRoot` 패턴을 반복한다.
- `src/pages/common/utils/ssr-data.ts`,
  `src/pages/common/hooks/use-ssr.hook.ts`: 현재 SSR data bridge를 담당한다.

현재 구조는 Vite SSR 자체는 일관적이다. 장기 목표는 이 구조를 Fastify plugin
모델로 옮기면서, zennbot도 Express에서 Fastify로 갈아타는 것이다.

## 모노레포 사용 이미지

Vitify가 잘 맞아야 하는 대표 구조:

```text
repo/
  apps/
    api/
      src/
        app.ts
        routes/
      package.json
    web/
      index.html
      index.css
      src/pages/
        dashboard/
          app.tsx
          entry-client.tsx
          entry-server.tsx
      vite.config.ts
  packages/
    ui/
    domain/
```

이 구조에서 `apps/api`는 Fastify 서버와 API를 소유하고, `apps/web`은 Vite SSR
entry와 client asset build를 소유한다. Vitify는 `apps/api`에서 `apps/web`의
template, manifest, entry를 읽어 SSR 응답을 만든다.

## 목표 패키지 형태

초기에는 TypeScript package로 시작한다.

```ts
import { vitify } from "vitify";
import {
  createReactServerEntry,
  hydrateReactPage,
  readSsrData,
  useSsrData,
} from "vitify/react";
```

Fastify plugin 사용 예:

```ts
import Fastify from "fastify";
import { vitify } from "vitify";

const app = Fastify({ logger: true });

await app.register(vitify, {
  root: process.cwd(),
  webRoot: "../web",
  isProduction: process.env.NODE_ENV === "production",
  clientOutDir: "../web/dist/client",
  templatePath: "../web/index.html",
  templateSlots: {
    html: "<!--app-html-->",
    head: "<!--app-head-->",
    entry: "<!--app-entry-client-->",
    data: "<!--app-data-->",
  },
});

app.get("/dashboard", async (request, reply) => {
  return reply.vitify.render({
    url: request.url,
    pagePath: "../web/src/pages/dashboard",
    data: { user: request.user },
  });
});
```

직접 HTML을 다루고 싶을 때는 lower-level renderer도 제공할 수 있다.

```ts
app.get("/dashboard", async (request, reply) => {
  const html = await app.vitify.renderPage({
    url: request.url,
    pagePath: "../web/src/pages/dashboard",
    data: { user: request.user },
  });

  return reply.type("text/html").send(html);
});
```

React helper는 page entry boilerplate를 줄인다.

```tsx
// entry-server.tsx
import { createReactServerEntry } from "vitify/react";
import { App } from "./app";

export const render = createReactServerEntry(App, {
  head: `<link rel="preconnect" href="https://fonts.googleapis.com">`,
});
```

```tsx
// entry-client.tsx
import { hydrateReactPage } from "vitify/react";
import { App } from "./app";

hydrateReactPage(App);
```

## 하지 않을 것

초기 Vitify는 완성형 웹 프레임워크가 아니다.

- Fastify route discovery를 소유하지 않는다.
- 인증, 세션, 권한 API를 만들지 않는다.
- serializable page data 전달 이상으로 data fetching 규칙을 강제하지 않는다.
- Vite config 전체를 대체하지 않는다.
- React Router, TanStack Router, file-system router를 요구하지 않는다.
- 개발 환경의 Vite error를 감추지 않는다.
- Fastify app을 대신 생성하거나 listen하지 않는다.
- Express adapter를 v1 목표에 넣지 않는다.

첫 버전은 Fastify 앱에 부담 없이 붙을 만큼 작아야 한다.

## 결정해야 할 설계

### 1. Fastify plugin 표면

Vitify는 `app.register(vitify, options)`로 붙는다. plugin은 다음을 제공한다.

- `app.vitify.renderPage(options)`: HTML string을 반환하는 low-level API.
- `reply.vitify.render(options)`: `text/html` 응답을 바로 보내는 route helper.
- 개발 환경 Vite middleware 또는 운영 환경 static asset serving 연결.
- close hook에서 Vite dev server 정리.

`decorate` 이름은 충돌 가능성이 있으므로 plugin option으로 바꿀 수 있게 한다.

### 2. 운영 환경 server entry

현재 zennbot은 client만 Vite로 build하고, 서버는 `tsx`로 TypeScript source를
실행한다. 운영 환경의 `render-client.ts`도 page의 `entry-server.tsx`를 source
path에서 import한다.

Vitify는 이 방식을 먼저 지원한다. 이후 prebuilt JavaScript만 배포하는 팀을 위해
server bundle mode를 문서화한다.

### 3. Manifest entry key

현재 renderer는 page가 `pagePath`에 있고 client entry가
`${pagePath}/entry-client.tsx`라고 가정한다.

Vitify는 이 관례를 기본값으로 유지하되, 명시적인 `clientEntry` override를
허용한다.

```ts
reply.vitify.render({
  pagePath: "../web/src/pages/auth",
  clientEntry: "../web/src/pages/auth/entry-client.tsx",
});
```

### 4. Template slot

현재 slot은 `index.html` 안의 주석 문자열로 고정되어 있다. Vitify는 이 기본값을
유지하되, 다른 프로젝트가 다른 marker 이름을 쓸 수 있게 설정 가능해야 한다.

### 5. Data serialization

현재 data는 `JSON.stringify` 후 HTML escape되어 `data-ssr` 속성에 들어간다.
간단한 record에는 충분하지만, 라이브러리로 분리하려면 escape 로직을 중앙화하고
테스트해야 한다.

장기적으로는 `<script type="application/json" id="__VITIFY_DATA__">` 전달을
선호한다. root element 속성이 커지는 문제를 피하고, client helper를 더 명확히
만들 수 있다. 마이그레이션 동안은 `data-ssr` 호환을 유지한다.

### 6. CSS 처리

현재 운영 환경에서는 shared `index.css`와 client entry에서 recursive import된
CSS를 함께 주입한다. Vitify는 이 동작을 보존하고, recursive import와 중복 CSS
제거를 테스트해야 한다.

### 7. 내부 모듈 구조

공개 API는 Fastify plugin 중심으로 둔다. 다만 구현 내부는 테스트와 유지보수를
위해 모듈을 나눈다.

- `plugin`: Fastify plugin, decorator, hook, static serving 연결.
- `renderer`: template, server entry, manifest, data serialization을 조합.
- `manifest`: Vite manifest 조회와 CSS dependency 수집.
- `react`: React server/client entry helper와 SSR data helper.
- `vite`: Vite config helper.

이 내부 구조는 framework-neutral public API를 뜻하지 않는다. Fastify 최적화가
우선이다.

## 로드맵

### Phase 0: Fastify 계약 정리

- `reply.vitify.render()`와 `app.vitify.renderPage()`의 옵션과 반환 방식을 정한다.
- plugin registration option을 정한다: `root`, `webRoot`, `clientOutDir`,
  `templatePath`, `isProduction`, `templateSlots`, `decorateName`.
- `render-client.ts`의 모든 가정을 나열한다: path, manifest 위치, entry naming,
  production mode 판단, data slot 형식.
- v1의 최소 지원 stack을 정한다: Fastify 5, Vite 7, React 19, TypeScript ESM.
- `vitify/examples/basic-fastify-react`와 `vitify/examples/monorepo-api-web` 예제를
  설계한다.

결과물: Fastify plugin API 문서와 API sketch.

### Phase 1: Renderer 추출

- package skeleton과 test runner를 만든다.
- manifest loading, CSS collection, template rendering, server entry loading,
  data escaping을 Vitify 내부 renderer 모듈로 옮긴다.
- `src/app.ts` 같은 zennbot-specific module import를 제거한다.
- 환경 의존성은 plugin option으로 주입받는다:
  `isProduction`, `viteDevServer`, `root`, `webRoot`, `clientOutDir`,
  `templatePath`.
- manifest lookup, CSS recursion, missing entry, template slot replacement,
  escaping unit test를 추가한다.

결과물: Fastify plugin에서 호출할 수 있는 내부 renderer.

### Phase 2: Fastify plugin 구현

- `vitify` Fastify plugin을 구현한다.
- 개발 환경에서는 Vite middleware를 Fastify에 연결한다.
- 운영 환경에서는 client asset static serving을 연결한다.
- `app.vitify.renderPage()`와 `reply.vitify.render()`를 제공한다.
- Fastify close hook에서 Vite dev server를 정리한다.
- 개발 환경에서 Vite stack trace와 HMR 동작이 유지되도록 error handling을 잡는다.

결과물: 새 Fastify 프로젝트가 Vitify로 SSR 페이지를 렌더링할 수 있다.

### Phase 3: React helper 추가

- 반복되는 `renderToString` boilerplate를 줄이는
  `createReactServerEntry(Component, options)`를 추가한다.
- 반복되는 `hydrateRoot` boilerplate를 줄이는 `hydrateReactPage(Component,
  options)`를 추가한다.
- `readSsrData`, `useSsrData<T>()`를 추가한다.

결과물: page entry 파일이 2~5줄 수준으로 줄어든다.

### Phase 4: Vite config helper

- page client entry를 발견하거나 page registry를 `rollupOptions.input`으로
  변환하는 helper를 추가한다.
- client bundle에 들어가는 항목을 프로젝트가 검토할 수 있도록 explicit한 형태를
  유지한다.
- `index.css` 같은 shared entry를 지원한다.

가능한 API:

```ts
import { defineVitifyConfig, pageEntries } from "vitify/vite";

export default defineVitifyConfig({
  plugins: [react(), tailwindcss()],
  pages: pageEntries("src/pages"),
  sharedEntries: ["index.css"],
});
```

결과물: SSR page를 추가할 때마다 `vite.config.ts`를 손으로 고치지 않아도 된다.

### Phase 5: Zennbot Fastify migration

- zennbot의 Express app을 Fastify app으로 교체한다.
- middleware를 Fastify plugin/register 구조로 옮긴다.
- API route를 Fastify route로 옮긴다.
- 인증과 cookie 처리를 Fastify plugin/decorator 기준으로 다시 묶는다.
- `src/utils/render-client.ts`를 제거하고 Vitify plugin을 등록한다.
- client route는 `reply.vitify.render()`로 교체한다.
- 반복되는 React entry를 Vitify React helper로 교체한다.
- `vite.config.ts`의 수동 client entry 목록을 Vitify Vite helper로 교체한다.
- `npm run typecheck`, `npm run test`, `npm run build:client`를 실행한다.
- dev SSR과 production preview를 수동 확인한다.

결과물: zennbot이 Fastify + Vitify 기반의 첫 실제 소비자가 된다.

### Phase 6: 외부 채택 준비

- zennbot과 다른 모양의 두 번째 Fastify example app을 추가한다.
- prerelease를 changelog와 함께 배포한다.
- 이미 Fastify + Vite를 쓰는 프로젝트용 migration 문서를 추가한다.
- server-bundled production build 호환성 문서를 추가한다.

결과물: 다른 Fastify 프로젝트가 zennbot source를 읽지 않고도 Vitify를 사용할 수
있다.

## 제안 repository layout

```text
vitify/
  package.json
  README.md
  docs/
    index.md
    api/
    guide/
  contexts/
    long-term-plan.md
    migration-zennbot-fastify.md
    monorepo.md
  src/
    plugin/
      fastify.ts
      decorators.ts
      static.ts
    renderer/
      manifest.ts
      render-page.ts
      template.ts
      server-entry.ts
      serialize-data.ts
    react/
      entry-client.tsx
      entry-server.tsx
      ssr-data.ts
    vite/
      config.ts
  examples/
    basic-fastify-react/
    monorepo-api-web/
  tests/
```

## Migration 안전 체크리스트

- zennbot의 Fastify migration과 Vitify extraction을 한 커밋에 과하게 섞지 않는다.
- 첫 migration 동안 HTTP route surface를 유지한다.
- 모든 page가 이동할 때까지 현재 template marker를 유지한다.
- 모든 consumer가 새 data script를 쓰기 전까지 `data-ssr`를 지원한다.
- 최소 두 프로젝트에서 필요성이 확인되기 전까지 file-system routing을 넣지 않는다.
- Vite config helper를 바꾸기 전에 production manifest 동작을 테스트한다.
- 생성된 asset URL은 public API처럼 다룬다. 깨지면 cached page나 CDN 설정이
  영향을 받을 수 있다.
- package peer dependency를 명확히 둔다: Fastify, React, React DOM, Vite.

## 초기 구현 순서

1. `vitify`에 package skeleton과 test runner를 만든다.
2. `collectCssFiles`와 manifest lookup을 `src/renderer/manifest.ts`로 옮긴다.
3. escaping을 `src/renderer/serialize-data.ts`로 옮기고 악의적인 문자열 테스트를
   추가한다.
4. template replacement를 `src/renderer/template.ts`로 옮긴다.
5. server entry loading을 `src/renderer/server-entry.ts`로 옮긴다.
6. 위 조각을 `src/renderer/render-page.ts`에서 조합한다.
7. Fastify plugin과 decorators를 추가한다.
8. `basic-fastify-react` 예제를 만든다.
9. React helper를 추가한다.
10. zennbot을 Fastify로 마이그레이션한다.
11. zennbot에 Vitify를 적용한다.

## 리스크

- 현재 production은 source TSX가 `tsx`로 실행 가능하다는 전제에 기대고 있다.
  precompiled JavaScript만 배포하는 프로젝트에는 server-entry output 전략이
  필요하다.
- Express에서 Fastify로 옮기면서 middleware, request augmentation, error handling
  방식이 달라진다. zennbot migration은 별도 단계로 검증해야 한다.
- Vite input key가 달라지면 manifest key convention도 달라질 수 있다. 라이브러리는
  explicit entry key를 허용해야 한다.
- HTML escaping은 보안 민감 영역이다. 재사용 전에 집중 테스트가 필요하다.
- 개발 환경 error handling은 Vite stack trace와 module reload 동작을 보존해야 한다.
- Fastify, Vite, React version drift는 support burden을 만든다. v1은 지원 peer
  version을 좁고 명확하게 잡아야 한다.
- 모노레포에서는 `api`와 `web`의 cwd가 다를 수 있다. 모든 path option은
  root-relative와 absolute path를 명확히 처리해야 한다.

## 성공 기준

Vitify가 더 넓게 쓰일 준비가 된 상태:

- 새 Fastify + React SSR page를 route 하나, app component 하나, 작은 entry 파일로
  추가할 수 있다.
- Fastify plugin registration만으로 dev middleware와 production asset serving이
  연결된다.
- zennbot이 Fastify + Vitify 기반으로 dev와 production preview에서 동작한다.
- manifest, template, data serialization, React helper 동작이 테스트로 보호된다.
- 두 번째 Fastify example project가 zennbot code를 복사하지 않고 Vitify를 채택할 수
  있다.
