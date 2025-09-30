import { siteConfig } from "@/config/site";
import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  CircleUserRound,
  Copy,
  Ellipsis,
  EllipsisVertical,
  EyeOff,
  Folder,
  Languages,
  Loader2,
  LogOut,
  type LucideProps,
  Moon,
  Pause,
  Pencil,
  Play,
  Plus,
  Scale,
  Search,
  Settings,
  Share,
  SquarePen,
  Sun,
  Trash,
} from "lucide-react";

const Icons = {
  alertCircle: AlertCircle,
  archive: Archive,
  arrowDown: ArrowDown,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  arrowUpDown: ArrowUpDown,
  check: Check,
  checkCircle: CheckCircle,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronsUpDown: ChevronsUpDown,
  circleHelp: CircleHelp,
  circleUserRound: CircleUserRound,
  copy: Copy,
  ellipsis: Ellipsis,
  ellipsisVertical: EllipsisVertical,
  eyeOff: EyeOff,
  folder: Folder,
  languages: Languages,
  logOut: LogOut,
  moon: Moon,
  pause: Pause,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  scale: Scale,
  search: Search,
  settings: Settings,
  share: Share,
  spinner: Loader2,
  squarePen: SquarePen,
  sun: Sun,
  trash: Trash,
  logo: (props: LucideProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>{siteConfig.name}</title>
      <path d="m10 16 1.5 1.5" />
      <path d="m14 8-1.5-1.5" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m16.5 10.5 1 1" />
      <path d="m17 6-2.891-2.891" />
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="m20 9 .891.891" />
      <path d="M3.109 14.109 4 15" />
      <path d="m6.5 12.5 1 1" />
      <path d="m7 18 2.891 2.891" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    </svg>
  ),
  github: (props: LucideProps) => (
    <svg viewBox="0 0 24 24" {...props}>
      {/* #181717 */}
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
};

export default Icons;
