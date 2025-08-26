"use client";

import { trpc } from "@/utils/trpc";
import { createContext, useContext, useEffect, useState } from "react";
import { FormMode } from "@/components/admin/layout/types";
import { ITheme } from "@/models/lms";
import { GeneralRouterOutputs } from "@/server/api/types";

type ThemeType =
  GeneralRouterOutputs["lmsModule"]["themeModule"]["theme"]["getById"];

interface ThemeContextType {
  initialData: ITheme;
  theme: ThemeType | null;
  mode: FormMode;
  loadDetailQuery: ReturnType<
    typeof trpc.lmsModule.themeModule.theme.getById.useQuery
  >;
  updateMutation: ReturnType<
    typeof trpc.lmsModule.themeModule.theme.update.useMutation
  >;
}

const ThemeContext = createContext<ThemeContextType>({
  initialData: null as any,
  theme: null,
  mode: "create",
  loadDetailQuery: (() => {
    throw new Error("loadDetailQuery is not implemented");
  }) as any,
  updateMutation: (() => {
    throw new Error("updateMutation is not implemented");
  }) as any,
});

export function ThemeProvider({
  children,
  initialMode,
  initialThemeData,
}: {
  children: React.ReactNode;
  initialMode: FormMode;
  initialThemeData?: any;
}) {
  const [mode] = useState<FormMode>(initialMode);
  const [theme, setTheme] = useState<ThemeType | null>(null);

  const loadDetailQuery = trpc.lmsModule.themeModule.theme.getById.useQuery(
    {
      id: initialThemeData?._id!,
    },
    {
      enabled: mode === "edit" && !!initialThemeData?._id,
    },
  );

  const updateMutation = trpc.lmsModule.themeModule.theme.update.useMutation({
    onSuccess: (response) => {
      setTheme(response as any);
    },
    onError: (error) => {
      // Error handling is done in the components
    },
  });

  useEffect(() => {
    if (loadDetailQuery.data) {
      setTheme(loadDetailQuery.data);
    }
  }, [loadDetailQuery.data]);

  const value: ThemeContextType = {
    initialData: initialThemeData,
    mode,
    theme,
    loadDetailQuery,
    updateMutation,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
