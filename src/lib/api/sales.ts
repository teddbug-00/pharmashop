import api from "./client"
import type { components } from "./schema"

type SaleInList = components["schemas"]["SaleInList"]
type SaleCreate = components["schemas"]["SaleCreate"]

export const getSales = async (
    skip: number = 0,
    limit: number = 100,
): Promise<SaleInList[]> => {
    const response = await api.get<SaleInList[]>("/sales/", {
        params: { skip, limit },
    })
    return response.data
}

export const createSale = async (sale: SaleCreate) => {
    const { data } = await api.post("/sales/", sale)
    return data
}