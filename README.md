# 케어햄 스케치북 (Care Tree)

장기입원 미취학 아동을 위한 **비동기** 협동 색칠놀이 MVP. 여러 병원의 아이들이 매주 하나의 그림을
4조각으로 나눠 각자 색칠하고, 그 결과가 하나의 공동 작품에 자연스럽게 합쳐집니다.
이번 주 주제는 **나무**입니다.

지금 버전은 UI·그림판·마스코트(케어햄)·해바라씨 보상·AI 작품 분석까지 mock 데이터와 자체
Route Handler로 전체 흐름이 실제로 동작하도록 구현되어 있고, 실제 백엔드(Supabase)는 아직
연결되어 있지 않습니다.

**중요한 설계 원칙**: 순위·경쟁·"완성/미완성" 압박이 없습니다. 다른 아이의 접속 여부나 진행
상태를 보여주지 않고, 언제든 지금까지 모인 색깔만 봅니다. AI는 그림을 평가하지 않고, 아이에게
보여주는 칭찬은 항상 사전 검수된 문장 풀에서만 고릅니다.

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
- `npm run test` – vitest 단위 테스트

## `.env.local` 설정 방법

`.env.example`을 복사해 `.env.local`을 만드세요. **AI 키가 없어도 앱 전체가 정상 동작합니다**
(그림 제출·해바라씨·기본 칭찬은 AI와 무관하게 항상 작동하고, AI만 자동으로 규칙 기반
fallback으로 전환됩니다).

```bash
cp .env.example .env.local
```

```
OPENAI_API_KEY=              # 서버 전용. 절대 NEXT_PUBLIC_ 접두어를 붙이지 않는다
OPENAI_ARTWORK_MODEL=gpt-5.4-mini
ENABLE_AI_ANALYSIS=true      # false로 두면 항상 fallback만 사용
NEXT_PUBLIC_ENABLE_AI_DEBUG=false  # true일 때만 /debug/ai 화면이 보인다
```

`OPENAI_ARTWORK_MODEL`은 계정/프로젝트마다 접근 가능한 모델이 다르다. `/debug/ai`나 서버 로그에
`403 ... does not have access to model`이 보이면, API 키로 `GET https://api.openai.com/v1/models`를
호출해 실제로 쓸 수 있는 모델명으로 바꿔야 한다.

## 테스트용 등록번호

- **123456** – 등록된 mock 계정(닉네임: 파랑구름, 별빛어린이병원)
- 그 외 임의의 6자리 숫자 – 임시 손님 계정(닉네임: 새싹친구)으로 통과됩니다.

## AI 디버그 화면 접근 방법

`.env.local`에 `NEXT_PUBLIC_ENABLE_AI_DEBUG=true`를 설정하고 개발 서버를 재시작한 뒤
`/debug/ai`에 접속하면, 지금까지 저장된 작품 분석 결과(source: AI/FALLBACK, detectedElements,
dominantColorFamilies, motionPreset, praiseCategory, confidence, reviewRequired, caption)를
전부 확인할 수 있습니다. 아동이 보는 화면에는 이 경로로 가는 링크가 어디에도 없습니다.

## 전체 흐름

```
로그인(GUIDE 인사) → 이번 주 주제 → 사분면 랜덤 배정 → 그림판 색칠(자동저장)
→ 미리보기 → 제출(그림 즉시 저장 → 해바라씨 지급 → COURAGE 칭찬, AI는 백그라운드)
→ 우리 그림에 모인 색깔(예전 "대기실") → 우리 그림 크게 보기(합성 결과 + 갤러리 카드)
```

- 새로고침해도 로그인/배정/그림/제출 상태가 localStorage에서 그대로 복원됩니다.
- "우리 그림에 모인 색깔" 화면은 다른 사람의 접속·진행 상태를 보여주지 않고, 언제든 바로
  볼 수 있습니다(모두 끝나야만 볼 수 있는 구조가 아닙니다). 아직 아무도 채우지 않은 사분면은
  미리 준비된 케어햄 색칠본으로 자연스럽게 채워집니다.
- 그림 제출은 AI를 절대 기다리지 않습니다. AI 분석은 완전히 분리된 백그라운드 요청으로만
  실행되고, 결과가 오면(또는 실패해도 fallback으로) 최종 작품 애니메이션과 갤러리 캡션에만
  나중에 반영됩니다.

## 케어햄 마스코트 이미지 교체 방법

개별 이미지가 아직 없어도 앱은 정상 동작합니다(귀여운 이모지로 자동 대체). 실제 이미지가
준비되면 아래 경로에 **같은 파일명**으로 넣기만 하면 자동 적용됩니다.

```
public/images/mascots/
├─ guide-ham.webp      (지금 MVP에서 실제로 쓰는 4종)
├─ courage-ham.webp
├─ smile-ham.webp
├─ together-ham.webp
├─ default-ham.webp    (개별 이미지가 없을 때 공용으로 쓰는 대체 이미지)
├─ doctor-ham.webp     (10종 중 나머지 — 코드/타입은 이미 정의되어 있고, 지금은 화면에서 안 씀)
├─ nurse-ham.webp
├─ blood-test-ham.webp
├─ exam-ham.webp
├─ bandage-ham.webp
└─ pharmacy-ham.webp
```

`public/images/reference/`의 케어햄 캐릭터 시트·색칠놀이 예시 이미지는 디자인 참고용이며,
실제 화면에는 노출하지 않습니다(삼성서울병원 브랜드 자산).

## 폴더 구조

```
app/                       페이지(App Router)
  api/ai/artwork-analysis/ AI 작품 분석 Route Handler (POST 전용)
  debug/ai/                개발자용 AI 확인 화면
components/
  mascot/                  케어햄(CareHam, CareHamReaction, CareHamSpeechBubble)
  reward/                  제출 축하 연출(SubmissionCelebration, SeedJar, SeedDropAnimation, PraiseOverlay)
  artwork/                 ArtworkMotion(AI 모션 적용), ContributionGallery, SharedCanvasPreview
  drawing/, assignment/, auth/, common/, result/, theme/   (기존 그림판·배정·로그인 UI)
lib/
  ai/                      types/schema(Zod)/prompt/client(OpenAI, server-only)/fallback/index
  mascot/                  mascot-config.ts, praise-messages.ts(사전 검수 문장 풀 + 금지어 검사)
  rewards/                 seed-config.ts, seed-ledger.ts(append-only 해바라씨 원장)
  config/                  주제·사분면·도구·색상·굵기 설정
  constants/                이미지 경로, 화면 문구(UI_TEXT)
  mock/                    사용자 인증, 주제, 주간 캔버스/기여물 mock 서비스
  storage/                 localStorage 저장소
  drawing/                 캔버스 crop·투명화·합성·stroke 렌더링·반짝이 생성
  store/                   zustand: session, drawing, reward, ai
  utils/                   사분면 랜덤 배정(AssignmentRepository 인터페이스 포함)
types/                     도메인 타입(theme, assignment, room, drawing, user)
tests/                     vitest 단위 테스트
```

## 아직 mock인 부분 / Supabase 연동 지점

실제 서버로 교체할 때는 아래 함수 내부만 API 호출로 바꾸면 나머지 화면은 그대로 동작합니다.

| 기능 | 지금 구현 | 나중에 바꿀 파일 |
| --- | --- | --- |
| 로그인 인증 | 6자리 숫자 + mock 목록 대조 | `lib/mock/users.ts`의 `verifyRegistrationNumber` |
| 이번 주 주제 조회 | `lib/config/themes.ts`의 고정 배열 | `lib/mock/theme.ts`의 `fetchActiveTheme` |
| 사분면 배정 | localStorage 기반 랜덤 배정 | `lib/utils/random-assignment.ts`(`AssignmentRepository` 인터페이스로 이미 분리됨) |
| 주간 캔버스·기여물 | localStorage, 아직 안 채워진 자리는 mock 케어햄 색칠본으로 즉시 채움(실시간 대기 없음) | `lib/mock/weekly-canvas.ts` |
| 해바라씨 원장 | localStorage, append-only | `lib/rewards/seed-ledger.ts` |
| AI 작품 분석 | OpenAI 호출 + Zod 검증, 실패 시 즉시 fallback | `lib/ai/artwork-analysis.client.ts`, `app/api/ai/artwork-analysis/route.ts` |
| 그림 자동저장 | localStorage | `lib/storage/local-drawing-storage.ts` |

## 알려진 제한사항

- **아직 하지 않은 것(요청서 21·26번 항목대로)**: 실제 병원 서버 로그인, EMR 연동, 실시간 다중
  사용자 Canvas, 자유 채팅, 병원 간 순위/투표, 개인정보 입력, 결제, 광고, 실제 사진 업로드,
  복잡한 3D 애니메이션, 실시간 생성형 TTS.
- 케어햄 개별 이미지 파일이 아직 없어 항상 이모지 fallback으로 보입니다(기능·구조는 완성).
- 음성 칭찬(`public/audio/praise/`)용 mp3 파일이 아직 없어, 지금은 텍스트+애니메이션만
  표시됩니다(요청대로 실시간 TTS는 아예 구현하지 않았습니다).
- "우리 그림에 모인 색깔" 화면에서 아직 채워지지 않은 사분면은 즉시 mock 케어햄 색칠본으로
  채워집니다(다른 병원 아이의 실제 참여를 흉내낸 자리표시자이며, 화면에는 이를 구분해서
  보여주지 않습니다).
- 무지개색은 Konva 선형 그라데이션으로 그려지며, 반짝이(금/은)는 단색 + 별 파티클 효과로
  대체되어 있습니다(`GLITTER` 도구를 쓸 때만).
- 그림·해바라씨·AI 분석 결과는 브라우저 localStorage에만 저장되므로 기기를 바꾸거나 브라우저
  데이터를 지우면 사라집니다. 그림이 많이 쌓이면 localStorage 용량 제한에 걸릴 수 있습니다
  (저장 실패 시 자동 재시도 + 상태 표시로 완화).
- AI 분석은 실제 키(`gpt-5.4-mini`)로 엔드투엔드 호출까지 확인했습니다(`source: "AI"` 응답 확인).
  키가 접근 가능한 모델이 vision 입력이나 구조화된 JSON 출력을 지원하지 않으면 매 요청이
  fallback으로 처리되며, 이 경우에도 아이 경험은 전혀 끊기지 않습니다.
- 4분할 원본 도안(`public/images/themes/tree/full.png`)의 십자선이 정확히 중앙(512, 512)에 있다는
  가정으로 각 조각을 잘라냅니다. 실제 배포용 도안 교체 시 이 가정을 다시 확인해야 합니다.
