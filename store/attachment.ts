import type { FileInfo } from "@/types";
import { create } from "zustand";

type AttachmentStore = {
  files: FileInfo[];
  add: (file: FileInfo) => void;
  update: (id: string, file: FileInfo) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  files: [],
  add: (file) => {
    const files = get().files;
    const index = files.findIndex((item) => item.id === file.id);
    if (index === -1) {
      set((state) => ({
        files: [...state.files, file],
      }));
    }
  },
  update: (id, file) => {
    const files = get().files.map((item) => (item.id === id ? file : item));
    set(() => ({ files }));
  },
  remove: (id) => {
    const files = get().files.filter((item) => item.id !== id);
    set(() => ({ files }));
  },
  clear: () => {
    const files = get().files;
    for (const file of files) {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    }
    set(() => ({ files: [] }));
  },
}));
