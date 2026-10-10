import { SubNav } from "@/components/sub-nav";
import { ABOUT_TABS } from "@/components/site-nav";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SubNav items={ABOUT_TABS} label="Tentang kami" />
      {children}
    </>
  );
}
