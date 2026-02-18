import { Lead, ContactMessage, GalleryItem } from '../types';

// macOS AirPlay çakışmasını önlemek için 5001 portuna bağlandık
const BASE_URL = 'http://localhost:5001/api';

export class ApiService {
    public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            if (!response.ok) throw new Error('Sunucu hatası');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Resim yükleme başarısız');
        const data = await response.json();
        return data.url;
    }

    static async getLeads(): Promise<Lead[]> { return this.request<Lead[]>('/leads'); }
    static async saveLead(lead: Partial<Lead>): Promise<Lead> {
        return this.request<Lead>('/leads', { method: 'POST', body: JSON.stringify(lead) });
    }

    static async getMessages(): Promise<ContactMessage[]> { return this.request<ContactMessage[]>('/messages'); }
    static async saveMessage(message: Partial<ContactMessage>): Promise<ContactMessage> {
        return this.request<ContactMessage>('/messages', { method: 'POST', body: JSON.stringify(message) });
    }

    static async getGallery(): Promise<GalleryItem[]> { return this.request<GalleryItem[]>('/gallery'); }
    static async saveGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
        return this.request<GalleryItem>('/gallery', { method: 'POST', body: JSON.stringify(item) });
    }
    static async deleteGalleryItem(id: string): Promise<void> {
        return this.request<void>(`/gallery/${id}`, { method: 'DELETE' });
    }
}