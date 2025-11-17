import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/useSupabase";

export function useJobNumbers(isAuthenticated: boolean) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ["jobNumbers"],
    queryFn: async () => {
      // Fetch all unique job_base_numbers and their corresponding full job_number (for display)
      const { data, error } = await supabase
        .from("jobs")
        // CRITICAL: Use the distinct keyword to only return unique base numbers
        .select("job_base_number, job_number")
        .order("job_base_number", { ascending: false });

      if (error) throw new Error(`Failed to fetch job list: ${error.message}`);

      // Filter to get only unique base numbers and map for Select options
      const baseNumbers = data.reduce((acc, job) => {
        // Ensure only unique base numbers are added to the set
        if (!acc.find((item) => item.value === String(job.job_base_number))) {
          acc.push({
            value: String(job.job_base_number),
            label: `${job.job_base_number}`,
            originalJobNumber: job.job_number, // Optional: helpful context
          });
        }
        return acc;
      }, [] as { value: string; label: string; originalJobNumber: string }[]);

      return baseNumbers;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
