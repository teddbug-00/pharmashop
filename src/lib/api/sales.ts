import api from "./client"
import type { components, paths } from "./schema"

type SaleInList = components["schemas"]["SaleInList"]
type SaleCreateWithPayment = components["schemas"]["SaleCreate"]
type SaleReceipt = components["schemas"]["SaleReceipt"]

export const getSales = async (
    skip: number = 0,
    limit: number = 100,
    required_token_type: "access" | "refresh" = "access",
): Promise<SaleInList[]> => {
    const response = await api.get<SaleInList[]>("/api/v1/sales/", {
        params: { skip, limit, required_token_type },
    })
    return response.data || []
}

export const getSale = async (saleId: number): Promise<SaleReceipt> => {
    const response = await api.get<SaleReceipt>(`/api/v1/sales/${saleId}`)
    return response.data
}

export const createSale = async (sale: SaleCreateWithPayment) => {
    const { data } = await api.post("/api/v1/sales/", sale)
    return data
}