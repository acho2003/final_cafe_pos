import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../../services/apiService';
import { Cafe, User, UserRole } from '../../types';
import { Modal, ConfirmationModal } from '../../components/ui/Modal';
import { PlusCircle, Edit, Trash2 } from '../../components/Icons';

// --- Cafe Management Component ---
const CafeManagement: React.FC = () => {
    const [cafes, setCafes] = useState<Cafe[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCafe, setCurrentCafe] = useState<Partial<Cafe> | null>(null);
    const [cafeToDelete, setCafeToDelete] = useState<Cafe | null>(null);

    const fetchData = useCallback(async () => {
        const [cafesData, usersData] = await Promise.all([apiService.getCafes(), apiService.getUsers()]);
        setCafes(cafesData);
        setUsers(usersData);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const availableAdmins = useMemo(() => {
        return users.filter(u => u.role === UserRole.CAFE_ADMIN && !u.cafeId);
    }, [users]);
    
    const handleOpenModal = (cafe?: Cafe) => {
        setCurrentCafe(cafe || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCafe(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCafe) return;

        const originalCafe = currentCafe.id ? cafes.find(c => c.id === currentCafe.id) : undefined;
        const oldAdminId = originalCafe?.adminId;
        const newAdminId = currentCafe.adminId;
        
        const cafePayload: Partial<Cafe> = { 
            name: currentCafe.name, 
            location: currentCafe.location, 
            adminId: newAdminId || undefined 
        };

        let savedCafe: Cafe;
        if (currentCafe.id) {
            savedCafe = await apiService.updateCafe(currentCafe.id, cafePayload);
        } else {
            savedCafe = await apiService.createCafe(cafePayload as Omit<Cafe, 'id'>);
        }
        
        // Handle admin assignment changes
        if (oldAdminId !== newAdminId) {
            // Unassign old admin if there was one
            if (oldAdminId) {
                await apiService.updateUser(oldAdminId, { cafeId: undefined });
            }
            // Assign new admin if one is selected
            if (newAdminId) {
                await apiService.updateUser(newAdminId, { cafeId: savedCafe.id });
            }
        }
        
        fetchData();
        handleCloseModal();
    };

    const handleDeleteConfirm = async () => {
        if (!cafeToDelete) return;
        await apiService.deleteCafe(cafeToDelete.id);
        fetchData();
        setCafeToDelete(null);
    };
    
    const getAdminName = (adminId?: string) => users.find(u => u.id === adminId)?.name || 'N/A';
    
    return (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Cafe Management</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Cafe
                </button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3">Admin</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cafes.map(cafe => (
                            <tr key={cafe.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{cafe.name}</td>
                                <td className="px-6 py-4">{cafe.location}</td>
                                <td className="px-6 py-4">{getAdminName(cafe.adminId)}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenModal(cafe)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => setCafeToDelete(cafe)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentCafe?.id ? 'Edit Cafe' : 'Add Cafe'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Name" required value={currentCafe?.name || ''} onChange={e => setCurrentCafe({...currentCafe, name: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="Location" required value={currentCafe?.location || ''} onChange={e => setCurrentCafe({...currentCafe, location: e.target.value})} className="w-full p-2 border rounded"/>
                    <div>
                        <label className="block text-sm font-medium">Assign Admin</label>
                        <select
                            value={currentCafe?.adminId || ''}
                            onChange={e => setCurrentCafe({...currentCafe, adminId: e.target.value})}
                            className="mt-1 block w-full p-2 border rounded"
                        >
                            <option value="">None</option>
                            {currentCafe?.adminId && <option value={currentCafe.adminId}>{getAdminName(currentCafe.adminId)}</option>}
                            {availableAdmins.map(admin => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                    </div>
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={!!cafeToDelete}
                onClose={() => setCafeToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Cafe"
            >
                <p>Are you sure you want to delete the cafe <strong>"{cafeToDelete?.name}"</strong>?</p>
                <div className="mt-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <strong>Warning:</strong> This will also permanently remove all its menu items, orders, and unlink any associated staff.
                </div>
                <p className="mt-2 text-sm text-red-700">This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

// --- User Management Component ---
const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
        const usersData = await apiService.getUsers();
        setUsers(usersData);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user?: User) => {
        setCurrentUser(user || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        if (!currentUser.name || !currentUser.email || !currentUser.role) {
            alert("Please fill in all required fields.");
            return;
        }

        const payload: Partial<User> = { ...currentUser };

        if (currentUser.id) {
            await apiService.updateUser(currentUser.id, payload);
        } else {
            if (!payload.password) {
                alert("Password is required for a new user.");
                return;
            }
            await apiService.createUser(payload as Omit<User, 'id'>);
        }

        fetchUsers();
        handleCloseModal();
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        await apiService.deleteUser(userToDelete.id);
        fetchUsers();
        setUserToDelete(null);
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add User
                </button>
            </div>
             <div className="bg-white shadow rounded-lg overflow-x-auto">
                 <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Cafe ID</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role.replace('_', ' ')}</td>
                                <td className="px-6 py-4">{user.cafeId || 'N/A'}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => setUserToDelete(user)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentUser?.id ? 'Edit User' : 'Add User'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Name" required value={currentUser?.name || ''} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="email" placeholder="Email" required value={currentUser?.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="password" placeholder={currentUser?.id ? "New Password (optional)" : "Password"} required={!currentUser?.id} value={currentUser?.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} className="w-full p-2 border rounded"/>
                    <select required value={currentUser?.role || ''} onChange={e => setCurrentUser({...currentUser, role: e.target.value as UserRole})} className="w-full p-2 border rounded">
                        <option value="" disabled>Select a role</option>
                        {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                        ))}
                    </select>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                    </div>
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete User"
            >
                <p>Are you sure you want to delete the user <strong>"{userToDelete?.name}"</strong>?</p>
                <p className="mt-2 text-sm text-red-700">This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};


// --- Main Panel ---
const SuperAdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('cafes');
    
    const tabs = [
        { id: 'cafes', label: 'Cafes' },
        { id: 'users', label: 'Users' }
    ];
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Super Admin Panel</h1>
            <p className="mt-1 text-slate-600">Platform-wide management controls.</p>
            
             <div className="mt-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                           className={`${activeTab === tab.id
                               ? 'border-indigo-500 text-indigo-600'
                               : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                           } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-8">
                {activeTab === 'cafes' && <CafeManagement />}
                {activeTab === 'users' && <UserManagement />}
            </div>
        </div>
    );
};

export default SuperAdminPanel;