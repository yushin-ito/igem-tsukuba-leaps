import { type ClassValue, clsx } from "clsx";
import Papa from "papaparse";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const parseDSV = (text: string) => {
  const { data, meta } = Papa.parse<string[]>(text, {
    delimitersToGuess: [",", ";", "\t", "|"],
  });
  const headers = data.length > 0 ? data[0] : [];
  const rows = data.length > 1 ? data.slice(1) : [];
  const delimiter = meta.delimiter;

  return { headers, rows, delimiter };
};

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  return response.json();
};
