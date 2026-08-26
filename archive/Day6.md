# Day 6 — Sanity CMS 기반 구성과 Docker 개발환경 분리

> 작업일: 2026-08-26  
> 프로젝트: 웨딩 스냅 사진작가 포트폴리오 사이트

## 1. 작업 목표

로컬 사진을 최종 운영 데이터로 유지하지 않고 Sanity CMS로 완전히 전환하기 위한 기반을 만들었다. 화면이 사용할 공통 `Photo` 모델을 정의하고, Sanity Studio에 사진과 랜딩 페이지 스키마를 추가했다. 이후 Astro와 Sanity Studio가 하나의 컨테이너와 의존성 공간을 공유하던 구성을 두 개의 독립된 Docker 서비스로 분리했다.

작업 도중 Astro 개발 서버가 4321 포트를 열지 못하고 `unhealthy` 상태가 되는 문제가 발생했다. 여러 가설을 실제 명령으로 검증한 뒤, 프로젝트 내부의 대규모 `.pnpm-store`가 Astro의 파일 감시 대상에 포함된 것이 직접 원인임을 확인하고 해결했다.

## 2. Sanity 전용 `Photo` 애플리케이션 모델 정의

`src/lib/content/photo-model.ts`에 화면과 콘텐츠 계층이 공유할 `Photo` 모델을 추가했다.

모든 운영 사진을 Sanity에서 가져오기로 결정했으므로 로컬 이미지와 원격 이미지의 union 타입은 사용하지 않았다. 이미지 모델은 URL과 크기 정보만 가지는 원격 이미지 형태로 단순화했다.

```ts
export interface PhotoImage {
  url: string;
  width: number;
  height: number;
}
```

여기서 애플리케이션 모델은 Sanity 문서 원본을 그대로 표현하는 타입이 아니다. Sanity 응답을 화면에서 사용하기 쉬운 형태로 변환한 뒤 페이지와 컴포넌트에 전달하기 위한 내부 계약이다. 이후 작성할 Sanity 어댑터가 CMS 응답과 이 모델 사이의 차이를 흡수한다.

관련 커밋:

- `998c220` — `refactor: define a Saity-ready photo model`

## 3. Sanity Studio와 `photo` 스키마 추가

`studio/`에 Sanity Studio 프로젝트를 구성하고 Sanity 프로젝트 `w3dbyd41`과 연결했다. 실제 project ID와 dataset은 `studio/.env.local`에서 읽고, 해당 파일은 Git에 포함하지 않는다.

주요 구현 파일:

- `studio/sanity.config.ts`: Studio 이름, dataset, 플러그인과 스키마 등록
- `studio/sanity.cli.ts`: Sanity CLI와 개발 서버 설정
- `studio/environment.ts`: 필수 환경변수 검사
- `studio/schemaTypes/photoType.ts`: 사진 문서의 필드와 검증 규칙
- `studio/schemaTypes/index.ts`: Studio에 스키마 등록
- `studio/.env.example`: 필요한 환경변수 이름 제공

`photo` 문서는 이미지, 제목, slug, 대체 텍스트, 공개 상태, 정렬 순서와 선택 메타데이터를 관리한다. Studio에서 실제 사진 여섯 장을 업로드해 Sanity의 클라우드 dataset에 저장되는 것도 확인했다.

관련 커밋:

- `d41bdd2` — `feat: add Sanity Studio and photo schema`

## 4. `landingPage` singleton 스키마 추가

랜딩 페이지에서 사용할 사진을 코드의 고정 slug 목록으로 선택하지 않고 CMS에서 관리할 수 있도록 `landingPage` 스키마를 추가했다.

주요 구현:

- `Hero photo`: 첫 화면에 사용할 사진 한 장
- `Story photos`: 사진 에세이 01~06에 사용할 사진 여섯 장
- 배열 안에서 같은 사진을 중복 선택하지 못하도록 검증
- `landingPage` 문서가 하나만 존재하도록 Studio structure와 document action 제한
- 새 문서 템플릿에서 일반적인 `landingPage` 생성을 차단

랜딩의 문구와 레이아웃은 아직 Astro 코드가 관리한다. 이번 스키마는 랜딩에 표시할 사진과 순서만 CMS 관리 범위에 포함한다.

관련 파일:

- `studio/schemaTypes/landingPageType.ts`
- `studio/structure.ts`
- `studio/sanity.config.ts`
- `studio/schemaTypes/index.ts`

관련 커밋:

- `29f74d0` — `feat: add Sanity landing page schema`

## 5. Astro와 Sanity Studio 실행 환경 분리

처음에는 하나의 `web` 컨테이너가 4321과 3333 포트를 모두 노출하고, root pnpm workspace가 Astro와 Sanity 의존성을 함께 관리했다. 이 구조에서는 두 애플리케이션의 프로세스와 의존성 경계가 불명확했다.

최종적으로 다음과 같이 분리했다.

```text
web 서비스
├─ Astro 개발 서버
├─ 4321 포트
├─ root pnpm-lock.yaml
└─ Astro 전용 node_modules / pnpm store

studio 서비스
├─ Sanity Studio 개발 서버
├─ 3333 포트
├─ studio/pnpm-lock.yaml
└─ Studio 전용 node_modules / pnpm store
```

관련 변경:

- `compose.yaml`에 `studio` 서비스 추가
- `studio/Dockerfile` 추가
- root Dockerfile에서 Studio 설치와 3333 포트 제거
- root와 Studio의 lockfile 및 workspace 설정 분리
- `studio/.dockerignore`로 로컬 의존성, 빌드 결과와 환경변수 제외
- Dev Container가 `web`과 `studio`를 함께 실행하고 두 포트를 전달하도록 변경
- 개발환경 문서와 Studio README 갱신

두 서비스를 함께 시작하는 명령은 다음과 같다.

```sh
docker compose up --build --detach
```

관련 커밋:

- `b93dba0` — `refactor: split sanity studio container and dev container`

## 6. 트러블슈팅 — Astro가 `unhealthy`가 된 문제

### 6.1 어떤 문제가 있었는가

Docker 컨테이너를 실행하면 Sanity Studio의 `http://localhost:3333`은 열렸지만 Astro의 `http://localhost:4321`은 응답하지 않았다.

브라우저에서는 다음 오류가 나타났다.

```text
ERR_EMPTY_RESPONSE
```

`docker compose ps`에서는 컨테이너 프로세스가 실행 중이지만 healthcheck가 실패했다.

```text
ihatecolor-storage-web-1   Up ... (unhealthy)
```

Astro 로그의 최종 오류는 다음과 같았다.

```text
transport invoke timed out after 60000ms
name: fetchModule
```

즉 컨테이너 자체가 즉시 종료된 것은 아니었다. Astro 프로세스는 존재했지만 Vite가 서버 모듈을 제한 시간 안에 불러오지 못해 4321 포트를 정상적으로 준비하지 못했다. `/health`에 요청해도 빈 응답이 돌아왔고 60초 후 개발 서버가 종료됐다.

### 6.2 어떤 가설을 세우고 어떻게 실험했는가

#### 가설 1: 기존 컨테이너나 의존성 volume이 손상됐다

컨테이너를 다시 만들고 기존 `node_modules` volume도 제거한 뒤 lockfile 기준으로 다시 설치했다.

```sh
docker compose down
docker compose up --build --detach
```

분리 작업 이후에는 web 전용 volume만 정확히 제거하고 다시 생성했다.

```sh
docker compose stop web
docker compose rm --force web
docker volume rm ihatecolor-storage_node_modules ihatecolor-storage_pnpm_store
docker compose up --detach web
```

결과는 동일했다. 따라서 단순한 컨테이너 캐시 손상은 원인이 아니었다.

#### 가설 2: Astro가 `studio/`까지 감시해 느려졌다

`astro.config.mjs`에서 Studio 디렉터리를 Vite 감시 대상에서 제외했다.

```js
vite: {
  server: {
    watch: {
      ignored: ["**/studio/**"],
    },
  },
},
```

또한 임시 컨테이너에서 `/workspace/studio`를 가린 상태로 Astro를 실행했다.

```sh
docker compose run --rm --no-deps -v /workspace/studio web \
  sh -c 'timeout 30s pnpm dev --host 0.0.0.0 --ignore-lock'
```

Studio를 보이지 않게 해도 동일하게 멈췄다. 따라서 `studio/` 하나만의 문제는 아니었다.

#### 가설 3: 강제 polling 방식이 과부하를 일으켰다

`web` 서비스에 설정돼 있던 다음 환경변수를 제거하고 컨테이너를 다시 만들었다.

```yaml
CHOKIDAR_USEPOLLING: "true"
CHOKIDAR_INTERVAL: "250"
```

강제 polling을 제거한 뒤에도 같은 timeout이 발생했다. polling은 불필요한 부하를 늘릴 수 있었지만 직접 원인은 아니었다.

#### 가설 4: Astro와 Sanity의 pnpm workspace 및 의존성 혼합이 원인이다

Astro와 Sanity를 각각 별도 Docker 서비스, lockfile, `node_modules`, pnpm store로 분리했다. Sanity는 309ms에 정상적으로 준비됐고 3333에서 HTTP 200을 반환했다.

그러나 Astro는 분리 후에도 timeout이 발생했다. 실행 환경 분리는 구조적으로 필요한 개선이지만, 이것만으로 4321 장애를 해결하지는 못했다.

#### 가설 5: 특정 프로젝트 페이지나 Content Collection 코드가 원인이다

실제 `src` 대신 빈 페이지 하나만 가진 진단용 `srcDir`를 사용해 Astro를 실행했다.

```sh
pnpm exec astro dev \
  --config astro.diagnostic.config.mjs \
  --host 0.0.0.0 \
  --ignore-lock
```

빈 페이지에서도 같은 위치에서 멈췄다. 따라서 사진 데이터, `src/content.config.ts`, 페이지 코드와 이미지 최적화 로직은 원인이 아니었다.

#### 가설 6: Docker 파일 시스템 자체가 느리다

컨테이너에서 Astro 패키지 파일을 1,000회 직접 읽어 속도를 측정했다.

```sh
docker compose run --rm --no-deps web node -e \
  'const fs=require("fs"); const p=require.resolve("astro"); console.time("reads"); Array.from({length:1000},()=>fs.readFileSync(p)); console.timeEnd("reads")'
```

결과는 약 6.6ms였다. 일반적인 파일 읽기 속도는 정상이었으므로 Docker 디스크 전체가 느리다는 가설은 배제했다.

#### 가설 7: Docker CPU 또는 메모리 부족이다

다음 명령으로 Docker와 컨테이너의 자원 제한을 확인했다.

```sh
docker info --format 'Docker CPUs={{.NCPU}} Memory={{.MemTotal}}'
docker compose run --rm --no-deps web sh -c \
  'nproc; cat /sys/fs/cgroup/cpu.max; cat /sys/fs/cgroup/memory.max'
```

Docker에는 16 CPU와 약 16GB 메모리가 할당되어 있었고 별도 cgroup 제한도 없었다. 자원 부족은 원인이 아니었다.

#### 가설 8: Vite 또는 Astro의 특정 패치 버전 문제다

Sanity가 사용하는 Vite `8.2.2`로 Astro 쪽 Vite를 맞춰 보았지만 동일했다. Astro도 `7.2.2`에서 직전 버전인 `7.1.6`으로 내려 비교했지만 동일했다.

두 실험 모두 효과가 없었기 때문에 최종 코드에서는 Vite 직접 고정을 제거하고 Astro를 원래 버전 `7.2.2`로 복구했다.

#### 마지막 진단: 시스템 호출 추적

추측만으로는 원인을 좁힐 수 없어 임시 컨테이너에 `strace`를 설치하고 Astro가 멈춘 동안 수행하는 시스템 호출을 기록했다.

```sh
docker compose run --rm --no-deps --user root -e CI=true web sh -c '
  apt-get update >/dev/null &&
  apt-get install -y --no-install-recommends strace >/dev/null &&
  timeout 12s strace -f -tt -T -o /tmp/astro.strace \
    pnpm exec astro dev --host 0.0.0.0 --ignore-lock
'
```

이 추적에서 여러 스레드가 다음 경로 아래의 파일을 지속해서 `statx`로 검사하고 있음을 확인했다.

```text
/workspace/.pnpm-store/v11/files/**
```

호스트에서 해당 디렉터리를 조사한 결과 약 47,161개 파일과 493,167,646바이트의 캐시가 프로젝트 루트에 존재했다.

### 6.3 실제 문제는 무엇이었고 왜 발생했는가

직접 원인은 프로젝트 루트의 `.pnpm-store`가 Astro/Vite의 파일 감시 범위 안에 들어온 것이었다.

다음 Docker bind mount는 호스트 프로젝트 전체를 컨테이너의 `/workspace`로 노출한다.

```yaml
volumes:
  - .:/workspace
```

따라서 호스트의 `.pnpm-store`도 컨테이너 안에서는 `/workspace/.pnpm-store`로 보였다. `.gitignore`와 `.prettierignore`에는 이 경로가 들어 있었지만, Git과 Prettier의 제외 규칙은 Vite 파일 감시 규칙이 아니다. 당시 `astro.config.mjs`에도 `.pnpm-store`를 제외하는 설정이 없었다.

그 결과 Astro 개발 서버가 시작되면서 약 4만 7천 개의 pnpm 캐시 파일을 검사했다. Vite의 서버 모듈 로딩 응답이 60초 안에 끝나지 못했고, 최종적으로 `fetchModule` transport timeout이 발생했다. Docker healthcheck는 4321의 `/health`가 준비되지 않았기 때문에 컨테이너를 `unhealthy`로 표시했다.

`.pnpm-store`가 최초에 어떤 단일 명령으로 프로젝트 루트에 생성됐는지는 로그만으로 확정하지 못했다. 다만 pnpm의 로컬 store 경로를 사용한 설치 과정에서 만들어진 재생성 가능한 의존성 캐시이며, 애플리케이션 소스나 Sanity 클라우드 데이터는 아니다.

### 6.4 어떻게 해결했는가

먼저 실제 경로가 프로젝트 내부인지 확인한 뒤 `.pnpm-store`를 삭제했다. 이 작업으로 제거된 것은 재생성 가능한 패키지 캐시 약 493MB이며 Sanity에 업로드한 사진에는 영향이 없다.

이후 다시 같은 디렉터리가 생겨도 문제가 반복되지 않도록 `astro.config.mjs`의 감시 제외 목록을 다음과 같이 확장했다.

```js
vite: {
  server: {
    watch: {
      ignored: [
        "**/.astro/**",
        "**/.pnpm-store/**",
        "**/dist/**",
        "**/studio/**",
      ],
    },
  },
},
```

또한 Compose에서는 pnpm store를 프로젝트 루트가 아니라 Docker named volume의 `/pnpm/store`에 두고, 설치 명령에서 해당 경로를 명시한다.

```yaml
volumes:
  - pnpm_store:/pnpm/store
```

```sh
pnpm install --frozen-lockfile --store-dir /pnpm/store
```

해결 후 Astro는 약 2.2초 만에 준비됐고 다음 검사를 통과했다.

```text
web       healthy
Astro     /health HTTP 200
Astro     / HTTP 200
Studio    /structure HTTP 200
```

## 7. 최종 검증

Astro 컨테이너에서 전체 검증을 실행했다.

```sh
docker compose exec -T web pnpm validate
```

검증 결과:

- ESLint 통과
- Prettier 통과
- Astro check: 0 errors, 0 warnings, 0 hints
- 정적 빌드 성공
- `/`, `/photos`, 페이지네이션과 `/health` 생성 성공

Sanity Studio에서는 다음 검사를 실행했다.

```sh
docker compose exec -T studio sh -c 'pnpm typecheck && pnpm build'
```

검증 결과:

- TypeScript 검사 통과
- Sanity Studio 프로덕션 빌드 성공

## 8. 현재 상태와 다음 작업

완료:

- Sanity 전용 `Photo` 애플리케이션 모델 정의
- Sanity Studio와 `photo` 스키마 구성
- `landingPage` singleton 스키마 구성
- Astro와 Sanity Studio Docker 서비스 분리
- 두 서비스의 lockfile, 의존성 volume과 pnpm store 분리
- Astro 4321 `ERR_EMPTY_RESPONSE` 및 Vite timeout 원인 확인과 해결
- 개발환경 문서 갱신

다음 작업:

1. Sanity 클라이언트와 GROQ 쿼리를 작성한다.
2. Sanity 응답을 런타임에서 검사할 스키마를 작성한다.
3. Sanity 응답을 애플리케이션 `Photo` 모델로 변환하는 어댑터를 작성한다.
4. `getPhotos()`가 Sanity만 조회하도록 교체한다.
5. 페이지와 컴포넌트가 원격 이미지를 렌더링하도록 연결한다.
6. 로컬 Content Collection과 `src/data/photos`를 제거한다.
7. CMS 게시 후 정적 사이트 재빌드를 호출하는 webhook을 구성한다.
