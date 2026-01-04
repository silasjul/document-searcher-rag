export type Case = {
  id: string;
  name: string;
  clientName: string;
  status: "active" | "archived";
  documentCount: number;
};

export type ChatSession = {
  id: string;
  caseId: string;
  title: string; // e.g. "Lease Analysis"
  updatedAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

// --- 2. THE DATA (Your Sandbox) ---

export const MOCK_CASES: Case[] = [
  {
    id: "case-1",
    name: "Odense Harbor Warehouse Lease",
    clientName: "Mærsk Logistics",
    status: "active",
    documentCount: 12,
  },
  {
    id: "case-2",
    name: "TechStart Acquisition Merger",
    clientName: "Nordic Capital",
    status: "active",
    documentCount: 45,
  },
];

export const MOCK_CHATS: ChatSession[] = [
  // Chats for Case 1 (Lease)
  {
    id: "chat-1-a",
    caseId: "case-1",
    title: "Termination Clauses",
    updatedAt: "2024-03-10T14:00:00Z",
  },
  {
    id: "chat-1-b",
    caseId: "case-1",
    title: "Rent Escalation Review",
    updatedAt: "2024-03-09T09:30:00Z",
  },
  // Chats for Case 2 (Merger)
  {
    id: "chat-2-a",
    caseId: "case-2",
    title: "IP Indemnity Risk",
    updatedAt: "2024-03-08T16:45:00Z",
  },
];

export const MOCK_MESSAGES: Message[] = [
  // --- Conversation 1-A: Termination ---
  {
    id: "msg-1",
    chatId: "chat-1-a",
    role: "user",
    content: "What is the notice period for early termination?",
    createdAt: "2024-03-10T14:00:00Z",
  },
  {
    id: "msg-2",
    chatId: "chat-1-a",
    role: "assistant",
    content: "According to **Clause 14.2**, the tenant must provide **6 months written notice**. \n\nHowever, this option is only available after the initial lock-in period of 24 months expires.",
    createdAt: "2024-03-10T14:00:05Z",
  },
  {
    id: "msg-3",
    chatId: "chat-1-a",
    role: "user",
    content: "Does the landlord have the right to relocate us?",
    createdAt: "2024-03-10T14:02:00Z",
  },
  {
    id: "msg-4",
    chatId: "chat-1-a",
    role: "assistant",
    content: "Yes, under **Clause 18 (Relocation)**. The landlord can relocate the tenant to 'substantially similar premises' within the same industrial park upon 90 days notice, provided they cover all moving costs.",
    createdAt: "2024-03-10T14:02:10Z",
  },

  // --- Conversation 1-B: Rent ---
  {
    id: "msg-5",
    chatId: "chat-1-b",
    role: "user",
    content: "Is the rent fixed for the first 5 years?",
    createdAt: "2024-03-09T09:30:00Z",
  },
  {
    id: "msg-6",
    chatId: "chat-1-b",
    role: "assistant",
    content: "No. The base rent is subject to annual indexation based on the **Net Price Index (NPI)**, capped at 4% per annum.",
    createdAt: "2024-03-09T09:30:05Z",
  },
];