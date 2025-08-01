import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-mvp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
}

const DebugCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      console.log('Cargando todos los cursos desde la base de datos...');
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, is_published, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading courses:', error);
        setError(error.message);
      } else {
        console.log('Cursos encontrados:', data);
        setCourses(data || []);
      }
    } catch (err) {
      console.error('Exception loading courses:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Cargando cursos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={loadCourses} className="mt-2">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug: Cursos en la Base de Datos ({courses.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              No hay cursos en la base de datos.
            </p>
            <p className="text-sm text-gray-600">
              Necesitas ejecutar el script <code>insert-demo-data.sql</code> en Supabase.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{course.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.is_published ? 'Publicado' : 'No publicado'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {course.id}</span>
                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/courses/${course.id}`}>
                      Ver Curso
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugCourses;
