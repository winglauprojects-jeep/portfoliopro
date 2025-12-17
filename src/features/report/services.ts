// src/features/report/services.ts

import { FirestoreReportAdapter } from "@/lib/firebase/report.adapter";

// Initialize the service specifically for this feature
export const reportsService = new FirestoreReportAdapter();
