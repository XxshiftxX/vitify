# Vitify

Vitify는 Fastify 백엔드 API 앱 안에서 Vite SSR을 함께 운영할 수 있게 해 주는
경량 유틸/플러그인으로 계획한다.

목표는 범용 웹 프레임워크를 하나 더 만드는 것이 아니다. Fastify 앱이 이미 서버
생명주기, API 라우트, 인증, 로깅, 배포 방식을 소유하고 있을 때, 그 앱 안에 Vite
SSR 페이지를 자연스럽게 붙일 수 있는 작은 도구 묶음을 제공하는 것이다.

현재 `zennbot-webapp`에는 재사용하기 좋은 Vite SSR 패턴이 있다.

- 백엔드 앱이 API 라우트, 인증, 쿠키, 서비스, 앱 시작을 소유한다.
- 개발 환경에서는 Vite가 middleware mode로 붙는다.
- 운영 환경에서는 Vite client build 결과물을 `dist/client`에서 서빙한다.
- 각 페이지는 기본적으로 `App.tsx` 컴포넌트만 가진다.
- 공통 renderer가 서버 렌더링과 클라이언트 hydration 배관을 대신 만들고,
  HTML/head/data를 `index.html`에 주입하며, Vite manifest에서 운영 asset을 찾는다.
- 직접 제어가 필요한 페이지에서만 server/client entry를 escape hatch로 둔다.
- 패키지 루트는 framework-agnostic core로 두고, React 기본 경험은
  `vitify/react` 어댑터로 분리한다.

Vitify는 이 패턴을 Fastify-first가 아니라 Fastify-only로 정리한다. 공개 API는
Fastify plugin과 Fastify route helper를 중심으로 잡고, zennbot도 장기적으로
Express 호환 계층 없이 Fastify로 마이그레이션한다.

## 현재 상태

이 디렉토리는 먼저 문서부터 잡는 단계다. 첫 구현은 `zennbot-webapp`의 파일을
통째로 옮기는 방식으로 시작하지 않는다. 먼저 Fastify plugin API와 패키지 경계를
정하고, 그 다음 zennbot을 Fastify 기반 소비자로 옮긴다.

내부 개발 컨텍스트와 장기 계획은
[contexts/long-term-plan.md](contexts/long-term-plan.md)에 정리했다.
