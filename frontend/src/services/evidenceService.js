import api from "./api";

const API = "/evidences";

export async function getEvidences() {
    const { data } = await api.get(API);
    return data;
}

export async function getEvidence(id) {
    const { data } = await api.get(`${API}/${id}`);
    return data;
}

export async function verifyIntegrity(id) {
    const { data } = await api.get(`${API}/verify/${id}`);
    return data;
}