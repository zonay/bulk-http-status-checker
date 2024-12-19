// src/types/index.ts

export interface UrlStatus {
  url: string;
  statusChain: string;
  urlChain: string;
  initialStatus: string;
  finalStatus: string;
  destinationUrl: string;
}

export interface StatusCheckResult {
  results: UrlStatus[];
  error?: string;
}