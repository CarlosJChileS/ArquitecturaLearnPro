import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, Eye } from 'lucide-react';

interface Question {
  id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

interface ExamBuilderProps {
  examId?: string;
  courseId: string;
  onSave?: (examId: string) => void;
}

const ExamBuilder: React.FC<ExamBuilderProps> = ({ examId, courseId, onSave }) => {
  const { toast } = useToast();
  
  const [exam, setExam] = useState({
    title: '',
    description: '',
    passing_score: 70,
    max_attempts: 3,
    time_limit_minutes: 60,
    is_active: true
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (examId) {
      // Solo cargar si es necesario, sin mostrar loading
      // loadExam();
    } else {
      // Add initial question for new exam
      addQuestion();
    }
  }, [examId]);

  const loadExam = async () => {
    // setIsLoading(true); // Desactivado para evitar "Cargando examen..."
    try {
      // Mock data - would load from database
      const mockExam = {
        title: 'Examen Final - JavaScript Moderno',
        description: 'Evaluación final del curso de JavaScript ES6+',
        passing_score: 70,
        max_attempts: 3,
        time_limit_minutes: 60,
        is_active: true
      };

      const mockQuestions: Question[] = [
        {
          id: '1',
          question_text: '¿Cuál es la diferencia principal entre let y var?',
          question_type: 'multiple_choice',
          options: ['Let tiene scope de bloque', 'Var tiene scope de bloque', 'No hay diferencia', 'Let es más rápido'],
          correct_answer: 'Let tiene scope de bloque',
          points: 10,
          order_index: 1
        }
      ];

      setExam(mockExam);
      setQuestions(mockQuestions);
    } catch (error) {
      console.error('Error loading exam:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el examen",
        variant: "destructive"
      });
    } finally {
      // setIsLoading(false); // Desactivado para evitar problemas de loading
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 10,
      order_index: questions.length + 1
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const newOptions = [...updatedQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    updatedQuestions[questionIndex].options = newOptions;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Update order indices
    updatedQuestions.forEach((q, i) => {
      q.order_index = i + 1;
    });
    setQuestions(updatedQuestions);
  };

  const saveExam = async () => {
    if (!exam.title.trim() || questions.length === 0) {
      toast({
        title: "Error",
        description: "El examen debe tener un título y al menos una pregunta",
        variant: "destructive"
      });
      return;
    }

    // Validate questions
    for (const question of questions) {
      if (!question.question_text.trim()) {
        toast({
          title: "Error",
          description: "Todas las preguntas deben tener texto",
          variant: "destructive"
        });
        return;
      }
      
      if (question.question_type === 'multiple_choice' && 
          (!question.correct_answer || !question.options.some(opt => opt.trim()))) {
        toast({
          title: "Error",
          description: "Las preguntas de opción múltiple deben tener opciones y respuesta correcta",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSaving(true);
    
    try {
      // Mock save - would save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Examen guardado",
        description: "El examen ha sido guardado exitosamente"
      });
      
      onSave?.('mock-exam-id');
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el examen",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const previewExam = () => {
    // Open exam preview
    window.open(`/exam/preview`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando examen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Examen</CardTitle>
          <CardDescription>Define los parámetros básicos del examen</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Título del examen</Label>
            <Input
              id="exam-title"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              placeholder="Ej: Examen Final - JavaScript Moderno"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passing-score">Puntuación mínima (%)</Label>
            <Input
              id="passing-score"
              type="number"
              min="0"
              max="100"
              value={exam.passing_score}
              onChange={(e) => setExam({ ...exam, passing_score: Number(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time-limit">Tiempo límite (minutos)</Label>
            <Input
              id="time-limit"
              type="number"
              min="1"
              value={exam.time_limit_minutes}
              onChange={(e) => setExam({ ...exam, time_limit_minutes: Number(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Intentos máximos</Label>
            <Input
              id="max-attempts"
              type="number"
              min="1"
              max="10"
              value={exam.max_attempts}
              onChange={(e) => setExam({ ...exam, max_attempts: Number(e.target.value) })}
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="exam-description">Descripción</Label>
            <Textarea
              id="exam-description"
              value={exam.description}
              onChange={(e) => setExam({ ...exam, description: e.target.value })}
              placeholder="Describe el contenido y objetivos del examen..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preguntas ({questions.length})</h3>
          <Button onClick={addQuestion} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Agregar pregunta
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Pregunta</Label>
                  <Textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    placeholder="Escribe tu pregunta aquí..."
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de pregunta</Label>
                    <Select
                      value={question.question_type}
                      onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                        <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                        <SelectItem value="short_answer">Respuesta corta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Puntos</Label>
                    <Input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(index, 'points', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Options for multiple choice */}
              {question.question_type === 'multiple_choice' && (
                <div className="space-y-3">
                  <Label>Opciones</Label>
                  <RadioGroup
                    value={question.correct_answer}
                    onValueChange={(value) => updateQuestion(index, 'correct_answer', value)}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`q${index}-option${optionIndex}`} />
                        <Input
                          value={option}
                          onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                          placeholder={`Opción ${optionIndex + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </RadioGroup>
                  <p className="text-sm text-muted-foreground">
                    Selecciona la opción correcta marcando el radio button correspondiente
                  </p>
                </div>
              )}

              {/* True/False options */}
              {question.question_type === 'true_false' && (
                <div className="space-y-2">
                  <Label>Respuesta correcta</Label>
                  <RadioGroup
                    value={question.correct_answer}
                    onValueChange={(value) => updateQuestion(index, 'correct_answer', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Verdadero" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`}>Verdadero</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Falso" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`}>Falso</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Short answer */}
              {question.question_type === 'short_answer' && (
                <div className="space-y-2">
                  <Label>Respuesta correcta</Label>
                  <Input
                    value={question.correct_answer}
                    onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                    placeholder="Respuesta esperada..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Las respuestas cortas se evalúan por coincidencia exacta (sin distinción de mayúsculas)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={previewExam}>
          <Eye className="h-4 w-4 mr-2" />
          Previsualizar
        </Button>
        
        <Button onClick={saveExam} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar examen
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExamBuilder;