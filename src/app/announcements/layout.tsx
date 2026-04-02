import Sidebar from "@/components/Sidebar";

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="lg:hidden h-16" />
        {children}
      </main>
    </div>
  );
}
