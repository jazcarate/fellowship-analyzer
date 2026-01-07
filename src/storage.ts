const DB_NAME = 'fellowship_analyzer';
const DB_VERSION = 2;
const STORE_NAME = 'logs';
const METADATA_STORE_NAME = 'log_metadata';

interface LogMetadata {
  filename: string;
  uploadedAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create logs store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }

      // Create metadata store if it doesn't exist
      if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
        db.createObjectStore(METADATA_STORE_NAME);
      }
    };
  });
}

export async function storeLogFile(filename: string, text: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, METADATA_STORE_NAME], 'readwrite');

    // Store the log text
    const logsStore = transaction.objectStore(STORE_NAME);
    logsStore.put(text, filename);

    // Store metadata
    const metadataStore = transaction.objectStore(METADATA_STORE_NAME);
    const metadata: LogMetadata = {
      filename,
      uploadedAt: Date.now()
    };
    metadataStore.put(metadata, filename);

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

export async function getLogFile(filename: string): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(filename);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getAllLogFilenames(): Promise<string[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([METADATA_STORE_NAME], 'readonly');
    const store = transaction.objectStore(METADATA_STORE_NAME);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as string[]);
  });
}

export async function deleteLogFile(filename: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, METADATA_STORE_NAME], 'readwrite');

    const logsStore = transaction.objectStore(STORE_NAME);
    logsStore.delete(filename);

    const metadataStore = transaction.objectStore(METADATA_STORE_NAME);
    metadataStore.delete(filename);

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

export async function clearAllLogs(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, METADATA_STORE_NAME], 'readwrite');

    const logsStore = transaction.objectStore(STORE_NAME);
    logsStore.clear();

    const metadataStore = transaction.objectStore(METADATA_STORE_NAME);
    metadataStore.clear();

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}
