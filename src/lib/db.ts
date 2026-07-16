import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc, query, where, writeBatch } from "firebase/firestore";
import localforage from "localforage";

export interface TaskData {
  id: string; // The ORDER number will be the ID
  witel: string;
  order: string;
  statusResume: string;
  customerName: string;
  address: string;
  serviceType: string;
  segmen?: string;
  paket?: string;
  technicianName: string;
  trackerStatus: 'Pending' | 'On Progress' | 'Completed' | 'Kendala' | 'Cancel';
  notes: string;
  internet: string;
  statusMessage: string;
  sto: string;
  orderDate: string;
  updatedAt: string;
}

const COLLECTION_NAME = "ebis_tasks";

function isLocalMode() {
  return !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "dummy-api-key";
}

export async function importDataToFirestore(dataList: any[]): Promise<{ added: number, duplicates: number }> {
  let added = 0;
  let duplicates = 0;

  if (isLocalMode()) {
    console.log("Running in Local Storage Mode");
    const existing = await localforage.getItem<Record<string, TaskData>>(COLLECTION_NAME) || {};
    dataList.forEach(item => {
      const orderId = String(item['ORDER'] || `UNKNOWN-${Math.random()}`);
      if (!existing[orderId]) {
        existing[orderId] = {
          id: orderId,
          witel: item['WITEL_OLD'] || 'UNKNOWN',
          order: orderId,
          statusResume: item['STATUS RESUME'] || '',
          customerName: item['NAMA CUST'] || '',
          address: item['ALAMAT'] || '',
          serviceType: item['JENIS LAYANAN'] || '',
          segmen: item['SEGMEN'] || '',
          paket: item['GROUP PAKET'] || item['PAKET'] || '',
          technicianName: '',
          trackerStatus: 'Pending',
          notes: '',
          internet: item['INTERNET'] || '',
          statusMessage: item['STATUS MESSAGE'] || '',
          sto: item['STO'] || '',
          orderDate: item['LAST UPDATE STATUS'] || item['ORDER DATE'] || item['TGL ORDER'] || '',
          updatedAt: new Date().toISOString()
        };
        added++;
      } else {
        // Update existing record to catch any newly mapped fields without wiping trackerStatus/technicianName
        const old = existing[orderId];
        existing[orderId] = {
          ...old,
          witel: item['WITEL_OLD'] || old.witel,
          statusResume: item['STATUS RESUME'] || old.statusResume,
          customerName: item['NAMA CUST'] || old.customerName,
          address: item['ALAMAT'] || old.address,
          serviceType: item['JENIS LAYANAN'] || old.serviceType,
          segmen: item['SEGMEN'] || old.segmen || '',
          paket: item['GROUP PAKET'] || item['PAKET'] || old.paket || '',
          internet: item['INTERNET'] || old.internet,
          statusMessage: item['STATUS MESSAGE'] || old.statusMessage,
          sto: item['STO'] || old.sto,
          orderDate: item['LAST UPDATE STATUS'] || item['ORDER DATE'] || item['TGL ORDER'] || old.orderDate,
          updatedAt: new Date().toISOString()
        };
        duplicates++;
      }
    });
    await localforage.setItem(COLLECTION_NAME, existing);
    return { added, duplicates };
  }
  
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const existingIds = new Set<string>();
  querySnapshot.forEach(d => existingIds.add(d.id));

  const batch = writeBatch(db);
  
  dataList.forEach(item => {
    const orderId = String(item['ORDER'] || `UNKNOWN-${Math.random()}`);
    if (existingIds.has(orderId)) {
      duplicates++;
      const docRef = doc(db, COLLECTION_NAME, orderId);
      // Only merge safe fields to not wipe out technician status/notes
      batch.set(docRef, {
        witel: item['WITEL_OLD'] || 'UNKNOWN',
        statusResume: item['STATUS RESUME'] || '',
        customerName: item['NAMA CUST'] || '',
        address: item['ALAMAT'] || '',
        serviceType: item['JENIS LAYANAN'] || '',
        segmen: item['SEGMEN'] || '',
        paket: item['GROUP PAKET'] || item['PAKET'] || '',
        internet: item['INTERNET'] || '',
        statusMessage: item['STATUS MESSAGE'] || '',
        sto: item['STO'] || '',
        orderDate: item['LAST UPDATE STATUS'] || item['ORDER DATE'] || item['TGL ORDER'] || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else {
      added++;
      existingIds.add(orderId); // avoid counting duplicates within the same json
      
      const docRef = doc(db, COLLECTION_NAME, orderId);
      const task: TaskData = {
        id: orderId,
        witel: item['WITEL_OLD'] || 'UNKNOWN',
        order: orderId,
        statusResume: item['STATUS RESUME'] || '',
        customerName: item['NAMA CUST'] || '',
        address: item['ALAMAT'] || '',
        serviceType: item['JENIS LAYANAN'] || '',
        segmen: item['SEGMEN'] || '',
        paket: item['GROUP PAKET'] || item['PAKET'] || '',
        technicianName: '', 
        trackerStatus: 'Pending',
        notes: '',
        internet: item['INTERNET'] || '',
        statusMessage: item['STATUS MESSAGE'] || '',
        sto: item['STO'] || '',
        orderDate: item['LAST UPDATE STATUS'] || item['ORDER DATE'] || item['TGL ORDER'] || '',
        updatedAt: new Date().toISOString()
      };
      
      batch.set(docRef, task);
    }
  });

  if (added > 0) {
    await batch.commit();
  }
  
  return { added, duplicates };
}

export async function getTasksByWitel(witel: string): Promise<TaskData[]> {
  if (isLocalMode()) {
    const all = await localforage.getItem<Record<string, TaskData>>(COLLECTION_NAME) || {};
    return Object.values(all).filter(t => t.witel === witel);
  }

  const q = query(collection(db, COLLECTION_NAME), where("witel", "==", witel));
  const querySnapshot = await getDocs(q);
  const tasks: TaskData[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push(doc.data() as TaskData);
  });
  return tasks;
}

export async function getAllTasks(): Promise<TaskData[]> {
  if (isLocalMode()) {
    const all = await localforage.getItem<Record<string, TaskData>>(COLLECTION_NAME) || {};
    return Object.values(all);
  }

  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const tasks: TaskData[] = [];
  querySnapshot.forEach((doc) => {
    tasks.push(doc.data() as TaskData);
  });
  return tasks;
}

export async function updateTaskStatus(id: string, updates: Partial<TaskData>) {
  if (isLocalMode()) {
    const all = await localforage.getItem<Record<string, TaskData>>(COLLECTION_NAME) || {};
    if (all[id]) {
      all[id] = { ...all[id], ...updates, updatedAt: new Date().toISOString() };
      await localforage.setItem(COLLECTION_NAME, all);
    }
    return;
  }

  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}
