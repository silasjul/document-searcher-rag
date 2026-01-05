"use client";

export function PdfViewer({ documentId }: { documentId: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white text-black">
      <div>
        <h2 className="text-2xl font-bold">Hello</h2>
        <p className="text-sm text-gray-600">Document ID: {documentId}</p>
      </div>
    </div>
  );
}
