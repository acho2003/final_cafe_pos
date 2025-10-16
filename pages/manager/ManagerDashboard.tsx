import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import { Order, OrderStatus, PaymentStatus, OrderItem, PaymentMethod } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { PlusCircle } from '../../components/Icons';

const statusColors: { [key in OrderStatus]: string } = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.PREPARING]: 'bg-blue-100 text-blue-800',
    [OrderStatus.READY]: 'bg-green-100 text-green-800',
    [OrderStatus.COMPLETED]: 'bg-slate-100 text-slate-800',
    [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

const paymentStatusColors: { [key in PaymentStatus]: string } = {
    [PaymentStatus.PENDING]: 'border-yellow-500 text-yellow-600',
    [PaymentStatus.PAID]: 'border-green-500 text-green-600',
    [PaymentStatus.REFUNDED]: 'border-red-500 text-red-600',
};

const OrderCard: React.FC<{ order: Order; onSelect: (order: Order) => void; }> = ({ order, onSelect }) => {
    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div onClick={() => onSelect(order)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Table {order.tableNo}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                </span>
            </div>
            <div className="p-4 space-y-2">
                <p className="text-sm text-slate-600">{order.items.length} item(s)</p>
                <p className="text-lg font-bold text-slate-800">NU.{order.total.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Last updated: {timeAgo(order.updatedAt)}</p>
            </div>
        </div>
    );
};

const OrderDetailsModal: React.FC<{ order: Order | null; onClose: () => void; onUpdate: () => void; }> = ({ order, onClose, onUpdate }) => {
    if (!order) return null;

    const handleStatusChange = async (newStatus: OrderStatus) => {
        try {
            await apiService.updateOrder(order.id, { status: newStatus });
            onUpdate();
        } catch (e) {
            console.error("Failed to update status", e);
            alert("Could not update order status.");
        }
    };

    const handlePayment = async (method: PaymentMethod) => {
        try {
            await apiService.updateOrder(order.id, {
                paymentStatus: PaymentStatus.PAID,
                paymentMethod: method,
                status: OrderStatus.COMPLETED
            });
            onUpdate();
        } catch(e) {
            console.error("Failed to update payment", e);
            alert("Could not update payment status.");
        }
    };

    const isPendingPayment = order.paymentStatus === PaymentStatus.PENDING;
    const canBeCancelled = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;

    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Order Details - Table ${order.tableNo}`}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Items</h4>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 border-t border-b py-2">
                        {order.items.map((item: OrderItem, index: number) => (
                            <li key={`${item.menuItemId}-${index}`} className="flex justify-between items-start text-sm p-2 bg-slate-50 rounded">
                                <div>
                                    <p className="font-medium">{item.quantity} x {item.name}</p>
                                    {item.notes && <p className="text-xs text-slate-500 italic">Note: {item.notes}</p>}
                                </div>
                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Order Actions</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                        {order.status === OrderStatus.PENDING && (
                             <button onClick={() => handleStatusChange(OrderStatus.PREPARING)} className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-blue-500 text-white hover:bg-blue-600">
                                Start Preparing
                            </button>
                        )}
                         {order.status === OrderStatus.PREPARING && (
                             <button onClick={() => handleStatusChange(OrderStatus.READY)} className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-green-500 text-white hover:bg-green-600">
                                Mark as Served
                            </button>
                        )}
                        {canBeCancelled && (
                            <button onClick={() => { if(window.confirm('Are you sure you want to cancel this order?')) handleStatusChange(OrderStatus.CANCELLED) }} className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-500 text-white hover:bg-red-600">
                                Cancel Order
                            </button>
                        )}
                         {order.status === OrderStatus.READY && (
                            <p className="text-sm text-slate-500 p-2 bg-slate-100 rounded-md text-center">Awaiting payment.</p>
                         )}
                    </div>
                </div>

                 <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Payment</h4>
                    <div className={`p-3 border rounded-md ${paymentStatusColors[order.paymentStatus]}`}>
                        <p className="text-sm font-bold">{order.paymentStatus}</p>
                        {order.paymentStatus !== PaymentStatus.PENDING && <p className="text-xs">Method: {order.paymentMethod}</p>}
                    </div>
                    {isPendingPayment && order.status === OrderStatus.READY && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button onClick={() => handlePayment(PaymentMethod.CASH)} className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                                Paid (Cash)
                            </button>
                            <button onClick={() => handlePayment(PaymentMethod.DK)} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Paid (DK)
                            </button>
                            <button onClick={() => handlePayment(PaymentMethod.MPAY)} className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">
                                Paid (mpay)
                            </button>
                            <button onClick={() => handlePayment(PaymentMethod.MBOB)} className="px-3 py-2 text-sm font-medium text-black bg-yellow-400 rounded-md hover:bg-yellow-500">
                                Paid (mbob)
                            </button>
                        </div>
                    )}
                     {isPendingPayment && order.status !== OrderStatus.READY && (
                        <p className="text-xs text-slate-500 mt-2">Order must be marked as "Served" before accepting payment.</p>
                     )}
                </div>
            </div>
        </Modal>
    );
};


const ManagerDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        if (!currentUser?.cafeId) return;
        try {
            const fetchedOrders = await apiService.getOrders(currentUser.cafeId);
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const newOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PREPARING), [orders]);
    const awaitingPaymentOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.READY), [orders]);
    const finishedOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED), [orders]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Orders Dashboard</h1>
                <button onClick={() => navigate('../new-order')} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    New Manual Order
                </button>
            </div>
            
            {isLoading ? <p>Loading orders...</p> : (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">New Orders ({newOrders.length})</h2>
                        {newOrders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {newOrders.map(order => <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} />)}
                            </div>
                        ) : <p className="text-slate-500">No new orders.</p>}
                    </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Served - Awaiting Payment ({awaitingPaymentOrders.length})</h2>
                        {awaitingPaymentOrders.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {awaitingPaymentOrders.map(order => <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} />)}
                            </div>
                        ) : <p className="text-slate-500">No orders are awaiting payment.</p>}
                    </div>
                     <div>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Finished Orders ({finishedOrders.length})</h2>
                        {finishedOrders.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {finishedOrders.map(order => <OrderCard key={order.id} order={order} onSelect={setSelectedOrder} />)}
                            </div>
                        ) : <p className="text-slate-500">No finished orders yet.</p>}
                    </div>
                </div>
            )}
            
            <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={() => { fetchOrders(); setSelectedOrder(null); }} />
        </div>
    );
};

export default ManagerDashboard;