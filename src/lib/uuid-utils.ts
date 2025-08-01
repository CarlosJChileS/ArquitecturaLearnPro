// Utilidades para manejar datos UUID y limpiar campos vacíos antes de enviar a Supabase

/**
 * Limpia campos UUID vacíos convirtiéndolos a null
 * Evita el error "invalid input syntax for type uuid"
 */
export const cleanUUIDFields = (data: Record<string, any>): Record<string, any> => {
  const cleaned = { ...data };
  
  // Lista de campos que deberían ser UUID o null
  const uuidFields = [
    'instructor_id', 
    'category_id', 
    'user_id', 
    'course_id', 
    'lesson_id',
    'plan_id'
  ];
  
  uuidFields.forEach(field => {
    if (field in cleaned) {
      // Si el campo es cadena vacía, undefined, o UUID nulo, convertir a null
      if (
        cleaned[field] === '' || 
        cleaned[field] === undefined || 
        cleaned[field] === '00000000-0000-0000-0000-000000000000'
      ) {
        cleaned[field] = null;
      }
    }
  });
  
  return cleaned;
};

/**
 * Convierte el objeto de formulario del frontend al formato esperado por la base de datos
 */
export const prepareCourseDataForDB = (formData: any) => {
  const cleaned = cleanUUIDFields(formData);
  
  // Si hay category pero no category_id, necesitamos buscar el category_id
  // Por ahora lo omitimos si no está disponible
  if (cleaned.category && !cleaned.category_id) {
    delete cleaned.category; // Eliminar category string, mantener solo category_id UUID
  }
  
  // Asegurar que campos requeridos no sean null
  if (!cleaned.title) {
    throw new Error('El título del curso es requerido');
  }
  
  if (!cleaned.category_id) {
    throw new Error('La categoría del curso es requerida');
  }
  
  if (!cleaned.instructor_id) {
    throw new Error('El instructor del curso es requerido. Verifica que hayas iniciado sesión correctamente.');
  }
  
  // Mapear campos del formulario a la estructura real de la base de datos
  const dbData = {
    title: cleaned.title,
    description: cleaned.description || '',
    thumbnail_url: cleaned.thumbnail_url || null,
    intro_video_url: cleaned.intro_video_url || null, // Video introductorio
    price: cleaned.price ? parseFloat(cleaned.price) : null,
    instructor_id: cleaned.instructor_id, // Requerido por la BD
    category_id: cleaned.category_id, // Requerido por validación
    level: cleaned.level || 'beginner',
    duration_hours: cleaned.duration_hours ? parseInt(cleaned.duration_hours) : 0,
    is_published: cleaned.published || false
  };
  
  return dbData;
};

/**
 * Maneja errores de UUID y proporciona mensajes claros al usuario
 */
export const handleUUIDError = (error: any): string => {
  const errorMessage = error?.message || error?.toString() || '';
  
  if (errorMessage.includes('invalid input syntax for type uuid')) {
    return 'Error: Se detectó un identificador inválido. Por favor, actualiza la página e intenta de nuevo.';
  }
  
  if (errorMessage.includes('violates foreign key constraint')) {
    return 'Error: Hay una referencia inválida en los datos. Verifica que todos los campos estén correctamente seleccionados.';
  }
  
  return `Error inesperado: ${errorMessage}`;
};
