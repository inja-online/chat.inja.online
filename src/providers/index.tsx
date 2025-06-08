"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { DexieProvider } from "./dexie-provider";
import { MotionProvider } from "./motion-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { BoundKeysProvider } from "./bind-to-key";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <MotionProvider>
            <DexieProvider>
              <ToastProvider>
                <BoundKeysProvider>{children}</BoundKeysProvider>
              </ToastProvider>
            </DexieProvider>
          </MotionProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
