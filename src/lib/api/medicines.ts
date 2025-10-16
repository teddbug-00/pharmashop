import api from "./client"
import type { components } from "./schema"

type MedicineInList = components["schemas"]["MedicineInList"]
type MedicineCreate = components["schemas"]["MedicineCreate"]
type MedicineUpdate = components["schemas"]["MedicineUpdate"]
type MedicineBatchCreate = components["schemas"]["MedicineBatchCreate"]
type MedicinePublic = components["schemas"]["MedicinePublic"]
type MedicineQuote = components["schemas"]["MedicineQuote"]

export const getMedicines = async (
    skip: number = 0,
    limit: number = 100,
): Promise<MedicineInList[]> => {
    const response = await api.get<MedicineInList[]>("/api/v1/medicines/", {
        params: { skip, limit },
    })
    return response.data
}

export const getMedicineQuote = async ({
    medicineId,
    quantity,
}: {
    medicineId: number
    quantity: number
}): Promise<MedicineQuote> => {
    const response = await api.get<MedicineQuote>(
        `/api/v1/medicines/${medicineId}/quote`,
        {
            params: { quantity },
        },
    )
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

export const importMedicinesCSV = async (file: File): Promise<void> => {
    console.log("importMedicinesCSV: Function called with file:", file);
    const formData = new FormData()
    formData.append("file", file)

    try {
        const response = await api.post("/api/v1/medicines/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        console.log("importMedicinesCSV: API call successful, response:", response.data);
    } catch (error) {
        console.error("importMedicinesCSV: API call failed, error:", error);
        throw error; // Re-throw to be caught by useMutation's onError
    }
}

export const deleteMultipleMedicines = async (medicineIds: number[]): Promise<void> => {
    await api.post("/api/v1/medicines/bulk-delete", { medicine_ids: medicineIds })
}
