
import { Lead, ContactMessage, GalleryItem } from '../types';
import { MOCK_GALLERY, MOCK_LEADS, MOCK_MESSAGES } from '../constants';

// Production Backend URL on Render
const BASE_URL = 'https://northbackend-1.onrender.com/api';

export class ApiService {
    public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                mode: 'cors', // Explicitly set CORS mode
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`API Error (${endpoint}) - Sunucuya ulaşılamadı, Mock veriler kullanılıyor.`, error);
            // Fallback to Mock Data if API fails
            return this.getMockData(endpoint) as unknown as T;
        }
    }

    private static getMockData(endpoint: string): any {
        if (endpoint.includes('/leads')) return MOCK_LEADS;
        if (endpoint.includes('/gallery')) return MOCK_GALLERY;
        if (endpoint.includes('/messages')) return MOCK_MESSAGES;
        return [];
    }

    static async uploadImage(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`${BASE_URL}/upload`, { 
                method: 'POST', 
                mode: 'cors',
                body: formData 
            });

            if (!response.ok) throw new Error('Resim yükleme başarısız');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.warn("Resim yükleme servisi çalışmıyor, mock resim kullanılıyor.");
            // Return a placeholder image if upload fails
            return "https://images.unsplash.com/photo-1592833159155-c62df1b65634?q=80&w=1000&auto=format&fit=crop";
        }
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
