import { useState, useEffect } from 'react';

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  category: 'quick_links' | 'categories' | 'legal';
  order_index: number;
  is_active: boolean;
}

export interface FooterContact {
  id: string;
  type: 'email' | 'phone' | 'address';
  value: string;
  description: string;
  is_primary: boolean;
}

export interface FooterSocial {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
  url: string;
  is_active: boolean;
}

export interface FooterSettings {
  id: string;
  company_name: string;
  company_description: string;
  copyright_text: string;
  newsletter_title: string;
  newsletter_description: string;
  logo_text: string;
}

export interface FooterData {
  links: FooterLink[];
  contacts: FooterContact[];
  socials: FooterSocial[];
  settings: FooterSettings | null;
  loading: boolean;
  error: string | null;
}

export const useFooterData = (): FooterData => {
  const [data, setData] = useState<FooterData>({
    links: [],
    contacts: [],
    socials: [],
    settings: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Simulate async loading and use default data
    const loadFooterData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Use default data for now
        setData({
          links: defaultFooterData.links,
          contacts: defaultFooterData.contacts,
          socials: defaultFooterData.socials,
          settings: defaultFooterData.settings,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error loading footer data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }));
      }
    };

    loadFooterData();
  }, []);

  return data;
};

// Default fallback data
export const defaultFooterData: Omit<FooterData, 'loading' | 'error'> = {
  links: [
    { id: '1', title: 'Catálogo de Cursos', url: '/courses', category: 'quick_links', order_index: 1, is_active: true },
    { id: '2', title: 'Planes y Precios', url: '/subscription', category: 'quick_links', order_index: 2, is_active: true },
    { id: '3', title: 'Sobre Nosotros', url: '/about', category: 'quick_links', order_index: 3, is_active: true },
    { id: '4', title: 'Contacto', url: '/contact', category: 'quick_links', order_index: 4, is_active: true },
    { id: '5', title: 'Preguntas Frecuentes', url: '/faq', category: 'quick_links', order_index: 5, is_active: true },
    { id: '6', title: 'Desarrollo Web', url: '/courses?category=Programación', category: 'categories', order_index: 1, is_active: true },
    { id: '7', title: 'Data Science', url: '/courses?category=Data Science', category: 'categories', order_index: 2, is_active: true },
    { id: '8', title: 'Diseño UX/UI', url: '/courses?category=Diseño', category: 'categories', order_index: 3, is_active: true },
    { id: '9', title: 'Machine Learning', url: '/courses?category=IA/ML', category: 'categories', order_index: 4, is_active: true },
    { id: '10', title: 'DevOps', url: '/courses?category=DevOps', category: 'categories', order_index: 5, is_active: true },
    { id: '11', title: 'Términos de Servicio', url: '/terms', category: 'legal', order_index: 1, is_active: true },
    { id: '12', title: 'Política de Privacidad', url: '/privacy', category: 'legal', order_index: 2, is_active: true },
    { id: '13', title: 'Cookies', url: '/cookies', category: 'legal', order_index: 3, is_active: true },
  ],
  contacts: [
    { id: '1', type: 'email', value: 'soporte@learnpro.com', description: 'Soporte general', is_primary: true },
    { id: '2', type: 'phone', value: '+1 (555) 123-4567', description: 'Lun-Vie 9:00-18:00 EST', is_primary: false },
    { id: '3', type: 'address', value: 'San Francisco, CA', description: 'Oficina principal', is_primary: false },
  ],
  socials: [
    { id: '1', platform: 'facebook', url: 'https://facebook.com/learnpro', is_active: true },
    { id: '2', platform: 'twitter', url: 'https://twitter.com/learnpro', is_active: true },
    { id: '3', platform: 'instagram', url: 'https://instagram.com/learnpro', is_active: true },
    { id: '4', platform: 'linkedin', url: 'https://linkedin.com/company/learnpro', is_active: true },
  ],
  settings: {
    id: '1',
    company_name: 'LearnPro',
    company_description: 'La plataforma líder en educación online que transforma carreras profesionales a través del aprendizaje especializado.',
    copyright_text: '© 2024 LearnPro. Todos los derechos reservados.',
    newsletter_title: 'Mantente Actualizado',
    newsletter_description: 'Recibe las últimas novedades sobre cursos y ofertas especiales',
    logo_text: 'LearnPro'
  }
};
