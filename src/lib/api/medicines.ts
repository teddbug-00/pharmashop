import api from "./client"
import type { components } from "./schema"

type MedicineInList = components["schemas"]["MedicineInList"]
type MedicineCreate = components["schemas"]["MedicineCreate"]
type MedicinePublic = components["schemas"]["MedicinePublic"]

export const getMedicines = async (
    skip: number = 0,
    limit: number = 100, // Fetch more for client-side pagination/filtering
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/medicines/", {
        params: { skip, limit },
    })
    return response.data
}

export const addMedicine = async (
    medicine: MedicineCreate,
): Promise<MedicinePublic> => {
    const response = await api.post<MedicinePublic>("/medicines/", medicine)
    return response.data
}