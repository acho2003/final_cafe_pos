import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import { MenuItem, User, UserRole, Order, OrderStatus, Cafe } from '../../types';
import { Modal, ConfirmationModal } from '../../components/ui/Modal';
import { PlusCircle, Edit, Trash2, QrCode, Download, ClipboardList, Menu, Users, DollarSign } from '../../components/Icons';
import ManagerDashboard from '../manager/ManagerDashboard';
import imageCompression from 'browser-image-compression';

// --- Menu Management ---
const MenuManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
    const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const fetchMenuItems = useCallback(async () => {
        if (!currentUser?.cafeId) return;
        const items = await apiService.getMenuItems(currentUser.cafeId);
        setMenuItems(items);
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        setCategories(uniqueCategories);
    }, [currentUser]);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);

    const handleOpenModal = (item?: MenuItem) => {
        setCurrentItem(item || { cafeId: currentUser?.cafeId });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
        setImageFile(null);
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };
            try {
                const compressedFile = await imageCompression(file, options);
                setImageFile(compressedFile);
            } catch (error) {
                console.error('Error compressing image:', error);
                alert("Failed to compress image. Please try another file.");
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentItem || !currentUser?.cafeId) return;

        setIsSubmitting(true);

        let imageUrl = currentItem.imageUrl || '';

        try {
            // If a new image file was selected, upload it
            if (imageFile) {
                imageUrl = await apiService.uploadImage(imageFile);
            }

            const payload = { ...currentItem, cafeId: currentUser.cafeId, imageUrl };

            // Check if we are updating an existing item or creating a new one
            if (currentItem.id) {
                await apiService.updateMenuItem(currentItem.id, payload);
            } else {
                await apiService.createMenuItem(payload as Omit<MenuItem, 'id'>);
            }

            fetchMenuItems(); // Refresh the list
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save menu item:", error);
            alert("Could not save the menu item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        await apiService.deleteMenuItem(itemToDelete.id);
        fetchMenuItems();
        setItemToDelete(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Menu Management</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Menu Item
                </button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map(item => (
                            <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4">{item.category}</td>
                                <td className="px-6 py-4">Nu.{item.price.toFixed(2)}</td>
                                <td className="px-6 py-4">{item.description}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => setItemToDelete(item)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Name" required value={currentItem?.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="Description" required value={currentItem?.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="number" placeholder="Price" required step="0.01" value={currentItem?.price || ''} onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value)})} className="w-full p-2 border rounded"/>
                    <input type="text" placeholder="Category (e.g., Coffee, Pastries)" list="categories" required value={currentItem?.category || ''} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} className="w-full p-2 border rounded"/>
                    <datalist id="categories">
                        {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                         {currentItem?.imageUrl && !imageFile && <img src={currentItem.imageUrl} alt="Current menu item" className="w-20 h-20 mt-2 object-cover rounded"/>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Menu Item"
            >
                Are you sure you want to delete <strong>"{itemToDelete?.name}"</strong>? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

// --- Manager Management ---
const ManagerManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const [managers, setManagers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentManager, setCurrentManager] = useState<Partial<User> | null>(null);
    const [managerToDelete, setManagerToDelete] = useState<User | null>(null);

    const fetchManagers = useCallback(async () => {
        if (!currentUser?.cafeId) return;
        const allUsers = await apiService.getUsers();
        const cafeManagers = allUsers.filter(user => user.cafeId === currentUser.cafeId && user.role === UserRole.MANAGER);
        setManagers(cafeManagers);
    }, [currentUser]);

    useEffect(() => {
        fetchManagers();
    }, [fetchManagers]);

    const handleOpenModal = (manager?: User) => {
        setCurrentManager(manager || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentManager(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentManager || !currentUser?.cafeId) return;

        const payload: Partial<User> = {
            ...currentManager,
            cafeId: currentUser.cafeId,
            role: UserRole.MANAGER,
        };

        if (currentManager.id) {
            await apiService.updateUser(currentManager.id, payload);
        } else {
            if (!payload.password) {
                alert("Password is required for a new manager.");
                return;
            }
            await apiService.createUser(payload as Omit<User, 'id'>);
        }
        fetchManagers();
        handleCloseModal();
    };

    const handleDeleteConfirm = async () => {
        if (!managerToDelete) return;
        await apiService.deleteUser(managerToDelete.id);
        fetchManagers();
        setManagerToDelete(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manager Management</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Manager
                </button>
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.map(manager => (
                            <tr key={manager.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{manager.name}</td>
                                <td className="px-6 py-4">{manager.email}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleOpenModal(manager)} className="text-blue-600 hover:text-blue-800"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => setManagerToDelete(manager)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentManager?.id ? 'Edit Manager' : 'Add Manager'}>
                <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" placeholder="Name" required value={currentManager?.name || ''} onChange={e => setCurrentManager({...currentManager, name: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="email" placeholder="Email" required value={currentManager?.email || ''} onChange={e => setCurrentManager({...currentManager, email: e.target.value})} className="w-full p-2 border rounded"/>
                    <input type="password" placeholder={currentManager?.id ? "New Password (optional)" : "Password"} required={!currentManager?.id} value={currentManager?.password || ''} onChange={e => setCurrentManager({...currentManager, password: e.target.value})} className="w-full p-2 border rounded"/>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                    </div>
                </form>
            </Modal>
             <ConfirmationModal
                isOpen={!!managerToDelete}
                onClose={() => setManagerToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Manager"
            >
                Are you sure you want to delete the manager <strong>"{managerToDelete?.name}"</strong>? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

// --- QR Code Generator ---
const QrCodeGenerator: React.FC = () => {
    const { currentUser } = useAuth();
    const [tableCount, setTableCount] = useState<number>(10);
    const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

    const getOrderUrl = (tableNo: number) => {
        const path = '/order';
        const search = `?cafe_id=${currentUser?.cafeId}&table=${tableNo}`;
        const url = `${window.location.origin}${window.location.pathname.split('#')[0]}#${path}${search}`;
        return url;
    };

    const getQrCodeApiUrl = (data: string) => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold">QR Codes for Tables</h2>
                <div className="flex items-center gap-4">
                    <div>
                        <label htmlFor="table-count" className="mr-2 text-sm font-medium">Number of Tables:</label>
                        <input
                            type="number"
                            id="table-count"
                            value={tableCount}
                            onChange={e => setTableCount(Math.max(1, parseInt(e.target.value, 10)) || 1)}
                            className="w-20 p-2 border rounded"
                            min="1"
                        />
                    </div>
                    <button onClick={handlePrint} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <Download className="w-5 h-5 mr-2" />
                        Print All
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(tableNo => {
                    const orderUrl = getOrderUrl(tableNo);
                    const qrUrl = getQrCodeApiUrl(orderUrl);
                    return (
                        <div key={tableNo} className="bg-white p-4 rounded-lg shadow-md text-center break-inside-avoid">
                            <h3 className="text-lg font-bold">Table {tableNo}</h3>
                            <img src={qrUrl} alt={`QR Code for Table ${tableNo}`} className="mx-auto my-2" />
                            <a href={qrUrl} download={`table-${tableNo}-qrcode.png`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Download
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Reports ---
const ReportsManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!currentUser?.cafeId) return;
        apiService.getOrders(currentUser.cafeId).then(allOrders => {
            const completed = allOrders.filter(o => o.status === OrderStatus.COMPLETED);
            setOrders(completed);
        });
    }, [currentUser]);

    const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const popularItems = useMemo(() => {
        const itemCounts: { [key: string]: { name: string, count: number } } = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (itemCounts[item.menuItemId]) {
                    itemCounts[item.menuItemId].count += item.quantity;
                } else {
                    itemCounts[item.menuItemId] = { name: item.name, count: item.quantity };
                }
            });
        });
        return Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [orders]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Sales Reports</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900">Nu.{totalRevenue.toFixed(2)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500">Total Completed Orders</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900">{totalOrders}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-slate-500">Average Order Value</h3>
                    <p className="mt-1 text-3xl font-semibold text-slate-900">Nu.{averageOrderValue.toFixed(2)}</p>
                </div>
            </div>
             <div className="bg-white shadow rounded-lg">
                <h3 className="text-lg font-semibold p-4 border-b">Top 5 Selling Items</h3>
                <ul>
                    {popularItems.map((item, index) => (
                        <li key={item.name} className="flex justify-between p-4 border-b last:border-b-0">
                            <span>{index + 1}. {item.name}</span>
                            <span className="font-semibold">{item.count} sold</span>
                        </li>
                    ))}
                     {popularItems.length === 0 && <li className="p-4 text-slate-500">No completed orders with items yet.</li>}
                </ul>
            </div>
        </div>
    );
};


// --- Main Panel ---
const CafeAdminPanel: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [cafe, setCafe] = useState<Cafe | null>(null);

    const TABS = ['orders', 'menu', 'managers', 'qr', 'reports'];
    const pathParts = location.pathname.split('/');
    const activeTab = pathParts.find(part => TABS.includes(part)) || 'orders';

    useEffect(() => {
        if (currentUser?.cafeId) {
            apiService.getCafes().then(cafes => {
                const currentCafe = cafes.find(c => c.id === currentUser.cafeId);
                setCafe(currentCafe || null);
            });
        }
    }, [currentUser]);

    const tabs = [
        { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5 mr-2" /> },
        { id: 'menu', label: 'Menu', icon: <Menu className="w-5 h-5 mr-2" /> },
        { id: 'managers', label: 'Managers', icon: <Users className="w-5 h-5 mr-2" /> },
        { id: 'qr', label: 'QR Codes', icon: <QrCode className="w-5 h-5 mr-2" /> },
        { id: 'reports', label: 'Reports', icon: <DollarSign className="w-5 h-5 mr-2" /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <ManagerDashboard />;
            case 'menu':
                return <MenuManagement />;
            case 'managers':
                return <ManagerManagement />;
            case 'qr':
                return <QrCodeGenerator />;
            case 'reports':
                return <ReportsManagement />;
            default:
                return <ManagerDashboard />;
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Cafe Admin: {cafe?.name}</h1>
            <p className="mt-1 text-slate-600">Manage your cafe's operations.</p>
            
             <div className="mt-6 border-b border-slate-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => navigate(`/cafe-admin/${tab.id}`)}
                           className={`${activeTab === tab.id
                               ? 'border-indigo-500 text-indigo-600'
                               : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                           } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default CafeAdminPanel;