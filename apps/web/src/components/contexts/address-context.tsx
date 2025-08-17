"use client";

import { Address } from "@workspace/common-models";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { defaultState } from "./default-state";

type AddressContextType = {
  address: Address;
  setAddress: Dispatch<SetStateAction<Address>>;
};

const AddressContext = createContext<AddressContextType>({
  address: defaultState.address,
  setAddress: () => {
    throw new Error("setAddress function not implemented");
  },
});

export const AddressProvider = ({ children, initialAddress }: PropsWithChildren<{
  initialAddress?: Address;
}>) => {
  const [address, setAddress] = useState<Address>(initialAddress || defaultState.address);

  return (
    <AddressContext.Provider value={{ address, setAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
};
