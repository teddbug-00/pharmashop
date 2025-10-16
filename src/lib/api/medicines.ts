import api from "./client"
import type { components } from "./schema"

type MedicineInList = components["schemas"]["MedicineInList"]
type MedicinePublic = components["schemas"]["MedicinePublic"]
type MedicineCreate = components["schemas"]["MedicineCreate"]
type MedicineUpdate = components["schemas"]["MedicineUpdate"]
type MedicineQuote = components["schemas"]["MedicineQuote"]

export const getMedicines = async (
    skip: number = 0,
    limit: number = 100,
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/api/v1/medicines/", {
        params: { skip, limit },
    })
    return response.data || []
}

export const getMedicine = async (id: number): Promise<MedicinePublic> => {
    const response = await api.get<MedicinePublic>(`/api/v1/medicines/${id}`)
    return response.data
}

export const addMedicine = async (medicine: MedicineCreate): Promise<MedicinePublic> => {
    const response = await api.post<MedicinePublic>("/api/v1/medicines/", medicine)
    return response.data
}

export const updateMedicine = async (id: number, medicine: MedicineUpdate): Promise<MedicinePublic> => {
    const response = await api.put<MedicinePublic>(
        `/api/v1/medicines/${id}`,
        medicine,
    )
    return response.data
}

export const deleteMedicine = async (id: number) => {
    await api.delete(`/api/v1/medicines/${id}`)
}

export const getMedicineQuote = async (id: number, quantity: number): Promise<MedicineQuote> => {
    const response = await api.get<MedicineQuote>(
        `/api/v1/medicines/${id}/quote`,
        {
            params: { quantity },
        },
    )
    return response.data
}
