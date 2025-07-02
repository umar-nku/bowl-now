import { useState } from "react";
import Sidebar from "@/components/sidebar";
import CRMPipeline from "@/components/crm-pipeline";
import ClientManagement from "@/components/client-management";
import ClientTracker from "@/components/client-tracker";
import RevenueTracker from "@/components/revenue-tracker";
import InvoiceManagement from "@/components/invoice-management";
import ClientOnboarding from "@/components/client-onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

type Tab = "dashboard" | "clients" | "crm" | "revenue" | "invoices" | "onboarding";

interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  prospects: number;
  overdue: number;
  totalMRR: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-4 lg:p-8">
            <div className="mb-6 lg:mb-8 pt-16 lg:pt-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
              <p className="text-slate-600">Welcome back! Here's what's happening with your business.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-blue-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {isLoading ? "..." : metrics?.totalClients || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-green-600">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Monthly MRR</CardTitle>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-green-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {isLoading ? "..." : `$${metrics?.totalMRR?.toLocaleString() || 0}`}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-green-600">+8%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Prospects</CardTitle>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-clock text-orange-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {isLoading ? "..." : metrics?.prospects || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="text-green-600">+3</span> new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Overdue Payments</CardTitle>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-red-600"></i>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {isLoading ? "..." : metrics?.overdue || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Action required</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button 
                    onClick={() => setActiveTab("crm")}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-plus text-blue-600 mr-3"></i>
                      <span className="font-medium">Add New Client</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </button>
                  <button 
                    onClick={() => setActiveTab("invoices")}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-file-invoice text-blue-600 mr-3"></i>
                      <span className="font-medium">Create Invoice</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </button>
                  <button 
                    onClick={() => setActiveTab("revenue")}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-download text-blue-600 mr-3"></i>
                      <span className="font-medium">Export Revenue Report</span>
                    </div>
                    <i className="fas fa-chevron-right text-slate-400"></i>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Payment received from client</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">New client onboarding completed</p>
                      <p className="text-xs text-slate-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Client moved to Past Due</p>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "clients":
        return <ClientManagement />;
      case "crm":
        return <CRMPipeline />;

      case "revenue":
        return <RevenueTracker />;
      case "invoices":
        return <InvoiceManagement />;
      case "onboarding":
        return <ClientOnboarding />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        if (["dashboard", "clients", "crm", "revenue", "invoices", "onboarding"].includes(tab)) {
          setActiveTab(tab as Tab);
        }
      }} />
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {renderTabContent()}
      </main>
    </div>
  );
}
