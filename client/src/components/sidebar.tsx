import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-chart-line" },
    { id: "clients", label: "Active Clients", icon: "fas fa-handshake" },
    { id: "crm", label: "Prospects Pipeline", icon: "fas fa-users" },
    { id: "revenue", label: "Revenue Tracker", icon: "fas fa-dollar-sign" },
    { id: "invoices", label: "Invoices", icon: "fas fa-file-invoice-dollar" },
    { id: "onboarding", label: "Onboarding", icon: "fas fa-user-plus" },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileOpen(false); // Close mobile menu on selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white shadow-lg"
        >
          <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isCollapsed ? 'w-16' : 'w-64'} 
        bg-white shadow-lg border-r border-slate-200 fixed h-full overflow-y-auto z-40 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-bowling-ball text-white text-lg"></i>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-slate-800">BowlNow</h1>
                  <p className="text-sm text-slate-500">Business Dashboard</p>
                </div>
              )}
            </div>
            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex"
            >
              <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </Button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={`${item.icon} w-5`}></i>
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* User Section */}
        <div className={`absolute bottom-4 ${isCollapsed ? 'left-2 right-2' : 'left-4 right-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-sm text-slate-500`}>
            {!isCollapsed && <span>Admin User</span>}
            <button className="hover:text-slate-700" title="Sign Out">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
