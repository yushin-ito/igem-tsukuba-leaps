export interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "pending" | "error" | "success";
  preview?: string;
  url?: string;
  key?: string;
}
