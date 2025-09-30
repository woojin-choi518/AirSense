// app/lib/cn.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind className 합치기 유틸
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
