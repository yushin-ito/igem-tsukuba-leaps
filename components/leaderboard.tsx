"use client";

import AssayTable from "@/components/assay-table";
import env from "@/env";
import { fetcher, parseDSV } from "@/lib/utils";
import type { Project, Task } from "@prisma/client";
import { useMemo } from "react";
import useSWR from "swr";

interface LeaderboardProps {
  project: Pick<Project, "id">;
  tasks: Task[];
}

const Leaderboard = ({ project, tasks }: LeaderboardProps) => {
  const { data } = useSWR<Task[]>(
    `/api/tasks?projectId=${project.id}`,
    fetcher,
    {
      fallbackData: tasks,
      refreshInterval: (data) => {
        if (!data || data.length === 0) {
          return 0;
        }

        const status = data[0].status;
        const isActive = status === "pending" || status === "running";

        return isActive ? 2000 : 0;
      },
    },
  );

  const isActive = useMemo(() => {
    if (!data || data.length === 0) {
      return false;
    }

    const status = data[0].status;
    return status === "pending" || status === "running";
  }, [data]);

  const { data: text } = useSWR(
    !isActive ? `${env.NEXT_PUBLIC_BLOB_URL}/${project.id}/result.csv` : null,
    async (url: string) => {
      const response = await fetch(url, { cache: "no-store" });

      return response.text();
    },
    {
      refreshInterval: (data) => (data ? 0 : 2000),
    },
  );

  const { headers, rows } = useMemo(() => parseDSV(text ?? ""), [text]);

  return <AssayTable headers={headers} rows={rows} />;
};

export default Leaderboard;
