import api from "./client"
import type { components } from "./schema"

type DashboardStats = components["schemas"]["DashboardStats"]
type MedicineInList = components["schemas"]["MedicineInList"]
type ExpiringBatchItem = components["schemas"]["ExpiringBatchItem"]
interface DashboardStats {
    // This field is missing in the openapi.json but is needed for the UI
    expiring_soon_items_count?: number
}
export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/dashboard/stats")
    return response.data
}

export const getLowStockReport = async (
    threshold: number = 10,
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/dashboard/low-stock", {
        params: { threshold },
    })
    return response.data
}

export const getExpiringSoonReport = async (
    days: number = 30,
): Promise<ExpiringBatchItem[]> => {
    const response = await api.get<ExpiringBatchItem[]>(
        "/dashboard/expiring-soon",
        {
            params: { days },
        },
    )
    return response.data
}