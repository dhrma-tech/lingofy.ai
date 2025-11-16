export interface LingofyData {
    meta: {
        siteName: string;
        siteSlug: string;
        baseLanguage: string;
        baseCurrency: string;
    };
    creator: {
        bio: string;
        location: string;
    };
    product: {
        title: string;
        description: string;
        price: number;
        images: string[];
    };
    contact: {
        email: string;
        phone: string;
    };
    socials: {
        twitter: string;
        instagram: string;
        linkedin: string;
    };
    seo: {
        title: string;
        description: string;
    };
}

export const INITIAL_DATA: LingofyData = {
    meta: {
        siteName: 'My Creative Store',
        siteSlug: 'my-creative-store',
        baseLanguage: 'en-US',
        baseCurrency: 'USD',
    },
    creator: {
        bio: 'I am a passionate creator sharing my work with the world.',
        location: 'Global',
    },
    product: {
        title: 'Handcrafted Wonder',
        description: 'A unique piece, crafted with love and care. Perfect for any occasion.',
        price: 49.99,
        images: [],
    },
    contact: {
        email: 'hello@creator.com',
        phone: '+1 (555) 123-4567',
    },
    socials: {
        twitter: 'https://twitter.com/creator',
        instagram: 'https://instagram.com/creator',
        linkedin: 'https://linkedin.com/in/creator',
    },
    seo: {
        title: 'My Creative Store | Handcrafted Goods',
        description: 'Discover unique handcrafted goods from a passionate creator.',
    },
};