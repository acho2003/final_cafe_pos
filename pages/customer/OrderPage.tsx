import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { MenuItem, OrderItem, Order, Cafe } from '../../types';
import { Coffee, PlusCircle } from '../../components/Icons';

type Cart = { [key: string]: OrderItem };

const OrderPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const cafeId = searchParams.get('cafe_id');
    const tableNo = searchParams.get('table');

    const [cafe, setCafe] = useState<Cafe | null>(null);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<Cart>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'placing' | 'placed'>('idle');
    const [existingOrder, setExistingOrder] = useState<Order | null>(null);
    const [menuSearch, setMenuSearch] = useState('');

    const fetchOrderData = useCallback(async () => {
        if (!cafeId || !tableNo) {
            setError('Missing cafe or table information.');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const cafes = await apiService.getCafes();
            const currentCafe = cafes.find(c => c.id === cafeId);
            setCafe(currentCafe || null);

            const menuItems = await apiService.getMenuItems(cafeId);
            setMenu(menuItems);

            const order = await apiService.getOrderByTable(cafeId, parseInt(tableNo, 10));
            if (order) {
                setExistingOrder(order);
                const initialCart = order.items.reduce((acc, item) => {
                    acc[item.menuItemId] = item;
                    return acc;
                }, {} as Cart);
                setCart(initialCart);
            }
        } catch (err) {
            setError('Failed to load cafe details. Please check the QR code.');
        } finally {
            setIsLoading(false);
        }
    }, [cafeId, tableNo]);
    
    useEffect(() => {
        fetchOrderData();
    }, [fetchOrderData]);

    const allCategories = useMemo(() => {
        return menu.reduce((acc: string[], item) => {
            if (!acc.includes(item.category)) {
                acc.push(item.category);
            }
            return acc;
        }, []).sort();
    }, [menu]);

    const filteredMenu = useMemo(() => {
        if (!menuSearch.trim()) {
            return menu;
        }
        const lowercasedSearch = menuSearch.toLowerCase();
        return menu.filter(item => 
            item.name.toLowerCase().includes(lowercasedSearch) ||
            item.description.toLowerCase().includes(lowercasedSearch) ||
            item.category.toLowerCase().includes(lowercasedSearch)
        );
    }, [menu, menuSearch]);

    const groupedMenu = useMemo(() => {
        // Fix: Explicitly typed the accumulator in the reduce function to ensure correct type inference for groupedMenu.
        return filteredMenu.reduce((acc: Record<string, MenuItem[]>, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [filteredMenu]);

    const handleAddToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart[item.id];
            const newQuantity = (existingItem?.quantity || 0) + 1;
            return {
                ...prevCart,
                [item.id]: {
                    menuItemId: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: newQuantity,
                }
            };
        });
    };
    
    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        setCart(prevCart => {
            const newCart = { ...prevCart };
            if (newQuantity <= 0) {
                delete newCart[itemId];
            } else {
                newCart[itemId].quantity = newQuantity;
            }
            return newCart;
        });
    };

    const handleNotesChange = (itemId: string, notes: string) => {
        setCart(prevCart => ({
            ...prevCart,
            [itemId]: { ...prevCart[itemId], notes }
        }));
    };

    // Fix: Explicitly typed cartItems as OrderItem[] to resolve type inference issues with Object.values.
    const cartItems: OrderItem[] = Object.values(cart);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmitOrder = async () => {
        if (cartItems.length === 0 || !cafeId || !tableNo) return;
        
        setOrderStatus('placing');
        try {
            if (existingOrder) {
                await apiService.updateOrder(existingOrder.id, { items: cartItems });
            } else {
                await apiService.createOrder({ cafeId, tableNo: parseInt(tableNo, 10), items: cartItems });
            }
            setOrderStatus('placed');
            setTimeout(() => {
                setOrderStatus('idle');
                fetchOrderData(); // Re-fetch to update existingOrder state
            }, 3000);
        } catch (err) {
            setError('Could not place order. Please try again.');
            setOrderStatus('idle');
        }
    };
    
    const orderLocked = existingOrder && existingOrder.status !== 'PENDING';

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow-md sticky top-0 z-20 h-20">
                <div className="container mx-auto px-4 h-full flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-slate-800">{cafe?.name || 'Welcome'}</h1>
                    <p className="text-slate-600">Ordering for Table {tableNo}</p>
                </div>
            </header>

            <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     {/* Sticky Menu Navigation */}
                    <div className="sticky top-20 bg-slate-50/95 backdrop-blur-sm z-10 py-3 mb-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <input 
                                type="text"
                                placeholder="Search menu..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <nav className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
                                <ul className="flex gap-4">
                                    {allCategories.map(category => (
                                        <li key={category}>
                                            <a href={`#${category.replace(/\s+/g, '-')}`} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors pb-1 border-b-2 border-transparent hover:border-indigo-500">
                                                {category}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </div>

                    {Object.keys(groupedMenu).length > 0 ? (
                        Object.entries(groupedMenu).map(([category, items]) => (
                            <div key={category} id={category.replace(/\s+/g, '-')} className="mb-8 scroll-mt-44">
                                <h3 className="text-lg font-bold text-indigo-700 border-b-2 border-indigo-200 pb-2 mb-4">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map(item => (
                                        <div key={item.id} className="bg-white rounded-lg shadow flex">
                                            <img 
                                                src={item.imageUrl || `https://ui-avatars.com/api/?name=${item.name.replace(/\s/g, '+')}&background=6366f1&color=fff&size=96`} 
                                                alt={item.name} 
                                                className="w-24 h-24 object-cover rounded-l-lg bg-slate-200"
                                            />
                                            <div className="p-3 flex flex-col flex-1">
                                                <h4 className="font-semibold text-slate-800">{item.name}</h4>
                                                <p className="text-sm text-slate-600 flex-1">{item.description}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="font-bold text-slate-800">${item.price.toFixed(2)}</span>
                                                    <button disabled={orderLocked} onClick={() => handleAddToCart(item)} className="p-1 text-indigo-600 rounded-full hover:bg-indigo-100 disabled:text-slate-400 disabled:cursor-not-allowed">
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
                        <div className="text-center py-16 text-slate-500">
                            <p className="text-lg font-semibold">No items match your search.</p>
                            <p className="text-sm mt-1">Try a different search term or clear the search field.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-4 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Your Order</h2>
                        {orderLocked && (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                                <p className="font-bold">Order Approved</p>
                                <p>Your order has been approved by the staff. Please ask for assistance to add more items.</p>
                            </div>
                        )}
                        {cartItems.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Coffee className="mx-auto w-12 h-12 text-slate-300"/>
                                <p className="mt-2">Your cart is empty.</p>
                                <p className="text-sm">Add items from the menu to get started.</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {cartItems.map(item => (
                                        <div key={item.menuItemId} className="flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-slate-500">${item.price.toFixed(2)}</p>
                                                </div>
                                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center border rounded-md">
                                                    <button disabled={orderLocked} onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)} className="px-2 py-1 disabled:text-slate-300">-</button>
                                                    <span className="px-3">{item.quantity}</span>
                                                    <button disabled={orderLocked} onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)} className="px-2 py-1 disabled:text-slate-300">+</button>
                                                </div>
                                                <input
                                                  type="text"
                                                  placeholder="Add notes..."
                                                  value={item.notes || ''}
                                                  disabled={orderLocked}
                                                  onChange={(e) => handleNotesChange(item.menuItemId, e.target.value)}
                                                  className="ml-2 text-sm border-b focus:outline-none focus:border-indigo-500 w-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={orderStatus === 'placing' || orderLocked}
                                        className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
                                    >
                                        {orderStatus === 'placing' ? 'Placing Order...' : (orderStatus === 'placed' ? 'Order Updated!' : (existingOrder ? 'Update Order' : 'Place Order'))}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderPage;