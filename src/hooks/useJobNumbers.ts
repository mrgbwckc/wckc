import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/useSupabase";

export function useJobNumbers(isAuthenticated: boolean) {
  const { supabase } = useSupabase();

  return useQuery({
    queryKey: ["jobNumbers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")

        .select("job_base_number, job_number")
        .order("job_base_number", { ascending: false });

      if (error) throw new Error(`Failed to fetch job list: ${error.message}`);

      const baseNumbers = data.reduce((acc, job) => {
        if (!acc.find((item) => item.value === String(job.job_base_number))) {
          acc.push({
            value: String(job.job_base_number),
            label: `${job.job_base_number}`,
            originalJobNumber: job.job_number,
          });
        }
        return acc;
      }, [] as { value: string; label: string; originalJobNumber: string }[]);

      return baseNumbers;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
}
