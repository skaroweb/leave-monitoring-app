import axios from "axios";

const serverURL = process.env.REACT_APP_SERVER_URL;

const api = axios.create({
    baseURL: serverURL,
});

export const authAPI = {
    login: (data) => api.post("/api/auth", data),
};

export const employeeAPI = {
    getAll: () => api.get("/api/employeeinfo/"),
    getById: (id) => api.get(`/api/employeeinfo/${id}`),
    create: (data, config) => api.post("/api/employeeinfo/", data, config),
    update: (id, data) => api.put(`/api/employeeinfo/update/${id}`, data),
    delete: (id) => api.delete(`/api/employeeinfo/delete/${id}`),
};

export const leaveAPI = {
    getAll: () => api.get("/api/leaves/getusers"),
    getById: (id) => api.get(`/api/leaves/getusers/${id}`),
    create: (data) => api.post("/api/leaves/createuser", data),
    update: (id, data) => api.put(`/api/leaves/update/${id}`, data),
    delete: (id) => api.delete(`/api/leaves/delete/${id}`),
};

export const extraWorkAPI = {
    getAll: () => api.get("/api/extrawork/all"),
    getBalances: () => api.get("/api/extrawork/balances"),
    create: (data) => api.post("/api/extrawork/create", data),
    update: (id, data) => api.put(`/api/extrawork/update/${id}`, data),
};
