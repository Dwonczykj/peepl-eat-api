import { User } from 'firebase/auth';

export default interface UserModel {
    email: string;
    name: string;
    isSuperAdmin: boolean;
    role: 'owner' | 'staff' | 'courier';
    vendor?: any;
    vendorRole: 'owner' | 'inventoryManager' | 'salesManager' | 'courier' | 'none';
    firebaseUser?: User;
}
