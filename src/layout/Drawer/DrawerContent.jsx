import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

function CollapsibleNavItem({ item, collapsed, isActive, pathname }) {
  const inSection = isActive(item.url);
  const exactParentActive = isActive(item.url, true);
  const [open, setOpen] = useState(inSection);

  useEffect(() => {
    if (inSection) setOpen(true);
  }, [inSection, pathname]);

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={inSection} tooltip={item.title}>
          <Link
            to={item.url}
            className={`flex items-center gap-3 rounded-lg transition-smooth ${
              inSection
                ? "gradient-primary text-white! shadow-glow font-medium [&_svg]:text-white!"
                : "hover:bg-sidebar-accent"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          <SidebarMenuButton
            asChild
            isActive={exactParentActive}
            tooltip={item.title}
            className={`flex-1 rounded-lg transition-smooth ${
              exactParentActive
                ? "gradient-primary text-white! shadow-glow font-medium [&_svg]:text-white!"
                : inSection
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-sidebar-accent"
            }`}
          >
            <Link
              to={item.url}
              onClick={() => setOpen(true)}
              className="flex items-center gap-3 w-full"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={`Toggle ${item.title} dropdown`}
              className="p-1.5 ml-0.5 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  open ? "rotate-90" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((sub) => {
              const subActive = isActive(sub.url, sub.exact);
              return (
                <SidebarMenuSubItem key={sub.url}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subActive}
                    className={
                      subActive
                        ? "gradient-primary text-white! shadow-glow font-medium"
                        : "hover:bg-sidebar-accent"
                    }
                  >
                    <Link to={sub.url} className="flex items-center justify-between w-full">
                      <span className="truncate">{sub.title}</span>
                      {typeof sub.badge === "number" && (
                        <span
                          className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                            subActive
                              ? "bg-white/20 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function DrawerContent({ sections, collapsed, isActive, pathname }) {
  return (
    <SidebarContent className="px-2 sidebar-scroll">
      {sections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => {
                if (Array.isArray(item.children) && item.children.length > 0) {
                  return (
                    <CollapsibleNavItem
                      key={item.title}
                      item={item}
                      collapsed={collapsed}
                      isActive={isActive}
                      pathname={pathname}
                    />
                  );
                }

                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 rounded-lg transition-smooth ${
                          active
                            ? "gradient-primary text-white! shadow-glow font-medium [&_svg]:text-white!"
                            : "hover:bg-sidebar-accent"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}

DrawerContent.displayName = "DrawerContent";
