export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company extends BaseModel {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionId?: string;
  settings: {
    theme?: 'light' | 'dark' | 'system';
    currency?: string;
    dateFormat?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface Property extends BaseModel {
  companyId: string;
  title: string;
  description: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  status: 'available' | 'pending' | 'sold' | 'rented' | 'inactive';
  price: number;
  area: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: string[];
  images: string[];
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  assignedTo?: string; // User ID
  clientId?: string;
}

export interface Client extends BaseModel {
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'tenant' | 'landlord';
  status: 'active' | 'inactive' | 'lead';
  preferences?: {
    propertyTypes: string[];
    priceRange: {
      min: number;
      max: number;
    };
    locations: string[];
  };
  assignedTo?: string; // User ID
  notes?: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface User extends BaseModel {
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  phone?: string;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
  lastLogin?: Date;
}

export interface Role extends BaseModel {
  name: string;
  description: string;
  permissions: string[];
}

export type Permission =
  | 'manage_users'
  | 'manage_roles'
  | 'manage_properties'
  | 'manage_clients'
  | 'manage_subscriptions'
  | 'view_analytics'
  | 'view_properties'
  | 'create_properties'
  | 'view_clients'
  | 'create_clients';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  userId: string;
  companyId: string;
  link?: string;
} 