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

Docker 개발환경에서는 프로젝트 루트에서 Studio 서비스만 실행한다.

```sh
docker compose up --build --detach studio
```

Astro와 Studio를 함께 시작하려면 서비스 이름을 생략한다.

```sh
docker compose up --build --detach
```

Studio 컨테이너의 `3333` 포트가 호스트에 연결된다. 기본 접속 주소는 `http://localhost:3333`이다. Studio는 Astro의 `node_modules`와 pnpm 저장소를 공유하지 않는다.

## 검사와 빌드

```sh
docker compose exec studio pnpm typecheck
docker compose exec studio pnpm build
```

Studio를 실행하거나 빌드하려면 먼저 실제 Sanity 프로젝트 ID와 dataset을 설정해야 한다.

## 랜딩 페이지 관리 범위

Studio의 `Landing page`는 하나만 존재하는 singleton 문서다.

- `Hero photo`: 첫 화면에 표시할 사진 한 장
- `Story photos`: 사진 에세이 01~06에 순서대로 표시할 사진 여섯 장

랜딩의 제목, 소개 문구, 캡션과 레이아웃은 현재 Astro 코드에서 관리한다. CMS에서는 사진 선택과 순서만 관리한다.
