import api from "./client"
import type { components } from "./schema"

type DashboardStats = components["schemas"]["DashboardStats"]
type MedicineInList = components["schemas"]["MedicineInList"]
type ExpiringBatchItem = components["schemas"]["ExpiringSoonBatch"]

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/api/v1/dashboard/stats")
    return response.data
}

export const getLowStockReport = async (
    threshold: number = 10,
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/api/v1/dashboard/low-stock", {
        params: { threshold },
    })
    return response.data
}

export const getExpiringSoonReport = async (
    days: number = 30,
): Promise<ExpiringBatchItem[]> => {
    const response = await api.get<ExpiringBatchItem[]>(
        "/api/v1/dashboard/expiring-soon-batches",
        {
            params: { days },
        },
    )
    return response.data
}