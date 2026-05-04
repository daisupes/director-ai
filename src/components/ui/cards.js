import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const ShellCard = forwardRef(function ShellCard(
  { className = "", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] shadow-[0_18px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export function NavCard({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,14,20,0.96),rgba(10,10,16,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ContextCard({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.028))] shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
