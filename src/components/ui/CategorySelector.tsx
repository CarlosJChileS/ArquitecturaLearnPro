import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategorySelectorProps {
  value?: string | null; // category_id UUID
  onValueChange: (categoryId: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function CategorySelector({ 
  value, 
  onValueChange, 
  label = "Categoría", 
  placeholder = "Selecciona una categoría",
  required = false,
  disabled = false 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        setError('Error al cargar categorías');
        // Fallback a categorías por defecto si hay error
        setCategories([
          { id: 'fallback-1', name: 'Programación' },
          { id: 'fallback-2', name: 'Diseño' },
          { id: 'fallback-3', name: 'General' }
        ]);
      } else {
        setCategories(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error de conexión');
      // Fallback categories
      setCategories([
        { id: 'fallback-1', name: 'Programación' },
        { id: 'fallback-2', name: 'Diseño' },
        { id: 'fallback-3', name: 'General' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onValueChange(null);
    } else {
      onValueChange(selectedValue);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Cargando categorías..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {error && (
        <p className="text-sm text-red-600">
          {error} - Usando categorías por defecto
        </p>
      )}
      
      <Select 
        value={value || 'none'} 
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="category-select">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">
              <span className="text-gray-500">Sin categoría</span>
            </SelectItem>
          )}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex flex-col">
                <span>{category.name}</span>
                {category.description && (
                  <span className="text-xs text-gray-500">
                    {category.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {categories.length === 0 && !loading && (
        <p className="text-sm text-gray-500">
          No hay categorías disponibles
        </p>
      )}
    </div>
  );
}
