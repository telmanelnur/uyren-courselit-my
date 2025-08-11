"use client";

import { Theme } from "@workspace/page-models";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { defaultState } from "./default-state";

type ThemeContextType = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultState.theme,
  setTheme: () => {
    throw new Error("setTheme function not implemented");
  },
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(defaultState.theme);
  // const classicTheme = themes.find((theme) => theme.id === "classic");
  // const theme: Theme = {
  //   id: "classic",
  //   name: "Classic",
  //   theme: classicTheme!.theme,
  // };
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
