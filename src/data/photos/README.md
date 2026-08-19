# 로컬 Photo 콘텐츠 작성 규칙

사진 한 장을 하나의 작품으로 관리한다. 각 작품은 별도 디렉터리에 `index.md`와 로컬 이미지 파일을 함께 둔다.

```text
src/data/photos/
  stable-photo-id/
    index.md
    image.jpg
```

`index.md`는 다음 형식을 사용한다.

```yaml
---
id: stable-photo-id
slug: public-photo-slug
image: ./image.jpg
title: 작품명
altText: 사진에 보이는 핵심 장면을 설명하는 대체 텍스트
status: draft
sortOrder: 0
caption: 선택적인 짧은 설명
location: 선택적인 공개 가능 촬영 장소
shotAt: "2026-08-19"
category: 선택적인 범주
albumId: 선택적인 향후 앨범 ID
---
```

## 제약 조건

- `id`, `slug`, `sortOrder`는 전체 사진에서 각각 고유해야 한다.
- `id`는 데이터 소스가 바뀌어도 유지하며 디렉터리명과 같게 작성하는 것을 권장한다.
- `slug`는 소문자 영문, 숫자, 단일 하이픈만 사용한다.
- `status`는 `draft` 또는 `published`만 허용한다.
- `sortOrder`는 0 이상의 정수다.
- `shotAt`은 `YYYY`, `YYYY-MM`, `YYYY-MM-DD` 중 하나로 작성하고 YAML 날짜 변환을 피하기 위해 따옴표로 감싼다.
- 선택 필드는 값이 없으면 빈 문자열 대신 필드 자체를 생략한다.
- 본문은 현재 사용하지 않으므로 비워 둔다.

`getPhotos()`는 기본적으로 `published` 사진만 반환한다. 관리·검증 용도로 초안을 포함하려면 `getPhotos({ status: "all" })`을 사용한다.

## 현재 모크 데이터

현재 컬렉션에는 12개 작품이 있으며 다음 경계 사례를 포함한다.

- 세로형, 정사각형, 극단적인 가로형과 극단적인 세로형 이미지
- 카드 줄바꿈을 확인할 수 있는 긴 작품명
- 선택 필드를 모두 생략한 작품
- `published`와 `draft` 게시 상태
- 연도, 연월, 전체 날짜 형식의 `shotAt`

기존 `prototype-b/` 이미지는 원본을 수정하지 않고 모크 콘텐츠 디렉터리에 복사해 사용한다. 극단 비율 이미지 2개는 개발 fixture 용도로 생성한 비식별 풍경·건축 사진이며 실제 포트폴리오 콘텐츠가 아니다.

## 목록 시나리오

`src/lib/content/photo-scenarios.ts`의 `selectPhotoScenario()`로 데이터 파일을 복제하지 않고 목록 경계를 재현한다.

- `all`: 전달한 전체 목록
- `empty`: 빈 목록
- `single`: 첫 작품 하나만 있는 목록
- `pagination-boundary`: 호출 시 전달한 `pageSize + 1`개 목록

페이지당 카드 수는 아직 확정되지 않았으므로 시나리오 코드에 고정하지 않는다. 예를 들어 페이지당 9개를 검증할 때만 `selectPhotoScenario(photos, "pagination-boundary", { pageSize: 9 })`처럼 전달한다.
