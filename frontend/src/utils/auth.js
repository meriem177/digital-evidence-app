const STORAGE_KEY = "dems_auth";

function readStorage() {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
}

function writeStorage(value, remember) {
    const payload = JSON.stringify(value);
    if (remember) {
        localStorage.setItem(STORAGE_KEY, payload);
    } else {
        sessionStorage.setItem(STORAGE_KEY, payload);
    }
}

export function setSession(token, user, remember = true) {
    writeStorage({ token, user }, remember);
}

export function getToken() {
    const data = readStorage();
    return data?.token || null;
}

export function getUser() {
    const data = readStorage();
    return data?.user || null;
}

export function isAuthenticated() {
    return Boolean(getToken());
}

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
}
