import api from "./client"
import type { components } from "./schema"

type MedicineInList = components["schemas"]["MedicineInList"]
type MedicineCreate = components["schemas"]["MedicineCreate"]
type MedicineUpdate = components["schemas"]["MedicineUpdate"]
type MedicineBatchCreate = components["schemas"]["MedicineBatchCreate"]
type MedicinePublic = components["schemas"]["MedicinePublic"]

export const getMedicines = async (
    skip: number = 0,
    limit: number = 100, // Fetch more for client-side pagination/filtering
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/api/v1/medicines/", {
        params: { skip, limit },
    })
    return response.data
}

export const addMedicine = async (
    medicine: MedicineCreate,
): Promise<MedicinePublic> => {
    const response = await api.post<MedicinePublic>("/api/v1/medicines/", medicine)
    return response.data
}

export const updateMedicine = async ({
    medicineId,
    medicine,
}: {
    medicineId: number
    medicine: MedicineUpdate
}): Promise<MedicinePublic> => {
    const response = await api.put<MedicinePublic>(
        `/api/v1/medicines/${medicineId}`,
        medicine,
    )
    return response.data
}

export const deleteMedicine = async (medicineId: number): Promise<void> => {
    await api.delete(`/api/v1/medicines/${medicineId}`)
}

export const addBatch = async ({
    medicineId,
    batch,
}: {
    medicineId: number
    batch: MedicineBatchCreate
}): Promise<MedicinePublic> => {
    const response = await api.post<MedicinePublic>(
        `/api/v1/medicines/${medicineId}/batches`,
        batch,
    )
    return response.data
}