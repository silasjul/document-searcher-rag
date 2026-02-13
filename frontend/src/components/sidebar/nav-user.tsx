"use client"

import { useState } from "react"
import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconTrash,
  IconAlertTriangle,
  IconLoader2,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/supabase/actions"
import { apiDelete } from "@/lib/api-client"
import { toast } from "sonner"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [accountOpen, setAccountOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") return

    setIsDeleting(true)
    try {
      await apiDelete("/users/me")
      toast.success("Account deleted successfully")
      // Sign out and redirect after deletion
      await logout()
    } catch {
      toast.error("Failed to delete account. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name || "User"}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name || "User"}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* ── Account Info Dialog ──────────────────────────────────────────── */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Your account information and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg text-lg">
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            {/* Danger zone */}
            <div className="space-y-3 outline outline-destructive/20 rounded-md p-4">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="text-destructive size-4" />
                <h4 className="text-sm font-medium text-destructive">
                  Danger Zone
                </h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all associated data including
                uploaded documents, tags, projects, and chat history. This action
                cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setAccountOpen(false)
                  setDeleteConfirmOpen(true)
                }}
              >
                <IconTrash className="size-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteConfirmOpen(open)
            if (!open) setConfirmText("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="size-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and remove all your data
              from our servers. This includes:
            </DialogDescription>
          </DialogHeader>

          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>All uploaded documents and files</li>
            <li>All tags and file associations</li>
            <li>All projects and project documents</li>
            <li>All chat sessions and messages</li>
            <li>Your user account</li>
          </ul>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setConfirmText("")
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== "DELETE" || isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <IconTrash className="size-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
