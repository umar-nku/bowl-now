import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertBoostClientSchema, type BoostClient, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type BoostClientWithClient = BoostClient & { client: Client };

const boostClientFormSchema = insertBoostClientSchema;
type BoostClientFormData = z.infer<typeof boostClientFormSchema>;

export default function ClientTracker() {
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: boostClients = [], isLoading } = useQuery<BoostClientWithClient[]>({
    queryKey: ["/api/boost-clients"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createBoostClientMutation = useMutation({
    mutationFn: async (data: BoostClientFormData) => {
      const response = await apiRequest("POST", "/api/boost-clients", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boost-clients"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Boost client created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create boost client",
        variant: "destructive",
      });
    },
  });

  const updateBoostClientMutation = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: number; data: Partial<BoostClientFormData> }) => {
      const response = await apiRequest("PUT", `/api/boost-clients/${clientId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boost-clients"] });
      toast({
        title: "Success",
        description: "Progress updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const form = useForm<BoostClientFormData>({
    resolver: zodResolver(boostClientFormSchema),
    defaultValues: {
      clientId: undefined,
      kickoffCallCompleted: false,
      landingPagesLive: false,
      metaAdsLive: false,
      googleAdsLive: false,
      websiteLive: false,
      progressPercentage: 0,
    },
  });

  const onSubmit = (data: BoostClientFormData) => {
    createBoostClientMutation.mutate(data);
  };

  const calculateProgress = (boostClient: BoostClient) => {
    const steps = [
      boostClient.kickoffCallCompleted,
      boostClient.landingPagesLive,
      boostClient.metaAdsLive,
      boostClient.googleAdsLive,
      boostClient.websiteLive,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const getStatusIcon = (completed: boolean, isOverdue: boolean = false) => {
    if (isOverdue) {
      return <i className="fas fa-exclamation text-red-600"></i>;
    }
    if (completed) {
      return <i className="fas fa-check text-green-600"></i>;
    }
    return <i className="fas fa-minus text-slate-400"></i>;
  };

  const getStatusBadge = (completed: boolean, date?: Date | null, isOverdue: boolean = false) => {
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    if (completed && date) {
      return <Badge className="bg-green-100 text-green-800">Live ({date.toLocaleDateString()})</Badge>;
    }
    if (completed) {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  const exportCSV = async () => {
    try {
      const response = await fetch("/api/export/boost-clients");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "boost-clients.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-96 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Boost Client Tracker</h1>
          <p className="text-slate-600">Track project deliverables for your Boost clients</p>
        </div>
        <div className="flex space-x-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="incomplete">Incomplete Deliverables</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportCSV} variant="outline">
            <i className="fas fa-download mr-2"></i>Export CSV
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>Add Boost Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Boost Client</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.businessName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBoostClientMutation.isPending}>
                      {createBoostClientMutation.isPending ? "Creating..." : "Create Boost Client"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boost Client Deliverables</CardTitle>
          <p className="text-sm text-slate-600">{boostClients.length} active clients</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-800">Client Name</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Kickoff Call</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Landing Pages</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Meta Ads</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Google Ads</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Website</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Progress</th>
                  <th className="text-center p-4 font-semibold text-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {boostClients.map((boostClient) => {
                  const progress = calculateProgress(boostClient);
                  const hasIncomplete = progress < 100;
                  
                  return (
                    <tr 
                      key={boostClient.id} 
                      className={`hover:bg-slate-50 transition-colors ${hasIncomplete ? 'bg-red-25' : ''}`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-slate-800">{boostClient.client.businessName}</div>
                          <div className="text-sm text-slate-600">{boostClient.client.email}</div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1">
                            {getStatusIcon(boostClient.kickoffCallCompleted)}
                          </span>
                          {getStatusBadge(boostClient.kickoffCallCompleted, boostClient.kickoffCallDate)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1">
                            {getStatusIcon(boostClient.landingPagesLive)}
                          </span>
                          {getStatusBadge(boostClient.landingPagesLive, boostClient.landingPagesDate)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1">
                            {getStatusIcon(boostClient.metaAdsLive)}
                          </span>
                          {getStatusBadge(boostClient.metaAdsLive, boostClient.metaAdsDate)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1">
                            {getStatusIcon(boostClient.googleAdsLive)}
                          </span>
                          {getStatusBadge(boostClient.googleAdsLive, boostClient.googleAdsDate)}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1">
                            {getStatusIcon(boostClient.websiteLive)}
                          </span>
                          {getStatusBadge(boostClient.websiteLive, boostClient.websiteDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Progress value={progress} className="flex-1" />
                          <span className="text-sm font-medium text-slate-700">{progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Here you would implement the edit functionality
                            toast({
                              title: "Edit Client",
                              description: "Edit functionality would open here",
                            });
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {boostClients.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No boost clients found. Add your first boost client to get started.
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
