import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp,
  DocumentData,
  setDoc
} from "firebase/firestore"
import type { Company, Property, Client, User } from "@/types"

const firebaseConfig = {
  apiKey: "AIzaSyD0aiQvnSrW6HFc8qyV9krdK_5SaUXxCzY",
  authDomain: "iorbit-emis.firebaseapp.com",
  projectId: "iorbit-emis",
  storageBucket: "iorbit-emis.appspot.com",
  messagingSenderId: "1047727554040",
  appId: "1:1047727554040:web:fe7293f5d6bbfd8b432a0d",
  measurementId: "G-P73RK5BGNL"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Helper function to convert Firestore document to typed object
const convertDocToType = <T extends DocumentData>(doc: any): T => {
  const data = doc.data()
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as T
}

// Company Operations
export const createCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Check if company with same name exists
    const companiesRef = collection(db, "companies")
    const q = query(companiesRef, where("name", "==", companyData.name))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      throw new Error("A company with this name already exists")
    }

    // Create the company document
    const docRef = await addDoc(companiesRef, {
      ...companyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    // Create a free trial subscription
    const subscriptionRef = doc(db, "subscriptions", docRef.id)
    await setDoc(subscriptionRef, {
      companyId: docRef.id,
      status: "active",
      plan: "trial",
      startDate: Timestamp.now(),
      endDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return { 
      id: docRef.id, 
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company
  } catch (error) {
    console.error("Error creating company:", error)
    throw error
  }
}

export const getCompany = async (id: string): Promise<Company | null> => {
  try {
    const docRef = doc(db, "companies", id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? convertDocToType<Company>(docSnap) : null
  } catch (error) {
    console.error("Error getting company:", error)
    throw error
  }
}

export const updateCompany = async (id: string, companyData: Partial<Company>) => {
  try {
    const docRef = doc(db, "companies", id)
    await updateDoc(docRef, {
      ...companyData,
      updatedAt: Timestamp.now(),
    })
    return { id, ...companyData } as Company
  } catch (error) {
    console.error("Error updating company:", error)
    throw error
  }
}

// Property Operations
export const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "properties"), {
      ...propertyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return { id: docRef.id, ...propertyData } as Property
  } catch (error) {
    console.error("Error creating property:", error)
    throw error
  }
}

export const getProperties = async (companyId: string): Promise<Property[]> => {
  try {
    const q = query(collection(db, "properties"), where("companyId", "==", companyId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => convertDocToType<Property>(doc))
  } catch (error) {
    console.error("Error getting properties:", error)
    throw error
  }
}

export const updateProperty = async (id: string, propertyData: Partial<Property>) => {
  try {
    const docRef = doc(db, "properties", id)
    await updateDoc(docRef, {
      ...propertyData,
      updatedAt: Timestamp.now(),
    })
    return { id, ...propertyData } as Property
  } catch (error) {
    console.error("Error updating property:", error)
    throw error
  }
}

export const deleteProperty = async (id: string) => {
  try {
    const docRef = doc(db, "properties", id)
    await deleteDoc(docRef)
    return id
  } catch (error) {
    console.error("Error deleting property:", error)
    throw error
  }
}

// Client Operations
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "clients"), {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return { id: docRef.id, ...clientData } as Client
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

export const getClients = async (companyId: string): Promise<Client[]> => {
  try {
    const q = query(collection(db, "clients"), where("companyId", "==", companyId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => convertDocToType<Client>(doc))
  } catch (error) {
    console.error("Error getting clients:", error)
    throw error
  }
}

export const updateClient = async (id: string, clientData: Partial<Client>) => {
  try {
    const docRef = doc(db, "clients", id)
    await updateDoc(docRef, {
      ...clientData,
      updatedAt: Timestamp.now(),
    })
    return { id, ...clientData }
  } catch (error) {
    console.error("Error updating client:", error)
    throw error
  }
}

export const deleteClient = async (id: string) => {
  try {
    const docRef = doc(db, "clients", id)
    await deleteDoc(docRef)
    return id
  } catch (error) {
    console.error("Error deleting client:", error)
    throw error
  }
}

// User Operations
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return { id: docRef.id, ...userData }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const getUsers = async (companyId: string) => {
  try {
    const q = query(collection(db, "users"), where("companyId", "==", companyId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting users:", error)
    throw error
  }
}

export const updateUser = async (id: string, userData: Partial<User>) => {
  try {
    const docRef = doc(db, "users", id)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    })
    return { id, ...userData }
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export const deleteUser = async (id: string) => {
  try {
    const docRef = doc(db, "users", id)
    await deleteDoc(docRef)
    return id
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export { app, db, auth, storage }

