import { Cafe, User, MenuItem, Order, OrderItem } from '../types';

const API_BASE_URL = 'https://final-cafe-pos.onrender.com/api'; // Your backend server URL

const getAuthToken = () => localStorage.getItem('token');

// Generic request helper for JSON data
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    if (response.status === 204) { // No Content
        return undefined as T;
    }
    
    return response.json();
};


export const apiService = {
    // Auth
    login: (email: string, password: string): Promise<{ token: string, user: User }> => {
        return request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // Cafes
    getCafes: (): Promise<Cafe[]> => request('/cafes'),
    createCafe: (data: Omit<Cafe, 'id'>): Promise<Cafe> => request('/cafes', { method: 'POST', body: JSON.stringify(data) }),
    updateCafe: (id: string, data: Partial<Cafe>): Promise<Cafe> => request(`/cafes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCafe: (id: string): Promise<void> => request(`/cafes/${id}`, { method: 'DELETE' }),

    // Users
    getUsers: (): Promise<User[]> => request('/users'),
    createUser: (data: Omit<User, 'id'>): Promise<User> => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: string, data: Partial<User>): Promise<User> => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id: string): Promise<void> => request(`/users/${id}`, { method: 'DELETE' }),

    // Menu
    getMenuItems: (cafeId: string): Promise<MenuItem[]> => request(`/menu-items/cafe/${cafeId}`),
    createMenuItem: (data: Omit<MenuItem, 'id'>): Promise<MenuItem> => request('/menu-items', { method: 'POST', body: JSON.stringify(data) }),
    updateMenuItem: (id: string, data: Partial<MenuItem>): Promise<MenuItem> => request(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteMenuItem: (id: string): Promise<void> => request(`/menu-items/${id}`, { method: 'DELETE' }),
    
    // Orders
    getOrders: (cafeId: string): Promise<Order[]> => request(`/orders/cafe/${cafeId}`),
    getOrderByTable: (cafeId: string, tableNo: number): Promise<Order | undefined> => request(`/orders/cafe/${cafeId}/table/${tableNo}`),
    createOrder: (data: { cafeId: string, tableNo: number, items: OrderItem[] }): Promise<Order> => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateOrder: (id: string, data: Partial<Order>): Promise<Order> => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    /**
     * Uploads an image file to the server.
     * Assumes the backend has an endpoint like '/upload/image' that accepts multipart/form-data
     * and returns a JSON response with the image URL, e.g., { imageUrl: '...' }.
     * @param image The image file to upload.
     * @returns A promise that resolves to the URL of the uploaded image.
     */
    uploadImage: async (image: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', image); // The key 'image' must match what the backend expects

        const token = getAuthToken();
        const headers: HeadersInit = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // When using FormData with fetch, you MUST NOT set the 'Content-Type' header yourself.
        // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
        const response = await fetch(`${API_BASE_URL}/upload/image`, { // Adjust the endpoint if needed
            method: 'POST',
            body: formData,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Image upload failed');
        }

        const result: { imageUrl: string } = await response.json();
        return result.imageUrl;
    },
};