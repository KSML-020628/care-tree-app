import type { ChildUser } from "@/types/user";

/**
 * 등록번호 -> 아이 정보 mock 데이터베이스.
 * 실제 서비스에서는 이 파일 대신 병원 등록 시스템 조회 API를 호출한다.
 */
export const MOCK_CHILD_USERS: readonly ChildUser[] = [
  {
    id: "user-blue-cloud",
    registrationNumber: "123456",
    nickname: "파랑구름",
    hospitalId: "hospital-a",
    hospitalName: "별빛어린이병원",
    age: 6,
    avatar: "☁️",
  },
];

/** 같은 방을 채우는 mock 친구들. 실제 서비스에서는 다른 병원 아이들이 이 자리를 채운다. */
export const MOCK_FRIEND_USERS: readonly ChildUser[] = [
  {
    id: "user-star-rabbit",
    registrationNumber: "000001",
    nickname: "별토끼",
    hospitalId: "hospital-b",
    hospitalName: "햇살어린이병원",
    age: 5,
    avatar: "🐰",
  },
  {
    id: "user-rainbow-bear",
    registrationNumber: "000002",
    nickname: "무지개곰",
    hospitalId: "hospital-c",
    hospitalName: "새싹어린이병원",
    age: 6,
    avatar: "🐻",
  },
  {
    id: "user-sunny-fox",
    registrationNumber: "000003",
    nickname: "햇살여우",
    hospitalId: "hospital-d",
    hospitalName: "구름어린이병원",
    age: 7,
    avatar: "🦊",
  },
];

/**
 * 등록번호로 로그인한다. 지금은 mock 목록과 6자리 형식만 확인하지만,
 * 나중에는 이 함수 내부만 실제 인증 API 호출로 바꾸면 된다.
 */
export async function verifyRegistrationNumber(code: string): Promise<ChildUser | null> {
  await simulateNetworkDelay();
  if (!/^\d{6}$/.test(code)) return null;
  const found = MOCK_CHILD_USERS.find((user) => user.registrationNumber === code);
  if (found) return found;

  // MVP 데모 편의: 등록된 번호가 아니어도 6자리 숫자면 임시 손님 계정으로 통과시킨다.
  return {
    id: `user-guest-${code}`,
    registrationNumber: code,
    nickname: "새싹친구",
    hospitalId: "hospital-a",
    hospitalName: "별빛어린이병원",
    age: 6,
    avatar: "🌱",
  };
}

function simulateNetworkDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
