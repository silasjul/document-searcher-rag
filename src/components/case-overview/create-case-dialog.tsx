"use client";

import { useState } from "react";
import { IconBriefcase, IconFiles, IconChevronLeft } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MOCK_DOCUMENTS, type Document } from "@/lib/mock-data";
import { DocumentStatusBadge } from "@/components/documents/document-status-badge";
import { formatFileSize, cn } from "@/lib/utils";
import { createCase, addDocumentsToCase } from "@/utils/cases/cases-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId?: string; // If provided, dialog opens in "add documents" mode for existing case
  caseName?: string; // Name of the existing case (for display)
  existingDocumentIds?: string[]; // Document IDs already in the case (to filter out)
}

type Step = "info" | "documents";

export function CreateCaseDialog({
  open,
  onOpenChange,
  caseId,
  caseName: existingCaseName,
  existingDocumentIds = [],
}: CreateCaseDialogProps) {
  const router = useRouter();
  const isAddDocumentsMode = !!caseId;
  const [step, setStep] = useState<Step>(
    isAddDocumentsMode ? "documents" : "info"
  );
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [caseName, setCaseName] = useState(existingCaseName || "");
  const [clientName, setClientName] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set()
  );

  const handleReset = () => {
    setStep(isAddDocumentsMode ? "documents" : "info");
    setCaseName(existingCaseName || "");
    setClientName("");
    setSelectedDocumentIds(new Set());
    setIsCreating(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset after animation completes
      setTimeout(handleReset, 200);
    }
    onOpenChange(open);
  };

  const handleNextStep = () => {
    if (step === "info" && caseName.trim() && clientName.trim()) {
      setStep("documents");
    }
  };

  const handleBackStep = () => {
    setStep("info");
  };

  const toggleDocument = (docId: string) => {
    const newSelected = new Set(selectedDocumentIds);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocumentIds(newSelected);
  };

  const handleCreate = async () => {
    if (isAddDocumentsMode) {
      // Add documents to existing case
      if (selectedDocumentIds.size === 0) {
        toast.error("Please select at least one document");
        return;
      }

      setIsCreating(true);
      try {
        await addDocumentsToCase(caseId!, Array.from(selectedDocumentIds));
        toast.success(
          `Added ${selectedDocumentIds.size} document${
            selectedDocumentIds.size !== 1 ? "s" : ""
          } to case`
        );
        handleClose(false);
        router.refresh(); // Refresh to show new documents
      } catch (error) {
        toast.error("Failed to add documents");
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    } else {
      // Create new case
      if (!caseName.trim() || !clientName.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsCreating(true);
      try {
        const newCaseId = await createCase({
          name: caseName.trim(),
          clientName: clientName.trim(),
          documentIds: Array.from(selectedDocumentIds),
        });

        toast.success("Case created successfully!");
        handleClose(false);

        // Navigate to the new case
        router.push(`/dashboard/case/${newCaseId}`);
      } catch (error) {
        toast.error("Failed to create case");
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const canProceed =
    step === "info" ? caseName.trim() && clientName.trim() : true; // Can create case without documents

  // Get available documents (only ready ones, and exclude already added documents in add mode)
  const availableDocuments = MOCK_DOCUMENTS.filter((doc) => {
    if (doc.status !== "ready") return false;
    if (isAddDocumentsMode && existingDocumentIds.includes(doc.id))
      return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {isAddDocumentsMode ? (
                <>
                  <IconFiles className="h-5 w-5" />
                  Add Documents
                </>
              ) : (
                <>
                  <IconBriefcase className="h-5 w-5" />
                  Create New Case
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isAddDocumentsMode
              ? `Select documents from your library to add to "${existingCaseName}".`
              : step === "info"
              ? "Enter the basic information for your new case."
              : "Select documents from your library to add to this case (optional)."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          {step === "info" ? (
            <StepInfo
              caseName={caseName}
              setCaseName={setCaseName}
              clientName={clientName}
              setClientName={setClientName}
              onNext={handleNextStep}
            />
          ) : (
            <StepDocuments
              selectedDocumentIds={selectedDocumentIds}
              setSelectedDocumentIds={setSelectedDocumentIds}
              availableDocuments={availableDocuments}
              toggleDocument={toggleDocument}
            />
          )}
        </div>

        <DialogFooter className={cn(step === "documents" && "border-t pt-4")}>
          {step === "documents" && !isAddDocumentsMode && (
            <Button
              variant="outline"
              onClick={handleBackStep}
              disabled={isCreating}
              className="mr-auto"
            >
              <IconChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>

          {step === "info" ? (
            <Button onClick={handleNextStep} disabled={!canProceed}>
              Select Documents
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating
                ? isAddDocumentsMode
                  ? "Adding..."
                  : "Creating..."
                : isAddDocumentsMode
                ? "Add Documents"
                : "Create Case"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StepInfoProps {
  caseName: string;
  setCaseName: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  onNext: () => void;
}

function StepInfo({
  caseName,
  setCaseName,
  clientName,
  setClientName,
  onNext,
}: StepInfoProps) {
  const canProceed = caseName.trim() && clientName.trim();
  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-3">
        <Label htmlFor="case-name">
          Case Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="case-name"
          placeholder="e.g., Odense Harbor Warehouse Lease"
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canProceed) {
              onNext();
            }
          }}
          autoFocus
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="client-name">
          Client Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="client-name"
          placeholder="e.g., Mærsk Logistics"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canProceed) {
              onNext();
            }
          }}
        />
      </div>
    </div>
  );
}

interface StepDocumentsProps {
  selectedDocumentIds: Set<string>;
  setSelectedDocumentIds: (ids: Set<string>) => void;
  availableDocuments: Document[];
  toggleDocument: (id: string) => void;
}

function StepDocuments({
  selectedDocumentIds,
  setSelectedDocumentIds,
  availableDocuments,
  toggleDocument,
}: StepDocumentsProps) {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
        <div className="flex items-center gap-2 text-sm">
          <IconFiles className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {selectedDocumentIds.size} document
            {selectedDocumentIds.size !== 1 ? "s" : ""} selected
          </span>
        </div>
        {selectedDocumentIds.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDocumentIds(new Set())}
          >
            Clear all
          </Button>
        )}
      </div>

      {availableDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/20 py-12 text-center">
          <IconFiles className="mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium text-foreground">
            No documents available
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_DOCUMENTS.length === 0
              ? "Upload documents first to add them to your case"
              : "All available documents have already been added to this case"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {availableDocuments.map((doc) => (
            <DocumentSelectionRow
              key={doc.id}
              document={doc}
              isSelected={selectedDocumentIds.has(doc.id)}
              onToggle={() => toggleDocument(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocumentSelectionRowProps {
  document: Document;
  isSelected: boolean;
  onToggle: () => void;
}

function DocumentSelectionRow({
  document,
  isSelected,
  onToggle,
}: DocumentSelectionRowProps) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer hover:bg-muted/50 ${
        isSelected ? "border-primary bg-primary/5" : "border-border"
      }`}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{document.name}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>{document.pageCount} pages</span>
            </div>
          </div>
          <DocumentStatusBadge status={document.status} />
        </div>

        {document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
