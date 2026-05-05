import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

function toPascalCase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const tokens = trimmed
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase());
  return tokens.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join("");
}

export function resolveLucideIcon(iconName: string | null | undefined): LucideIcon {
  const normalized = toPascalCase(iconName ?? "");
  const Icon = (LucideIcons as unknown as Record<string, unknown>)[normalized];
  if (typeof Icon === "function") return Icon as LucideIcon;
  return LucideIcons.HelpCircle;
}

export function getLucideIconNames(): string[] {
  return Object.keys(LucideIcons)
    .filter((k) => typeof (LucideIcons as unknown as Record<string, unknown>)[k] === "function")
    .sort((a, b) => a.localeCompare(b));
}
