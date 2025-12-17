import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" bg-slate-50">
      {/* The Header sits at the top */}

      {/* The Page Content renders below */}
      <main>{children}</main>
    </div>
  );
}
