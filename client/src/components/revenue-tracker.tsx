import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface RevenueMetrics {
  totalMRR: number;
  totalOneTime: number;
  totalRevenue: number;
}

export default function RevenueTracker() {
  const { toast } = useToast();

  // Get active clients with their payment data
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Filter to active clients only
  const activeClients = clients.filter(client => client.status === "active");
  
  // Filter to active clients with payment data
  const payingClients = activeClients.filter(client => 
    client.currentPayment && 
    client.currentPayment !== "" && 
    parseFloat(client.currentPayment.replace(/[^0-9.-]+/g, "")) > 0
  );

  // Calculate metrics from client payment data
  const calculateMetrics = (): RevenueMetrics => {
    let totalMRR = 0;
    let totalOneTime = 0;

    payingClients.forEach(client => {
      // Only current payments count as actual revenue
      const monthlyAmount = parseFloat(client.currentPayment?.replace(/[^0-9.-]+/g, "") || "0");
      totalMRR += monthlyAmount;
      
      // Upsell is potential only, not actual revenue
      const upsellPotential = parseFloat(client.upsellAmount?.replace(/[^0-9.-]+/g, "") || "0");
      const additionalUpsell = Math.max(0, upsellPotential - monthlyAmount);
      totalOneTime += additionalUpsell;
    });

    return {
      totalMRR,
      totalOneTime,
      totalRevenue: totalMRR // Only actual revenue, not potential
    };
  };

  const metrics = calculateMetrics();

  // Generate 12 months of historical data assuming clients have been active
  const generateHistoricalData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Calculate monthly revenue for this month (from paying clients only)
      let monthlyRevenue = 0;
      payingClients.forEach(client => {
        const monthlyAmount = parseFloat(client.currentPayment?.replace(/[^0-9.-]+/g, "") || "0");
        monthlyRevenue += monthlyAmount;
      });
      
      months.push({
        month: monthName,
        revenue: monthlyRevenue,
        clients: payingClients.length
      });
    }
    
    return months;
  };

  const historicalData = generateHistoricalData();

  const exportRevenue = async () => {
    try {
      const response = await fetch("/api/export/revenue");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "revenue-report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Revenue report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export revenue report",
        variant: "destructive",
      });
    }
  };

  const getPackageTypeDisplay = (packageType: string) => {
    switch (packageType) {
      case "crm": return "CRM Only";
      case "crm_ads": return "CRM + Ads";
      case "website_only": return "Website Only";
      case "full_service": return "Full Service";
      default: return packageType;
    }
  };

  const getPackageTypeColor = (packageType: string) => {
    switch (packageType) {
      case "crm": return "bg-green-100 text-green-800";
      case "crm_ads": return "bg-blue-100 text-blue-800";
      case "website_only": return "bg-purple-100 text-purple-800";
      case "full_service": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRevenueByPackage = () => {
    const packageStats = activeClients.reduce((acc, client) => {
      const packageType = client.clientType || "unknown";
      if (!acc[packageType]) {
        acc[packageType] = { revenue: 0, clients: 0 };
      }
      const monthlyRevenue = parseFloat(client.currentPayment?.replace(/[^0-9.-]+/g, "") || "0");
      acc[packageType].revenue += monthlyRevenue;
      acc[packageType].clients += 1;
      return acc;
    }, {} as Record<string, { revenue: number; clients: number }>);

    return Object.entries(packageStats).map(([type, stats]) => ({
      type,
      ...stats,
    }));
  };

  if (clientsLoading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-0">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const packageStats = getRevenueByPackage();

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Revenue Analytics</h1>
          <p className="text-slate-600">
            {activeClients.length} total active clients · {payingClients.length} clients with payment data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Select defaultValue="last-12-months">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-12-months">Last 12 months</SelectItem>
              <SelectItem value="last-6-months">Last 6 months</SelectItem>
              <SelectItem value="current-year">Current year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportRevenue} variant="outline" className="w-full sm:w-auto">
            <i className="fas fa-download mr-2"></i>Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Monthly MRR</p>
                <p className="text-3xl font-bold">
                  ${metrics?.totalMRR?.toLocaleString() || "0"}
                </p>
                <p className="text-blue-100 text-sm mt-2">+8.2% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Upsell Potential</p>
                <p className="text-3xl font-bold">
                  ${metrics?.totalOneTime?.toLocaleString() || "0"}
                </p>
                <p className="text-green-100 text-sm mt-2">Additional revenue opportunity</p>
              </div>
              <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">
                  ${metrics?.totalRevenue?.toLocaleString() || "0"}
                </p>
                <p className="text-purple-100 text-sm mt-2">All time</p>
              </div>
              <div className="w-12 h-12 bg-purple-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-bar text-xl"></i>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* 12-Month Revenue History */}
      <Card className="mb-6 lg:mb-8">
        <CardHeader>
          <CardTitle>12-Month Revenue History</CardTitle>
          <p className="text-slate-600">Monthly recurring revenue trend (projected historical data)</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Monthly Revenue Trend</h4>
              <div className="space-y-2">
                {historicalData.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-800">{month.month}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">${month.revenue.toLocaleString()}</div>
                      <div className="text-sm text-slate-600">{month.clients} clients</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">12-Month Summary</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="font-semibold text-blue-800">Total 12-Month Revenue</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${(metrics.totalMRR * 12).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Based on current MRR</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="font-semibold text-green-800">Average Monthly Revenue</div>
                  <div className="text-2xl font-bold text-green-900">
                    ${metrics.totalMRR.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Consistent across 12 months</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="font-semibold text-purple-800">Revenue Growth Potential</div>
                  <div className="text-2xl font-bold text-purple-900">
                    ${(metrics.totalOneTime * 12).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">If all upsells convert</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Package Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {packageStats.map((pkg) => (
              <div key={pkg.type} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-slate-800">{getPackageTypeDisplay(pkg.type)}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">${pkg.revenue.toLocaleString()}</div>
                  <div className="text-sm text-slate-600">{pkg.clients} clients</div>
                </div>
              </div>
            ))}
            {packageStats.length === 0 && (
              <p className="text-center text-slate-500 py-8">No revenue data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeClients.slice(0, 5).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 border-l-4 border-l-green-500 bg-green-50 rounded-r-lg">
                <div>
                  <div className="font-medium text-slate-800">{client.businessName}</div>
                  <div className="text-sm text-slate-600">{getPackageTypeDisplay(client.clientType || "unknown")}</div>
                  <div className="text-xs text-slate-500">
                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'No date'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {client.currentPayment || "$0"}
                  </div>
                  <div className="text-xs text-slate-500">Monthly</div>
                </div>
              </div>
            ))}
            {activeClients.length === 0 && (
              <p className="text-center text-slate-500 py-8">No active clients with payments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Details Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Details</CardTitle>
            <Button onClick={exportRevenue} variant="outline" size="sm">
              <i className="fas fa-download mr-1"></i>
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile-friendly revenue list */}
          <div className="block lg:hidden space-y-4">
            {payingClients.map((client) => (
              <div key={client.id} className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-800">{client.businessName}</h4>
                    <p className="text-sm text-slate-600">{client.contactName}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{client.currentPayment}</div>
                    <div className="text-xs text-slate-500">Monthly</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Package:</span>
                  <span className="font-medium">{getPackageTypeDisplay(client.clientType)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-medium text-green-600">{client.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-800">Client</th>
                  <th className="text-left p-4 font-semibold text-slate-800">Package</th>
                  <th className="text-left p-4 font-semibold text-slate-800">Start Date</th>
                  <th className="text-center p-4 font-semibold text-slate-800">MRR</th>
                  <th className="text-center p-4 font-semibold text-slate-800">One-Time</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Total Paid</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{client.businessName}</div>
                      <div className="text-sm text-slate-600">{client.email}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={getPackageTypeColor(client.clientType || "unknown")}>
                        {getPackageTypeDisplay(client.clientType || "unknown")}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-800">
                      {client.currentPayment || "$0"}
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-800">
                      {client.upsellAmount || "$0"}
                    </td>
                    <td className="p-4 text-center font-semibold text-slate-800">
                      {client.currentPayment || "$0"}
                    </td>
                    <td className="p-4 text-center">
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
                {activeClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No active clients with payment data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
