import { AppSidebar } from "@/components/admin/dashboard-skeleton/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* <ThemeProvider> */}
        {children}
        {/* </ThemeProvider> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
