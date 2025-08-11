"use client";

import { Typeface } from "@workspace/common-models";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState
} from "react";
import { defaultState } from "./default-state";

type TypefacesContextType = {
  typefaces: Typeface[];
  setTypefaces: Dispatch<SetStateAction<Typeface[]>>;
};

const TypefacesContext = createContext<TypefacesContextType>({
  typefaces: defaultState.typefaces,
  setTypefaces: () => {
    throw new Error("setTypefaces function not implemented");
  },
});

export const TypefacesProvider = ({ children }: PropsWithChildren) => {
  const [typefaces, setTypefaces] = useState<Typeface[]>(
    defaultState.typefaces
  );

  return (
    <TypefacesContext.Provider value={{ typefaces, setTypefaces }}>
      {children}
    </TypefacesContext.Provider>
  );
};

export const useTypefaces = () => {
  const context = useContext(TypefacesContext);
  if (!context) {
    throw new Error("useTypefaces must be used within a TypefacesProvider");
  }
  return context;
};
