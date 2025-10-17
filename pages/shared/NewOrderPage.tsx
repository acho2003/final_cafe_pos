import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import { MenuItem, OrderItem } from '../../types';
import { PlusCircle, ArrowLeft, Coffee } from '../../components/Icons';

const NewOrderPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<{ [key: string]: OrderItem }>({});
    const [tableNo, setTableNo] = useState<number | ''>('');
    const [menuSearch, setMenuSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const fetchMenu = useCallback(async () => {
        if (!currentUser?.cafeId) return;
        try {
            const items = await apiService.getMenuItems(currentUser.cafeId);
            setMenuItems(items);
        } catch (error) {
            console.error("Failed to fetch menu items", error);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const handleGoBack = () => navigate(-1);

    const handleAddToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev[item.id];
            return {
                ...prev,
                [item.id]: {
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: (existing?.quantity || 0) + 1,
                }
            };
        });
    };
    
    const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newQuantity <= 0) {
                delete newCart[itemId];
            } else {
                newCart[itemId].quantity = newQuantity;
            }
            return newCart;
        });
    };

    // Fix: Explicitly type cartItems to ensure correct type inference.
    const cartItems: OrderItem[] = Object.values(cart);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const groupedMenu = useMemo(() => {
        // Fix: Explicitly type the accumulator in the reduce function for correct type inference.
        return menuItems.reduce((acc: Record<string, MenuItem[]>, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [menuItems]);

    const filteredGroupedMenu = useMemo(() => {
        if (!menuSearch.trim()) {
            return groupedMenu;
        }
        const lowercasedSearch = menuSearch.toLowerCase();
        const filtered: Record<string, MenuItem[]> = {};
        for (const category in groupedMenu) {
            const matchingItems = groupedMenu[category].filter(item =>
                item.name.toLowerCase().includes(lowercasedSearch) ||
                item.description.toLowerCase().includes(lowercasedSearch) ||
                item.category.toLowerCase().includes(lowercasedSearch)
            );
            if (matchingItems.length > 0) {
                filtered[category] = matchingItems;
            }
        }
        return filtered;
    }, [groupedMenu, menuSearch]);

    const handleCreateOrder = async () => {
        if (!currentUser?.cafeId || !tableNo || cartItems.length === 0) {
            alert("Please provide a table number and add items to the order.");
            return;
        }
        
        setIsCreating(true);
        try {
            await apiService.createOrder({
                cafeId: currentUser.cafeId,
                tableNo: tableNo,
                items: cartItems
            });
            handleGoBack(); // Navigate back to the dashboard on success
        } catch (error) {
            console.error("Failed to create order", error);
            alert("Could not create order. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-slate-200 mr-4">
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Create Manual Order</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Menu */}
                <div className="lg:col-span-2">
                    <div className="mb-4">
                         <input 
                            type="text"
                            placeholder="Search menu..."
                            value={menuSearch}
                            onChange={(e) => setMenuSearch(e.target.value)}
                            className="w-full max-w-sm p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-6">
                         {Object.keys(filteredGroupedMenu).length > 0 ? (
                            Object.entries(filteredGroupedMenu).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {items.map(item => (
                                            <div key={item.id} className="bg-white rounded-lg shadow flex">
                                                <img 
                                                    src={item.imageUrl || `https://ui-avatars.com/api/?name=${item.name.replace(/\s/g, '+')}&background=6366f1&color=fff&size=96`} 
                                                    alt={item.name} 
                                                    className="w-24 h-24 object-cover rounded-l-lg flex-shrink-0 bg-slate-200"
                                                />
                                                <div className="p-3 flex flex-col flex-1">
                                                    <h4 className="font-semibold text-slate-800">{item.name}</h4>
                                                    <p className="text-sm text-slate-600 flex-1">{item.description}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="font-bold text-slate-800">Nu.{item.price.toFixed(2)}</span>
                                                        <button onClick={() => handleAddToCart(item)} className="p-1 text-indigo-600 rounded-full hover:bg-indigo-100">
                                                            <PlusCircle className="w-6 h-6"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                         ) : (
                             <div className="text-center py-16 text-slate-500 bg-white rounded-lg shadow">
                                <p className="text-lg font-semibold">No menu items match your search.</p>
                                <p className="text-sm mt-1">Try a different search term.</p>
                            </div>
                         )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold p-4 border-b">Order Summary</h2>
                        <div className="p-4 space-y-4">
                            <div>
                                <label htmlFor="table-no" className="block text-sm font-medium text-slate-700">Table Number</label>
                                <input
                                    id="table-no"
                                    type="number"
                                    value={tableNo}
                                    onChange={(e) => setTableNo(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                    placeholder="e.g., 5"
                                    min="1"
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-3 pt-2 border-t max-h-80 overflow-y-auto pr-2">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Coffee className="mx-auto w-12 h-12 text-slate-300"/>
                                        <p className="mt-2 text-sm">No items added yet.</p>
                                    </div>
                                ) : (
                                    cartItems.map(item => (
                                        <div key={item.menuItemId} className="text-sm">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="font-semibold text-slate-800">Nu.{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center border rounded-md">
                                                    <button onClick={() => handleUpdateCartQuantity(item.menuItemId, item.quantity - 1)} className="px-2 py-0.5 text-slate-600">-</button>
                                                    <span className="px-3 text-xs">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateCartQuantity(item.menuItemId, item.quantity + 1)} className="px-2 py-0.5 text-slate-600">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 rounded-b-lg">
                            <div className="flex justify-between font-bold text-lg mb-4">
                                <span>Total:</span>
                                <span>Nu.{total.toFixed(2)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCreateOrder}
                                disabled={!tableNo || cartItems.length === 0 || isCreating}
                                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
                            >
                                {isCreating ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrderPage;