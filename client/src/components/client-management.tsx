import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertClientSchema, type Client, type BoostClient } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const clientFormSchema = insertClientSchema.extend({
  tags: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: boostClients = [] } = useQuery<(BoostClient & { client: Client })[]>({
    queryKey: ["/api/boost-clients"],
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      status: "active",
      clientType: "",
      notes: "",
      preferredCommunication: "email",
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (!selectedClient) throw new Error("No client selected");
      const response = await apiRequest("PUT", `/api/clients/${selectedClient.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsEditDialogOpen(false);
      form.reset();
      toast({
        title: "Client Updated",
        description: "Client information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update client information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter to show only active paying clients
  const activeClients = clients.filter(client => client.status === "active");

  const filteredClients = activeClients.filter(client => {
    const matchesSearch = client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || client.clientType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getClientTypeColor = (type: string | null) => {
    switch (type) {
      case "crm_ads": return "bg-blue-100 text-blue-800";
      case "website_only": return "bg-purple-100 text-purple-800";
      case "crm": return "bg-green-100 text-green-800";
      case "full_service": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getClientTypeLabel = (type: string | null) => {
    switch (type) {
      case "crm_ads": return "CRM + Ads";
      case "website_only": return "Website Only";
      case "crm": return "CRM";
      case "full_service": return "Boost";
      default: return "Basic";
    }
  };

  const getBoostProgress = (clientId: number) => {
    const boostClient = boostClients.find(bc => bc.client.id === clientId);
    return boostClient;
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsViewDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    form.reset({
      businessName: client.businessName,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone || "",
      status: client.status,
      clientType: client.clientType || "",
      notes: client.notes || "",
      preferredCommunication: client.preferredCommunication || "email",
      currentPayment: client.currentPayment || "",
      upsellAmount: client.upsellAmount || "",
    });
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: ClientFormData) => {
    updateClientMutation.mutate(data);
  };

  const getBoostClientData = (clientId: number) => {
    return boostClients.find(bc => bc.client.id === clientId);
  };

  const generateCommunicationTimeline = (client: Client) => {
    const timeline = [];
    if (client.createdAt) {
      timeline.push({
        date: new Date(client.createdAt).toLocaleDateString(),
        type: "Contact",
        message: "Initial contact established"
      });
    }
    timeline.push({
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      type: "Email",
      message: "Monthly service update sent"
    });
    if (client.status === "active") {
      timeline.push({
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: "Payment",
        message: "Payment received"
      });
    }
    return timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "prospect": return "bg-blue-100 text-blue-800";
      case "past_due": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (boostClient: BoostClient | undefined) => {
    if (!boostClient) return 0;
    
    const milestones = [
      boostClient.kickoffCallCompleted,
      boostClient.landingPagesLive,
      boostClient.metaAdsLive,
      boostClient.googleAdsLive,
      boostClient.websiteLive
    ];
    
    const completedMilestones = milestones.filter(Boolean).length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Active Client Management</h1>
          <p className="text-slate-600">Manage your {activeClients.length} active paying clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Types</SelectItem>
              <SelectItem value="crm">CRM Only</SelectItem>
              <SelectItem value="crm_ads">CRM + Ads</SelectItem>
              <SelectItem value="full_service">Full Service</SelectItem>
              <SelectItem value="website_only">Website Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredClients.map((client) => {
          const boostProgress = getBoostProgress(client.id);
          const isFullService = client.clientType === "full_service";
          
          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
                      {client.businessName}
                    </CardTitle>
                    <p className="text-sm text-slate-600">{client.contactName}</p>
                  </div>
                  <Badge className={getClientTypeColor(client.clientType)}>
                    {getClientTypeLabel(client.clientType)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">{client.email}</p>
                    <p className="text-sm text-slate-600">{client.phone}</p>
                  </div>

                  {/* Boost Progress for Full Service clients */}
                  {isFullService && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500 font-medium">Onboarding Progress:</p>
                        {boostProgress ? (
                          <span className="text-xs text-slate-600">
                            {calculateProgress(boostProgress)}%
                          </span>
                        ) : (
                          <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                            Start Tracking
                          </Button>
                        )}
                      </div>
                      {boostProgress && (
                        <Progress 
                          value={calculateProgress(boostProgress)} 
                          className="h-2 mb-2"
                        />
                      )}
                      {boostProgress && (
                        <div className="text-xs text-slate-600">
                          <div className="grid grid-cols-2 gap-1">
                            <span className={boostProgress.kickoffCallCompleted ? "text-green-600" : "text-slate-400"}>
                              ✓ Kickoff Call
                            </span>
                            <span className={boostProgress.landingPagesLive ? "text-green-600" : "text-slate-400"}>
                              ✓ Landing Pages
                            </span>
                            <span className={boostProgress.metaAdsLive ? "text-green-600" : "text-slate-400"}>
                              ✓ Meta Ads
                            </span>
                            <span className={boostProgress.googleAdsLive ? "text-green-600" : "text-slate-400"}>
                              ✓ Google Ads
                            </span>
                            <span className={boostProgress.websiteLive ? "text-green-600" : "text-slate-400"}>
                              ✓ Website Live
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {client.notes && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-slate-500 font-medium mb-1">Notes:</p>
                      <p className="text-xs text-slate-600 line-clamp-3">{client.notes}</p>
                    </div>
                  )}

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3 flex justify-between items-center">
                    <div className="text-sm font-medium text-green-600">
                      {client.currentPayment || '$0'}/month
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleClientClick(client)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-slate-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No clients found</h3>
          <p className="text-slate-600">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No active clients available."}
          </p>
        </div>
      )}

      {/* Client Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <span>Client Profile</span>
              {selectedClient && (
                <Badge className={getStatusColor(selectedClient.status)}>
                  {selectedClient.status}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              View comprehensive client information including subscription details, communication history, and boost progress.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="communication">Timeline</TabsTrigger>
                <TabsTrigger value="boost">Boost Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-600">Business Name:</span>
                        <p className="font-medium">{selectedClient.businessName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Contact Name:</span>
                        <p className="font-medium">{selectedClient.contactName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Email:</span>
                        <p className="font-medium">{selectedClient.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Phone:</span>
                        <p className="font-medium">{selectedClient.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Preferred Communication:</span>
                        <p className="font-medium capitalize">{selectedClient.preferredCommunication}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Service Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-600">Service Type:</span>
                        <Badge className={`ml-2 ${getClientTypeColor(selectedClient.clientType)}`}>
                          {getClientTypeLabel(selectedClient.clientType)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Start Date:</span>
                        <p className="font-medium">
                          {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-600">Status:</span>
                        <Badge className={`ml-2 ${getStatusColor(selectedClient.status)}`}>
                          {selectedClient.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedClient.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedClient.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Monthly Payment</div>
                        <div className="text-2xl font-bold text-green-700">
                          {selectedClient.currentPayment || '$0'}
                        </div>
                        <div className="text-sm text-green-600">Current plan</div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Upsell Potential</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {selectedClient.upsellAmount || '$0'}
                        </div>
                        <div className="text-sm text-blue-600">Additional revenue</div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium">Annual Value</div>
                        <div className="text-2xl font-bold text-purple-700">
                          ${((parseFloat(selectedClient.currentPayment?.replace(/[^0-9.-]+/g, "") || "0")) * 12).toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-600">Projected yearly</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-800">Plan Features</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedClient.clientType === "full_service" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">CRM Management</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">Digital Advertising</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">Website Development</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">Analytics & Reporting</span>
                            </div>
                          </>
                        )}
                        {selectedClient.clientType === "crm_ads" && (
                          <>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">CRM Management</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-check text-green-500"></i>
                              <span className="text-sm">Digital Advertising</span>
                            </div>
                          </>
                        )}
                        {selectedClient.clientType === "crm" && (
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span className="text-sm">CRM Management</span>
                          </div>
                        )}
                        {selectedClient.clientType === "website_only" && (
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-check text-green-500"></i>
                            <span className="text-sm">Website Development</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Communication Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generateCommunicationTimeline(selectedClient).map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                              item.type === 'Email' ? 'bg-blue-500' : 
                              item.type === 'Payment' ? 'bg-green-500' : 'bg-gray-500'
                            }`}>
                              <i className={`fas ${
                                item.type === 'Email' ? 'fa-envelope' : 
                                item.type === 'Payment' ? 'fa-credit-card' : 'fa-phone'
                              }`}></i>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-slate-800">{item.type}</h4>
                              <span className="text-sm text-slate-500">{item.date}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="boost" className="space-y-6">
                {(() => {
                  const boostData = getBoostClientData(selectedClient.id);
                  if (!boostData) {
                    return (
                      <Card>
                        <CardContent className="text-center py-8">
                          <i className="fas fa-info-circle text-slate-400 text-3xl mb-4"></i>
                          <h3 className="text-lg font-medium text-slate-600 mb-2">Not a Boost Client</h3>
                          <p className="text-slate-500">This client is not enrolled in the Boost program.</p>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  const progress = calculateProgress(boostData);
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Boost Onboarding Progress</CardTitle>
                        <div className="flex items-center space-x-3">
                          <Progress value={progress} className="flex-1" />
                          <span className="font-semibold text-blue-600">{progress}%</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                              boostData.kickoffCallCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <i className={`fas ${boostData.kickoffCallCompleted ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'}`}></i>
                              <span className="font-medium">Kickoff Call</span>
                            </div>
                            
                            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                              boostData.landingPagesLive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <i className={`fas ${boostData.landingPagesLive ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'}`}></i>
                              <span className="font-medium">Landing Pages Live</span>
                            </div>

                            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                              boostData.websiteLive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <i className={`fas ${boostData.websiteLive ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'}`}></i>
                              <span className="font-medium">Website Live</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                              boostData.metaAdsLive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <i className={`fas ${boostData.metaAdsLive ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'}`}></i>
                              <span className="font-medium">Meta Ads Live</span>
                            </div>

                            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                              boostData.googleAdsLive ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <i className={`fas ${boostData.googleAdsLive ? 'fa-check-circle text-green-500' : 'fa-circle text-gray-400'}`}></i>
                              <span className="font-medium">Google Ads Live</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleEditClient(selectedClient)}>
                  Edit Client
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and service details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="past_due">Past Due</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="crm">CRM</SelectItem>
                          <SelectItem value="crm_ads">CRM + Ads</SelectItem>
                          <SelectItem value="website_only">Website Only</SelectItem>
                          <SelectItem value="full_service">Boost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Payment</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $500" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="upsellAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upsell Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $200" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferredCommunication"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Communication</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "email"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any notes about this client"
                        className="min-h-20"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateClientMutation.isPending}>
                  {updateClientMutation.isPending ? "Updating..." : "Update Client"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}