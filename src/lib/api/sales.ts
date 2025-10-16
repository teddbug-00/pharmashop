import api from "./client"
import type { components, paths } from "./schema"

type SaleInList = components["schemas"]["SaleInList"]
// This type will need to be updated in your schema.d.ts when the backend changes
type SaleCreateWithPayment = components["schemas"]["SaleCreate"]

export const getSales = async (
    skip: number = 0,
    limit: number = 100,
): Promise<SaleInList[]> => {
    const response = await api.get<SaleInList[]>("/api/v1/sales/", {
        params: { skip, limit },
    })
    return response.data
}

export const createSale = async (sale: SaleCreateWithPayment) => {
    const { data } = await api.post("/api/v1/sales/", sale)
    return data
}