import api from "./client"
import type {components} from "@/lib/api/schema";

type DashboardStats = components["schemas"]["DashboardStats"];
type MedicineInList = components["schemas"]["MedicineInList"];
type ExpiringBatchItem = components["schemas"]["ExpiringBatchItem"];

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const {data} = await api.get<DashboardStats>("/dashboard/stats")
    return data
}

export const getLowStockCount = async (threshold: number = 10): Promise<number> => {
    const response = await api.get<MedicineInList[]>("/dashboard/low-stock", {
        params: { threshold },
    });
    return response.data.length;
};

export const getExpiringSoonCount = async (days: number = 30): Promise<number> => {
    const response = await api.get<ExpiringBatchItem[]>("/dashboard/expiring-soon", {
        params: { days },
    });
    return response.data.length;
};