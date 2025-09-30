// TogglePanel.tsx
import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/app/lib/cn";

export default function TogglePanel({
  title,
  children,
  horizontal,
  widthClass = "min-w-[220px] max-w-[88vw] sm:min-w-[280px] sm:max-w-[24vw]",
  topOffset,
  bottomOffset,
  z = 40,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  horizontal: string;       // 'left-4' | 'right-4'
  widthClass?: string;
  topOffset?: number;       // px
  bottomOffset?: number;       // px
  z?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "fixed",            // 모두 fixed
        horizontal,         // left-4 or right-4
        widthClass,
        `z-${z}`
      )}
      // ✅ 두 패널 모두 동일한 top 계산
      style={
        topOffset !== undefined
            ? { top: `calc(env(safe-area-inset-top, 0px) + ${topOffset}px)` }
            : { bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset ?? 0}px)` }
        }
    >
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        {/* 헤더(칩) */}
        <Collapsible.Trigger
          className={cn(
            // 높이 고정 + 줄바꿈 방지 (두 패널 동일)
            "h-12 px-5 whitespace-nowrap overflow-hidden text-ellipsis",
            "w-full rounded-full shadow-md select-none",
            "bg-gradient-to-r from-teal-800/20 to-blue-500/20",
            "backdrop-blur-md border-2 border-teal-300",
            "text-white font-bold flex items-center justify-between",
            "transition-[transform,opacity,box-shadow] duration-300"
          )}
        >
          <span className="leading-none">{title}</span>
          <span className={cn("text-lg leading-none transition-transform", open && "rotate-90")}>▸</span>
        </Collapsible.Trigger>

        {/* 본문 */}
        <Collapsible.Content
          className={cn(
            "mt-2 rounded-2xl border-2 border-teal-300",
            "bg-gradient-to-br from-teal-800/20 to-blue-500/20",
            "backdrop-blur-md shadow-lg",
            "animate-in slide-in-from-top-2 fade-in duration-200",
            "w-full"
          )}
        >
          <div className="w-full max-h-[80vh] overflow-y-auto p-1">
            {children}
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
