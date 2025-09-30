"use client";

import Icons from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn, fetcher } from "@/lib/utils";
import type { Project, Task } from "@prisma/client";
import { intervalToDuration } from "date-fns";
import { useFormatter, useNow, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import * as R from "remeda";
import useSWR from "swr";

interface StatusCardProps {
  project: Pick<Project, "id">;
  tasks: Task[];
}

const icon = {
  pending: Icons.clock,
  running: Icons.spinner,
  succeeded: Icons.circleCheckBig,
  failed: Icons.circleAlert,
  canceled: Icons.ban,
};

const StatusCard = ({ project, tasks }: StatusCardProps) => {
  const t = useTranslations("project");
  const format = useFormatter();

  const [isOpen, setIsOpen] = useState(true);

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

  const now = useNow({ updateInterval: isActive ? 1000 : undefined });

  const formatDistance = useCallback(
    (start: Date, end: Date) => {
      const duration = intervalToDuration({ start, end });

      return R.entries(duration).map(([key, value]) => {
        const unit = key.slice(0, -1);
        const label = format.number(value, { style: "unit", unit });

        return label.replace(" ", "");
      });
    },
    [format],
  );

  if (!data || data.length === 0) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  const task = data[0];
  const Icon = icon[task.status];

  return (
    <Alert variant={task.status === "failed" ? "destructive" : "default"}>
      <Icon className={cn(task.status === "running" && "animate-spin")} />
      <AlertTitle>
        {t(`alert.${task.status}.title`)}{" "}
        <span
          suppressHydrationWarning
          className="font-normal text-muted-foreground text-sm"
        >
          {isActive
            ? formatDistance(task.createdAt, now)
            : formatDistance(task.createdAt, task.updatedAt)}
        </span>
      </AlertTitle>
      <AlertDescription className="pr-8">
        <p>
          {t.rich(`alert.${task.status}.description`, {
            link: (children) => (
              <Link href="" className="underline underline-offset-4">
                {children}
              </Link>
            ),
          })}
        </p>
      </AlertDescription>
      <Icons.x
        className="absolute top-3 right-4 rounded-xs text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => setIsOpen(false)}
      />
    </Alert>
  );
};

export default StatusCard;
