"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SiteInfo } from '@workspace/common-models';

interface SiteInfoContextType {
  siteInfo: SiteInfo;
  updateSiteInfo: (updates: Partial<SiteInfo>) => void;
  resetSiteInfo: () => void;
}

const defaultSiteInfo: SiteInfo = {
  title: "Uyren.AI - Design Template",
  subtitle: "Create a future with real skills",
  logo: {
    file: "/img/logo.svg",
    thumbnail: "/img/logo.svg",
    caption: "Uyren.AI Logo"
  },
  currencyISOCode: "USD",
  paymentMethod: "",
  stripeKey: "",
  codeInjectionHead: "",
  codeInjectionBody: "",
  mailingAddress: "",
  hideCourseLitBranding: false,
  razorpayKey: "",
  lemonsqueezyKey: ""
};

const SiteInfoContext = createContext<SiteInfoContextType | undefined>(undefined);

interface SiteInfoProviderProps {
  children: ReactNode;
  initialSiteInfo?: Partial<SiteInfo>;
}

export const SiteInfoProvider: React.FC<SiteInfoProviderProps> = ({ 
  children, 
  initialSiteInfo = {} 
}) => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    ...defaultSiteInfo,
    ...initialSiteInfo
  });

  const updateSiteInfo = (updates: Partial<SiteInfo>) => {
    setSiteInfo(prev => ({ ...prev, ...updates }));
  };

  const resetSiteInfo = () => {
    setSiteInfo(defaultSiteInfo);
  };

  const value: SiteInfoContextType = {
    siteInfo,
    updateSiteInfo,
    resetSiteInfo
  };

  return (
    <SiteInfoContext.Provider value={value}>
      {children}
    </SiteInfoContext.Provider>
  );
};

export const useSiteInfo = (): SiteInfoContextType => {
  const context = useContext(SiteInfoContext);
  if (context === undefined) {
    throw new Error('useSiteInfo must be used within a SiteInfoProvider');
  }
  return context;
};
