# 함께 그리는 우리 숲 (Care Tree)

장기입원 미취학 아동을 위한 온라인 협동 색칠놀이 MVP. 여러 병원의 아이들이 매주 하나의 그림을
4조각으로 나눠 함께 완성합니다. 이번 주 주제는 **나무**입니다.

지금 버전은 UI와 그림판 기능이 mock 데이터(로그인/방/친구 진행 상태)로 전체 흐름이 동작하도록
구현되어 있고, 실제 백엔드(Supabase)는 아직 연결되어 있지 않습니다.

## 실행 방법

```bash
npm install
npm run dev
```

<http://localhost:3000> 접속 후 태블릿 가로 화면(또는 브라우저 창을 가로로 넓게)에서 확인하세요.
세로로 보면 "태블릿을 옆으로 돌려주세요" 안내만 나옵니다.

- `npm run dev` – 개발 서버
- `npm run build` – 프로덕션 빌드
- `npm run start` – 빌드 결과 실행
- `npm run lint` – ESLint 검사
- `npm run typecheck` – TypeScript 타입 검사(`tsc --noEmit`)

## 테스트용 등록번호

- **123456** – 등록된 mock 계정(닉네임: 파랑구름, 별빛어린이병원)
- 그 외 임의의 6자리 숫자 – 임시 손님 계정(닉네임: 새싹친구)으로 통과됩니다.

## 전체 흐름 다시 보기

```
로그인 → 이번 주 주제 → 사분면 배정 → 그림판 색칠 → 미리보기 → 제출
→ 대기실(친구 3명 mock 진행) → 4조각 합성 결과 화면
```

- 새로고침해도 로그인/배정/그림/제출 상태가 localStorage에서 그대로 복원됩니다.
- 대기실의 나머지 3명(별토끼·무지개곰·햇살여우)은 각각 5초/10초/15초 뒤 자동으로
  "색칠 완료" 상태가 되도록 만든 mock 타이머입니다.

## 폴더 구조

```
app/            페이지(App Router)
components/     화면별 UI 컴포넌트
lib/config/     주제·사분면·도구·색상·굵기 설정(config)
lib/constants/  이미지 경로, 화면에 쓰이는 모든 한글 문구
lib/mock/       mock 서비스 계층(사용자 인증, 주제, 방/참가자, 제출물)
lib/storage/    localStorage 저장소(그림 자동저장, 공용 JSON 헬퍼)
lib/drawing/    캔버스 crop·투명화·합성·stroke 렌더링·반짝이 생성 유틸
lib/store/      zustand 스토어(로그인 세션, 그림판 상태)
lib/utils/      사분면 랜덤 배정
types/          도메인 타입(theme, assignment, room, drawing, user)
```

## 아직 mock인 부분 / Supabase 연동 지점

실제 서버로 교체할 때는 아래 함수 내부만 API 호출로 바꾸면 나머지 화면은 그대로 동작합니다.

| 기능 | 지금 구현 | 나중에 바꿀 파일 |
| --- | --- | --- |
| 로그인 인증 | 6자리 숫자 + mock 목록 대조 | `lib/mock/users.ts`의 `verifyRegistrationNumber` |
| 이번 주 주제 조회 | `lib/config/themes.ts`의 고정 배열 | `lib/mock/theme.ts`의 `fetchActiveTheme` |
| 사분면 배정 | localStorage에 저장된 랜덤 배정 | `lib/utils/random-assignment.ts`의 `getOrCreateAssignment` |
| 같은 방 친구 목록·진행 상태 | localStorage + `setTimeout` 기반 mock 친구 3명 | `lib/mock/room.ts`(특히 `startMockFriendProgress`는 Supabase Realtime 구독으로 교체) |
| 그림 제출물 저장 | localStorage에 PNG data URL 저장 | `lib/mock/submissions.ts` |
| 그림 자동저장 | localStorage | `lib/storage/local-drawing-storage.ts` |

## 알려진 제한사항

- **아직 하지 않은 것(요청서 18번 항목대로)**: 실제 병원 서버 로그인, EMR 연동, 실시간 다중 사용자
  Canvas, 자유 채팅, 병원 간 순위/투표, AI 그림 생성, 개인정보 입력, 결제, 광고, 실제 사진 업로드,
  복잡한 3D 애니메이션.
- 대기실 mock 친구 3명은 매번 같은 순서(별토끼→무지개곰→햇살여우)로 5·10·15초 뒤 완료됩니다.
- 대기실 친구들의 "그림"은 실제 그림이 아니라 옅은 색이 깔린 자리표시자 이미지입니다.
- 무지개색은 Konva 선형 그라데이션으로 그려지며, 반짝이(금/은)는 일반 단색으로 대체되어 있고
  붓 종류가 `GLITTER`일 때만 별 파티클 효과가 붙습니다.
- 그림은 브라우저 localStorage에만 저장되므로 기기를 바꾸거나 브라우저 데이터를 지우면 사라집니다.
- 그림이 많이 쌓이면(특히 반짝이 붓을 많이 쓰면) localStorage 용량 제한에 걸릴 수 있습니다. 저장이
  실패하면 자동으로 한 번 더 재시도하고, 하단 바에 저장 상태를 보여줍니다.
- 4분할 원본 도안(`public/images/themes/tree/full.png`)의 십자선이 정확히 중앙(512, 512)에 있다는
  가정으로 각 조각을 잘라냅니다. 실제 배포용 도안 교체 시 이 가정을 다시 확인해야 합니다.
