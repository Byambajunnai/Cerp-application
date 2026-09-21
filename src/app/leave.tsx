
import { API_URL } from "../config/api";

export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface LeaveRequest {
  id: number;
  type: string;
  paid: boolean;
  startDate: string;
  returnDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approver?: string;
  approvedAt?: string;
  approvalComment?: string;
}

export interface CreateLeaveRequest {
  type: string;
  paid: boolean;
  startDate: string;
  returnDate: string;
  reason: string;
}

const USE_MOCK_DATA = true;

// Эдгээр URL нь жишээ.
// CERP-ийн бодит API URL-аар солино.
const LEAVE_API = `${API_URL}/api/leave`;

let mockLeaves: LeaveRequest[] = [
  {
    id: 1,
    type: "Ээлжийн амралт",
    paid: true,
    startDate: "2026-09-14",
    returnDate: "2026-09-19",
    reason: "Жилийн ээлжийн амралтаа авах хүсэлтэй байна.",
    status: "APPROVED",
    createdAt: "2026-09-01",
    approver: "О.АРИУНТУЯА",
    approvedAt: "2026-09-03",
    approvalComment: "Зөвшөөрсөн.",
  },
  {
    id: 2,
    type: "Хувийн чөлөө",
    paid: false,
    startDate: "2026-09-25",
    returnDate: "2026-09-28",
    reason: "Хувийн шалтгаанаар чөлөө авах хүсэлтэй байна.",
    status: "PENDING",
    createdAt: "2026-09-21",
  },
];

function today(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `API алдаа: ${response.status}`
    );
  }

  return response.json();
}

// Миний хүсэлтүүд
export async function getMyLeaveRequests(): Promise<
  LeaveRequest[]
> {
  if (USE_MOCK_DATA) {
    return [...mockLeaves].reverse();
  }

  const response = await fetch(LEAVE_API, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return parseResponse<LeaveRequest[]>(response);
}

// Нэг хүсэлтийн дэлгэрэнгүй
export async function getLeaveById(
  id: number
): Promise<LeaveRequest> {
  if (USE_MOCK_DATA) {
    const leave = mockLeaves.find(
      (item) => item.id === id
    );

    if (!leave) {
      throw new Error("Хүсэлт олдсонгүй.");
    }

    return leave;
  }

  const response = await fetch(
    `${LEAVE_API}/${id}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return parseResponse<LeaveRequest>(response);
}

// Шинэ хүсэлт үүсгэх
export async function createLeaveRequest(
  data: CreateLeaveRequest
): Promise<LeaveRequest> {
  if (USE_MOCK_DATA) {
    const newLeave: LeaveRequest = {
      id: Date.now(),
      ...data,
      status: "PENDING",
      createdAt: today(),
    };

    mockLeaves.push(newLeave);

    return newLeave;
  }

  const response = await fetch(LEAVE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse<LeaveRequest>(response);
}