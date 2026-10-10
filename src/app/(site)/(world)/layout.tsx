import { SubNav } from "@/components/sub-nav";
import { FRITZY_TABS } from "@/components/site-nav";

export default function FritzyWorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubNav items={FRITZY_TABS} label="Fritzy's World" />
      {children}
    </>
  );
}
