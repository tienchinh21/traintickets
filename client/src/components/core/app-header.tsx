import { Bell, Menu, TrainFront } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-4 lg:px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TrainFront className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">TrainTickets</span>
            <span className="text-xs text-muted-foreground">Vietnam railway booking</span>
          </div>
        </div>
        <nav className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
          <Button variant="ghost">Routes</Button>
          <Button variant="ghost">My tickets</Button>
          <Button variant="ghost">Support</Button>
        </nav>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" aria-label="Notifications">
            <Bell />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="icon" variant="outline" aria-label="Open menu" />}>
              <Menu />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>My bookings</DropdownMenuItem>
                <DropdownMenuItem>Payment methods</DropdownMenuItem>
                <DropdownMenuItem>Language: Vietnamese</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Avatar className="size-8">
            <AvatarFallback>TC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
