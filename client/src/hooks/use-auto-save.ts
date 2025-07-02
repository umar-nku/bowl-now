import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UseAutoSaveOptions {
  endpoint: string;
  data: Record<string, any>;
  enabled?: boolean;
  debounceMs?: number;
}

export function useAutoSave({ endpoint, data, enabled = true, debounceMs = 2000 }: UseAutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>("");

  const autoSaveMutation = useMutation({
    mutationFn: async (saveData: Record<string, any>) => {
      const response = await apiRequest("PUT", endpoint, saveData);
      return response.json();
    },
    onSuccess: () => {
      // Optionally show a subtle save indicator
      console.log("Auto-saved successfully");
    },
    onError: (error: any) => {
      toast({
        title: "Auto-save failed",
        description: error.message || "Failed to save changes automatically",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!enabled) return;

    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedDataRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      lastSavedDataRef.current = currentDataString;
      autoSaveMutation.mutate(data);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, autoSaveMutation]);

  return {
    isSaving: autoSaveMutation.isPending,
    lastSaveError: autoSaveMutation.error,
  };
}
