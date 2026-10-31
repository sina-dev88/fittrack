import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import AchievementProvider from "@/components/achievements/AchievementProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AchievementProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <main className="flex-1 p-6 pb-24 lg:p-8 lg:pb-8">
              {children}
            </main>
          </div>
        </div>

        <MobileNav />
      </div>
    </AchievementProvider>
  );
}