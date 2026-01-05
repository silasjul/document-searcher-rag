"use client";

import * as React from "react";

import { SettingsDialog } from "@/components/settings-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function NavSecondary({
  ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SettingsDialog />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
