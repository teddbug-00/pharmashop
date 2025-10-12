import api from "./client"
import type { components } from "./schema"

type SaleInList = components["schemas"]["SaleInList"]

export const getSales = async (
    skip: number = 0,
    limit: number = 100,
): Promise<SaleInList[]> => {
    const response = await api.get<SaleInList[]>("/sales/", {
        params: { skip, limit },
    })
    return response.data
}