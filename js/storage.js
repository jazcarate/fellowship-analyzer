const DB_NAME = 'fellowship_analyzer';
const DB_VERSION = 1;
const STORE_NAME = 'logs';

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (_event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

/**
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function storeLogText(text) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(text, 'current_log');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * @returns {Promise<string|null>}
 */
export async function getLogText() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('current_log');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
    });
}

/**
 * @returns {Promise<void>}
 */
export async function clearLogText() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete('current_log');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
