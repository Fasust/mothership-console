"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useScenario } from "@/lib/context/scenario-context";
import { allThemes, useTheme } from "@/lib/context/theme-context";
import { useView } from "@/lib/context/view-context";
import { allScenarios } from "@/lib/models/scenario";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { scenario, setScenario } = useScenario();
  const { setCurrentView } = useView();

  const params = useParams();
  const currentViewType = params.viewType as string;
  const mapId = params.mapId as string;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <CommandInput
          placeholder="Type a command or search..."
          className="text-white"
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setCurrentView("exterior");
                  router.push(`/${mapId}/exterior`);
                })
              }
            >
              Navigation: Exterior
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setCurrentView("interior");
                  router.push(`/${mapId}/interior`);
                })
              }
            >
              Navigation: Interior
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  setCurrentView("interior-ascii");
                  router.push(`/${mapId}/interior-ascii`);
                })
              }
            >
              Navigation: ASCII Interior
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Scenarios">
            {allScenarios.map((map, index) => (
              <CommandItem
                key={map.id}
                onSelect={() =>
                  runCommand(() => {
                    setScenario(map);
                    router.push(`/${index}/${currentViewType}`);
                  })
                }
                className={`${
                  map.id === scenario.id ? "bg-primary/20" : "text-primary"
                }`}
              >
                Scenario: {map.id.toUpperCase()}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Theme">
            {allThemes.map((themeOption) => (
              <CommandItem
                key={themeOption}
                onSelect={() => runCommand(() => setTheme(themeOption))}
                className={`${themeOption} ${
                  themeOption === theme ? "bg-primary/20" : "text-primary"
                }`}
              >
                Theme: {themeOption.toUpperCase()}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
