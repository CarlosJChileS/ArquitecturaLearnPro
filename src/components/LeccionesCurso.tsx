import React from 'react';

// Componente base para mostrar las lecciones de un curso
// Recibe las props: courseId, lessons (array de lecciones), onSelectLesson (callback)

interface Lesson {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  order_index?: number;
}

interface LeccionesCursoProps {
  courseId: string;
  lessons: Lesson[];
  onSelectLesson?: (lessonId: string) => void;
}

const LeccionesCurso: React.FC<LeccionesCursoProps> = ({ courseId, lessons, onSelectLesson }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lecciones del Curso</h2>
      <ul className="space-y-3">
        {lessons.length === 0 ? (
          <li className="text-gray-500">No hay lecciones disponibles.</li>
        ) : (
          lessons
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((lesson) => (
              <li
                key={lesson.id}
                className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectLesson && onSelectLesson(lesson.id)}
              >
                <div>
                  <h3 className="font-medium text-lg">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-600">{lesson.description}</p>
                  )}
                </div>
                {lesson.video_url && (
                  <span className="text-blue-500 text-xs">Video</span>
                )}
              </li>
            ))
        )}
      </ul>
    </div>
  );
};

export default LeccionesCurso;
