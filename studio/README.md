# Sanity Studio

사진작가가 사진 콘텐츠를 입력하고 게시하는 관리자 애플리케이션이다. Astro 웹사이트와 별도의 workspace로 실행한다.

## 환경변수

`studio/.env.example`을 참고해 `studio/.env.local`을 만든다.

```dotenv
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
```

`SANITY_STUDIO_PROJECT_ID`는 Sanity 프로젝트의 ID이며 `SANITY_STUDIO_DATASET`은 콘텐츠를 저장할 dataset 이름이다.

## 실행

프로젝트 루트에서 실행한다.

```sh
pnpm studio:dev
```

Docker 개발환경에서는 컨테이너의 `3333` 포트가 호스트에 연결된다. 기본 접속 주소는 `http://localhost:3333`이다.

## 검사와 빌드

```sh
pnpm studio:typecheck
pnpm studio:build
```

Studio를 실행하거나 빌드하려면 먼저 실제 Sanity 프로젝트 ID와 dataset을 설정해야 한다.
