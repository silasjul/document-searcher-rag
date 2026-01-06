export type Case = {
  id: string;
  name: string;
  clientName: string;
  status: "active" | "archived";
  documentIds: string[]; // References to documents from the library
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

export type Document = {
  id: string;
  name: string;
  fileSize: number; // in bytes
  pageCount: number;
  uploadedAt: string;
  status: "processing" | "ready" | "error";
  tags: string[];
};

// --- 2. THE DATA (Your Sandbox) ---

export const MOCK_DOCUMENTS: Document[] = [
  // Legal Documents
  {
    id: "doc-1",
    name: "Warehouse_Lease_Agreement_2024.pdf",
    fileSize: 2457600, // ~2.4 MB
    pageCount: 45,
    uploadedAt: "2024-03-01T10:00:00Z",
    status: "ready",
    tags: ["lease", "contract"],
  },
  {
    id: "doc-2",
    name: "Addendum_Rent_Escalation.pdf",
    fileSize: 524288, // ~512 KB
    pageCount: 8,
    uploadedAt: "2024-03-02T14:30:00Z",
    status: "ready",
    tags: ["lease", "addendum"],
  },
  {
    id: "doc-3",
    name: "Floor_Plans_Harbor_Unit_7B.pdf",
    fileSize: 8912896, // ~8.5 MB
    pageCount: 12,
    uploadedAt: "2024-03-03T09:15:00Z",
    status: "ready",
    tags: ["floor plan", "property"],
  },
  {
    id: "doc-4",
    name: "Environmental_Compliance_Report.pdf",
    fileSize: 1048576, // ~1 MB
    pageCount: 24,
    uploadedAt: "2024-03-05T16:45:00Z",
    status: "processing",
    tags: ["compliance", "report"],
  },
  {
    id: "doc-5",
    name: "Acquisition_Term_Sheet.pdf",
    fileSize: 1572864, // ~1.5 MB
    pageCount: 18,
    uploadedAt: "2024-02-28T11:00:00Z",
    status: "ready",
    tags: ["acquisition", "term sheet"],
  },
  {
    id: "doc-6",
    name: "Due_Diligence_Report_Q1.pdf",
    fileSize: 15728640, // ~15 MB
    pageCount: 156,
    uploadedAt: "2024-03-01T08:00:00Z",
    status: "ready",
    tags: ["due diligence", "report"],
  },
  {
    id: "doc-7",
    name: "IP_Portfolio_Summary.pdf",
    fileSize: 3145728, // ~3 MB
    pageCount: 42,
    uploadedAt: "2024-03-04T13:20:00Z",
    status: "ready",
    tags: ["IP", "portfolio"],
  },
  {
    id: "doc-8",
    name: "NDA_Template_Standard.pdf",
    fileSize: 245760, // ~240 KB
    pageCount: 6,
    uploadedAt: "2024-03-06T10:00:00Z",
    status: "ready",
    tags: ["NDA", "template"],
  },
  {
    id: "doc-9",
    name: "Employment_Contract_Executive.pdf",
    fileSize: 512000, // ~500 KB
    pageCount: 14,
    uploadedAt: "2024-03-07T11:30:00Z",
    status: "ready",
    tags: ["employment", "contract"],
  },
  {
    id: "doc-10",
    name: "Board_Resolution_March_2024.pdf",
    fileSize: 358400, // ~350 KB
    pageCount: 4,
    uploadedAt: "2024-03-08T09:00:00Z",
    status: "error",
    tags: ["board", "resolution"],
  },
];

const INITIAL_CASES: Case[] = [
  {
    id: "case-1",
    name: "Odense Harbor Warehouse Lease",
    clientName: "Mærsk Logistics",
    status: "active",
    documentIds: ["doc-1", "doc-2", "doc-3", "doc-4"],
  },
  {
    id: "case-2",
    name: "TechStart Acquisition Merger",
    clientName: "Nordic Capital",
    status: "active",
    documentIds: ["doc-5", "doc-6", "doc-7"],
  },
];

// Use global to persist data during dev server hot reloads and across server actions
declare global {
  var _mockCases: Case[] | undefined;
}

const getMockCases = () => {
  // In the browser/client, just return the initial cases.
  // The client shouldn't be mutating this directly anyway.
  if (typeof window !== "undefined") {
    return [...INITIAL_CASES];
  }

  // On the server (Node.js), use globalThis to persist data across hot reloads
  if (!globalThis._mockCases) {
    globalThis._mockCases = [...INITIAL_CASES];
  }
  return globalThis._mockCases;
};

export const MOCK_CASES = getMockCases();

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
    content:
      "According to **Clause 14.2**, the tenant must provide **6 months written notice**. \n\nHowever, this option is only available after the initial lock-in period of 24 months expires.",
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
    content:
      "Yes, under **Clause 18 (Relocation)**. The landlord can relocate the tenant to 'substantially similar premises' within the same industrial park upon 90 days notice, provided they cover all moving costs.",
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
    content:
      "No. The base rent is subject to annual indexation based on the **Net Price Index (NPI)**, capped at 4% per annum.",
    createdAt: "2024-03-09T09:30:05Z",
  },
];
