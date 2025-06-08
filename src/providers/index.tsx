"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { DexieProvider } from "./dexie-provider";
import { MotionProvider } from "./motion-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionProvider>
          <DexieProvider>
            <ToastProvider>{children}</ToastProvider>
          </DexieProvider>
        </MotionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
