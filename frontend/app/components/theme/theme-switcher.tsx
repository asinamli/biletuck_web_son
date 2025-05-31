"use client";

import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Moon, Sun, Palette } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className=" h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all pink:rotate-0 pink:scale-100 green:rotate-0 green:scale-100 yellow:rotate-0 yellow:scale-100 blue:rotate-0 blue:scale-100 black:rotate-0 black:scale-100 white:rotate-0 white:scale-100" />
          <span className="sr-only">Tema Değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Açık
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Koyu
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          Sistem
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("pink")}>
          Pembe
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("green")}>
          Yeşil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("yellow")}>
          Sarı
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("blue")}>
          Mavi
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("black")}>
          Siyah
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("white")}>
          Beyaz
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 