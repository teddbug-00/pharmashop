import api from "./client"
import type {components} from "@/lib/api/schema";

type DashboardStats = components["schemas"]["DashboardStats"]

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const {data} = await api.get<DashboardStats>("/dashboard/stats")
    return data
}