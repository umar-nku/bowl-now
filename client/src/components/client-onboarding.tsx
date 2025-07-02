import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertOnboardingFormSchema, type OnboardingForm, type Client } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type OnboardingFormWithClient = OnboardingForm & { client?: Client };

const onboardingFormSchema = insertOnboardingFormSchema.extend({
  monthlyAdBudget: z.string().optional(),
  adChannels: z.array(z.string()).optional(),
  additionalContacts: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
  })).optional(),
});

type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

export default function ClientOnboarding() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<OnboardingForm | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: onboardingForms = [], isLoading } = useQuery<OnboardingFormWithClient[]>({
    queryKey: ["/api/onboarding"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormData) => {
      const response = await apiRequest("POST", "/api/onboarding", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Onboarding form created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create onboarding form",
        variant: "destructive",
      });
    },
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<OnboardingFormData> }) => {
      const response = await apiRequest("PUT", `/api/onboarding/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
      toast({
        title: "Success",
        description: "Onboarding form updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update onboarding form",
        variant: "destructive",
      });
    },
  });

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      phone: "",
      email: "",
      clientType: "",
      preferredCommunication: "email",
      webSlug: "",
      goals: "",
      monthlyAdBudget: "",
      promotions: "",
      assetFileNames: "",
      landingPageChoice: "",
      customizations: "",
      adChannels: [],
      fullWebsite: false,
      additionalContacts: [{ name: "", email: "", phone: "" }],
      completionProgress: 0,
      isCompleted: false,
    },
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control: form.control,
    name: "additionalContacts",
  });

  const watchedData = form.watch();

  // Auto-save functionality
  const { isSaving } = useAutoSave({
    endpoint: selectedForm ? `/api/onboarding/${selectedForm.id}` : "",
    data: watchedData,
    enabled: !!selectedForm && !form.formState.isSubmitting,
    debounceMs: 3000,
  });

  // Calculate completion progress
  useEffect(() => {
    const requiredFields = [
      "businessName",
      "contactName",
      "email",
      "phone",
      "clientType",
    ];
    
    const optionalSections = [
      "webSlug",
      "goals",
      "monthlyAdBudget",
      "promotions",
      "assetFileNames",
      "landingPageChoice",
      "customizations",
    ];

    const completedRequired = requiredFields.filter(field => {
      const value = watchedData[field as keyof OnboardingFormData];
      return value && value.toString().trim().length > 0;
    }).length;

    const completedOptional = optionalSections.filter(field => {
      const value = watchedData[field as keyof OnboardingFormData];
      return value && value.toString().trim().length > 0;
    }).length;

    const totalFields = requiredFields.length + optionalSections.length;
    const completedFields = completedRequired + completedOptional;
    const progress = Math.round((completedFields / totalFields) * 100);

    // Only update if progress has actually changed
    if (progress !== watchedData.completionProgress) {
      form.setValue("completionProgress", progress);
    }
  }, [watchedData.businessName, watchedData.contactName, watchedData.email, watchedData.phone, watchedData.clientType, watchedData.webSlug, watchedData.goals, watchedData.monthlyAdBudget, watchedData.promotions, watchedData.assetFileNames, watchedData.landingPageChoice, watchedData.customizations, watchedData.completionProgress, form]);

  const onSubmit = (data: OnboardingFormData) => {
    if (selectedForm) {
      updateOnboardingMutation.mutate({ 
        id: selectedForm.id, 
        data: { ...data, isCompleted: true, completionProgress: 100 }
      });
    } else {
      createOnboardingMutation.mutate(data);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (form: OnboardingForm) => {
    if (form.isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (form.completionProgress >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">Almost Done</Badge>;
    }
    if (form.completionProgress >= 25) {
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Started</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 pt-16 lg:pt-0">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">Client Onboarding</h1>
          <p className="text-slate-600">Manage new client intake and onboarding progress</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline">
            <i className="fas fa-share mr-2"></i>Share Form Link
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>New Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Onboarding</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client-select">Select Client (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose existing client or create new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedForm(null);
                      form.reset();
                      setIsCreateDialogOpen(false);
                    }}
                  >
                    Start Onboarding
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Onboarding Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {onboardingForms.slice(0, 3).map((onboardingForm) => (
          <Card key={onboardingForm.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{onboardingForm.businessName || "New Client"}</CardTitle>
                  <p className="text-sm text-slate-600">{onboardingForm.contactName}</p>
                </div>
                {getStatusBadge(onboardingForm)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Progress</span>
                  <span className="text-sm font-medium text-slate-700">{onboardingForm.completionProgress}%</span>
                </div>
                <Progress 
                  value={onboardingForm.completionProgress} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Business Info</span>
                  <i className={`fas ${onboardingForm.businessName ? 'fa-check text-green-600' : 'fa-minus text-slate-400'}`}></i>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Goals & Budget</span>
                  <i className={`fas ${onboardingForm.goals ? 'fa-check text-green-600' : 'fa-clock text-yellow-600'}`}></i>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Assets Upload</span>
                  <i className={`fas ${onboardingForm.assetFileNames ? 'fa-check text-green-600' : 'fa-minus text-slate-400'}`}></i>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Website Preferences</span>
                  <i className={`fas ${onboardingForm.landingPageChoice ? 'fa-check text-green-600' : 'fa-minus text-slate-400'}`}></i>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setSelectedForm(onboardingForm)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Onboarding Form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Client Onboarding Form</CardTitle>
              <p className="text-slate-600 mt-1">Complete all sections to activate your BowlNow services</p>
            </div>
            {isSaving && (
              <div className="flex items-center text-sm text-slate-500">
                <i className="fas fa-save mr-1 animate-pulse"></i>
                Auto-saving...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm font-medium text-blue-600">{watchedData.completionProgress}%</span>
            </div>
            <Progress 
              value={watchedData.completionProgress} 
              className="h-2"
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information Section */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-building text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Business Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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
                        <FormLabel>Main Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact name" {...field} />
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
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
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@business.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select package type" />
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
                  
                  <FormField
                    control={form.control}
                    name="preferredCommunication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Communication</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="webSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Web Slug</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg px-3 py-2 text-slate-600">
                            bowlnow.com/
                          </span>
                          <Input 
                            placeholder="yourcenter" 
                            className="rounded-l-none" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Goals & Budget Section */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-bullseye text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Goals & Budget</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Goals</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your main business goals and what you want to achieve..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="monthlyAdBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Ad Budget</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500">$</span>
                          <Input 
                            type="number" 
                            placeholder="1000" 
                            className="pl-8"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="promotions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Promotions & Specials</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List any current promotions, events, or special offers..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assets Section */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-images text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Assets & Media</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="assetFileNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo and Photos</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Textarea 
                            placeholder="List your logo and up to 5 photo file names..."
                            {...field} 
                          />
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer">
                            <i className="fas fa-cloud-upload-alt text-slate-400 text-3xl mb-4"></i>
                            <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500">PNG, JPG up to 10MB each</p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Website & Landing Page Section */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-globe text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Website & Landing Page</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="landingPageChoice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Landing Page Choice</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="choose_template">I'll Choose a Template</SelectItem>
                          <SelectItem value="let_us_pick">Let Us Pick</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customizations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customization Requests</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any specific changes to headlines, buttons, colors, or design preferences..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="adChannels"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Channels</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["google", "facebook", "instagram", "seo"].map((channel) => (
                            <div key={channel} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(channel) || false}
                                onCheckedChange={(checked) => {
                                  const currentChannels = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentChannels, channel]);
                                  } else {
                                    field.onChange(currentChannels.filter(c => c !== channel));
                                  }
                                }}
                              />
                              <Label className="text-sm capitalize">
                                {channel === "seo" ? "Local SEO" : `${channel} Ads`}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Website Build</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value ? "yes" : "no"}
                          onValueChange={(value) => field.onChange(value === "yes")}
                          className="flex items-center space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" />
                            <Label>Yes, I need a full website</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" />
                            <Label>No, landing page only</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Contacts Section */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user-friends text-white text-sm"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Additional Contacts</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendContact({ name: "", email: "", phone: "" })}
                  >
                    <i className="fas fa-plus mr-1"></i>Add Contact
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {contactFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                      <FormField
                        control={form.control}
                        name={`additionalContacts.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`additionalContacts.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contact@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-end space-x-2">
                        <FormField
                          control={form.control}
                          name={`additionalContacts.${index}.phone`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {contactFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeContact(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  <i className="fas fa-save mr-1"></i>
                  Form auto-saves as you type
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOnboardingMutation.isPending || updateOnboardingMutation.isPending}
                  >
                    {createOnboardingMutation.isPending || updateOnboardingMutation.isPending 
                      ? "Saving..." 
                      : "Complete Onboarding"
                    }
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
