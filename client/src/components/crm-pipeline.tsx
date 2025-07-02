
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertClientSchema, type Client, type BoostClient } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const clientFormSchema = insertClientSchema.extend({
  tags: z.array(z.string()).optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

const statusColumns = [
  { id: "prospect", title: "Prospects", color: "bg-yellow-100 text-yellow-800" },
  { id: "active", title: "Active", color: "bg-green-100 text-green-800" },
  { id: "past_due", title: "Past Due", color: "bg-red-100 text-red-800" },
  { id: "canceled", title: "Canceled", color: "bg-gray-100 text-gray-800" }
];

export default function CRMPipeline() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const updateClientStatusMutation = useMutation({
    mutationFn: async ({ clientId, status }: { clientId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/clients/${clientId}`, { status });
      return response.json();
    },
    onMutate: async ({ clientId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/clients"] });

      // Snapshot the previous value
      const previousClients = queryClient.getQueryData<Client[]>(["/api/clients"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Client[]>(["/api/clients"], (old) => {
        if (!old) return old;
        return old.map(client => 
          client.id === clientId 
            ? { ...client, status } 
            : client
        );
      });

      // Return a context object with the snapshotted value
      return { previousClients };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousClients) {
        queryClient.setQueryData<Client[]>(["/api/clients"], context.previousClients);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update client status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      status: "prospect",
      clientType: "",
      notes: "",
      preferredCommunication: "email",
    },
  });

  const onSubmit = (data: ClientFormData) => {
    createClientMutation.mutate(data);
  };

  const getClientsByStatus = (status: string) => {
    return clients.filter(client => client.status === status);
  };

  const filteredClients = filterStatus === "all" ? clients : getClientsByStatus(filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-green-100 text-green-800";
      case "past_due": return "bg-red-100 text-red-800";
      case "canceled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case "crm_ads": return "bg-blue-100 text-blue-800";
      case "website_only": return "bg-purple-100 text-purple-800";
      case "crm": return "bg-green-100 text-green-800";
      case "full_service": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsViewDialogOpen(true);
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case "crm_ads": return "CRM + Ads";
      case "website_only": return "Website Only";
      case "crm": return "CRM Only";
      case "full_service": return "Boost";
      default: return type;
    }
  };

  const getBoostClientData = (clientId: number) => {
    return boostClients.find(bc => bc.client.id === clientId);
  };

  const calculateBoostProgress = (boostClient: BoostClient) => {
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination, return early
    if (!destination) {
      return;
    }

    // If dropped in the same place, return early
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the client being moved
    const clientId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Update the client status
    updateClientStatusMutation.mutate({ clientId, status: newStatus });
  };

  const renderClientCard = (client: Client, index: number) => (
    <Draggable key={client.id} draggableId={client.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-lg border transition-all duration-200 ${
            snapshot.isDragging 
              ? 'shadow-lg rotate-2 border-blue-300 bg-white z-50' 
              : 'hover:shadow-md cursor-pointer'
          } ${
            client.status === 'prospect' ? 'bg-slate-50 border-slate-200' :
            client.status === 'active' ? 'bg-green-50 border-green-200' :
            client.status === 'past_due' ? 'bg-red-50 border-red-200' :
            'bg-slate-50 border-slate-200 opacity-75'
          }`}
          onClick={(e) => {
            if (!snapshot.isDragging) {
              handleClientClick(client);
            }
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-slate-800">{client.businessName}</h4>
            <Badge className={getStatusColor(client.status)}>
              {client.status === 'past_due' ? 'Past Due' : client.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">{client.contactName}</p>
          <p className="text-sm text-slate-600 mb-3">{client.email}</p>
          <div className="flex items-center justify-between">
            {client.clientType && (
              <Badge className={getClientTypeColor(client.clientType)}>
                {getClientTypeLabel(client.clientType)}
              </Badge>
            )}
            {client.status === 'active' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleClientClick(client);
                }}
                className="ml-auto"
              >
                View Profile
              </Button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-0">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-lg"></div>
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
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Sales Pipeline CRM</h1>
          <p className="text-slate-600">Manage all clients and prospects - Drag and drop to change status</p>
        </div>
        <div className="flex space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
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
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
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
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="prospect">Prospect</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="past_due">Past Due</SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
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
                          <FormLabel>Client Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="crm">CRM Only</SelectItem>
                              <SelectItem value="crm_ads">CRM + Ads</SelectItem>
                              <SelectItem value="website_only">Website Only</SelectItem>
                              <SelectItem value="full_service">Full Service</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about this client..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createClientMutation.isPending}>
                      {createClientMutation.isPending ? "Creating..." : "Create Client"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statusColumns.map((column) => {
            const columnClients = getClientsByStatus(column.id);
            
            return (
              <Card key={column.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{column.title}</CardTitle>
                    <Badge variant="secondary" className={column.id === 'active' ? 'bg-green-100 text-green-800' : column.id === 'past_due' ? 'bg-red-100 text-red-800' : ''}>
                      {columnClients.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[300px] max-h-96 overflow-y-auto rounded-lg transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 border-2 border-dashed border-blue-300' 
                            : ''
                        }`}
                      >
                        {columnClients.map((client, index) => renderClientCard(client, index))}
                        {provided.placeholder}
                        {columnClients.length === 0 && (
                          <div className="text-slate-500 text-center py-8 rounded-lg border-2 border-dashed border-slate-200">
                            {snapshot.isDraggingOver ? 'Drop here' : `No ${column.title.toLowerCase()}`}
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>

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
                        <Badge className={`ml-2 ${getClientTypeColor(selectedClient.clientType || '')}`}>
                          {getClientTypeLabel(selectedClient.clientType || '')}
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
                  
                  const progress = calculateBoostProgress(boostData);
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
                <Button>
                  Edit Client
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
