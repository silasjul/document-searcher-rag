"use client";

import { useState } from "react";
import { IconBriefcase } from "@tabler/icons-react";
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
import { createProject } from "@/utils/projects/projects-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const handleReset = () => {
    setProjectName("");
    setDescription("");
    setIsCreating(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(handleReset, 200);
    }
    onOpenChange(open);
  };

  const canCreate = projectName.trim() && description.trim();

  const handleCreate = async () => {
    if (!canCreate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const newProjectId = await createProject({
        name: projectName.trim(),
        description: description.trim(),
        documentIds: [],
      });

      toast.success("Project created successfully!");
      handleClose(false);
      router.push(`/dashboard/project/${newProjectId}`);
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBriefcase className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Enter the basic information for your new project. You can add
            documents after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-3">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Study Research"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) {
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g. Research on the impact of climate change on the ocean coral reefs."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canCreate) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isCreating}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
