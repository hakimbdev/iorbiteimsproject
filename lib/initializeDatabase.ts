import { db } from './firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features',
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_properties',
      'manage_clients',
      'manage_subscriptions',
      'view_analytics'
    ]
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage properties and clients',
    permissions: [
      'manage_properties',
      'manage_clients',
      'view_analytics'
    ]
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Can view and create properties and clients',
    permissions: [
      'view_properties',
      'create_properties',
      'view_clients',
      'create_clients'
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can only view properties and clients',
    permissions: [
      'view_properties',
      'view_clients'
    ]
  }
];

export async function initializeDatabase() {
  try {
    // Check if roles already exist
    const rolesCollection = collection(db, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);
    
    if (rolesSnapshot.empty) {
      console.log('Initializing database with default roles...');
      
      // Create default roles
      for (const role of DEFAULT_ROLES) {
        await setDoc(doc(rolesCollection, role.id), {
          ...role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Database initialized successfully');
    } else {
      console.log('Database already initialized');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 