import { createContext, useContext, useState, type ReactNode } from "react";
import { demoCompanies, type DemoCompany } from "@/data/demo";

type PlatformDemo = { companies: DemoCompany[]; addCompany: (company: DemoCompany) => void };
const DemoContext = createContext<PlatformDemo | null>(null);
export function DemoPlatformProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<DemoCompany[]>(demoCompanies);
  return (
    <DemoContext.Provider
      value={{
        companies,
        addCompany: (company) => setCompanies((current) => [...current, company]),
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}
export function usePlatformDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("A prévia administrativa precisa do seu contexto.");
  return context;
}
