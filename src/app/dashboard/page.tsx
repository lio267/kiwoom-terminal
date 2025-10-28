import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CandleChart from "@/components/chart/CandleChart";
import Footer from "@/components/Footer";
import ChartClient from "@/app/dashboard/ChartClient";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <Header />
      <main className="flex flex-col gap-6 md:flex-row">
        <CandleChart />
        <Sidebar />
      </main>
      <Footer />
      <ChartClient />
    </div>
  );
}
