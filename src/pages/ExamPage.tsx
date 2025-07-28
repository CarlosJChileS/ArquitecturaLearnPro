import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useEdgeFunction } from '@/hooks/useEdgeFunctions';
import { 
  Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, 
  FileText, HelpCircle, Timer, BookOpen, Award 
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'text' | 'essay';
  question: string;
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  duration_minutes: number;
  total_questions: number;
  total_points: number;
  passing_score: number;
  questions: Question[];
  attempts_allowed: number;
  time_limit: boolean;
  instructions?: string;
}

interface Answer {
  question_id: string;
  answer: string | string[];
  time_spent: number;
}

interface ExamResult {
  id: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_taken: number;
  answers: Answer[];
  feedback?: string;
  certificate_id?: string;
}

const ExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  const { execute: getExam } = useEdgeFunction('course', 'getExam');
  const { execute: submitExam, loading: submitting } = useEdgeFunction('course', 'submitExam');

  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (examStarted && timeRemaining > 0 && !examCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, timeRemaining, examCompleted]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const result = await getExam(examId || '');
      
      if (result.data) {
        setExam(result.data);
        if (result.data.time_limit) {
          setTimeRemaining(result.data.duration_minutes * 60);
        }
      } else {
        // Mock data for development
        const mockExam: Exam = {
          id: examId || '',
          title: 'Examen de ejemplo',
          description: 'Preguntas básicas de demostración',
          course_id: '1',
          course_title: 'Curso Demo',
          duration_minutes: 5,
          total_questions: 2,
          total_points: 20,
          passing_score: 10,
          attempts_allowed: 1,
          time_limit: true,
          instructions: 'Ejemplo de examen para desarrollo.',
          questions: [
            {
              id: '1',
              type: 'multiple_choice',
              question: '¿Cuál es la capital de Francia?',
              options: ['Madrid', 'París', 'Londres', 'Roma'],
              correct_answer: 'París',
              points: 10,
              explanation: 'París es la capital de Francia.'
            },
            {
              id: '2',
              type: 'text',
              question: '¿Qué es React?',
              points: 10,
              explanation: 'Biblioteca de JavaScript para construir interfaces.'
            },
          ],
        };
        setExam(mockExam);
        setTimeRemaining(mockExam.duration_minutes * 60);
      }
    } catch (error) {
      console.error('Error loading exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    setExamStarted(true);
    
    // Initialize answers
    const initialAnswers: Record<string, Answer> = {};
    exam?.questions.forEach((question) => {
      initialAnswers[question.id] = {
        question_id: question.id,
        answer: question.type === 'multiple_select' ? [] : '',
        time_spent: 0
      };
    });
    setAnswers(initialAnswers);
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer
      }
    }));
  };

  const handleTimeUp = async () => {
    if (!examCompleted) {
      await submitExamAnswers();
    }
  };

  const submitExamAnswers = async () => {
    try {
      setExamCompleted(true);
      const examData = {
        exam_id: examId,
        answers: Object.values(answers),
        time_taken: exam?.time_limit ? (exam.duration_minutes * 60 - timeRemaining) : undefined
      };

      const result = await submitExam(examData);
      
      if (result.data) {
        setExamResult(result.data);
      } else {
        // Mock result for development
        const mockResult: ExamResult = {
          id: 'result_1',
          score: 20,
          percentage: 100,
          passed: true,
          time_taken: 60,
          answers: Object.values(answers),
          feedback: 'Resultado de ejemplo',
          certificate_id: 'cert_demo',
        };
        setExamResult(mockResult);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  const nextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => {
      if (Array.isArray(answer.answer)) {
        return answer.answer.length > 0;
      }
      return answer.answer.trim() !== '';
    }).length;
  };

  const isAnswered = (questionId: string) => {
    const answer = answers[questionId];
    if (!answer) return false;
    
    if (Array.isArray(answer.answer)) {
      return answer.answer.length > 0;
    }
    return answer.answer.trim() !== '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando examen...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Examen no encontrado</h3>
            <p className="text-gray-600 mb-4">El examen solicitado no existe o no tienes acceso.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam completed - show results
  if (examCompleted && examResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {examResult.passed ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {examResult.passed ? '¡Felicitaciones!' : 'Examen No Aprobado'}
              </CardTitle>
              <CardDescription>
                {examResult.passed 
                  ? 'Has aprobado el examen exitosamente' 
                  : 'No has alcanzado la puntuación mínima requerida'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {examResult.score}/{exam.total_points}
                  </div>
                  <p className="text-gray-600">Puntuación</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {examResult.percentage}%
                  </div>
                  <p className="text-gray-600">Porcentaje</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatTime(examResult.time_taken)}
                  </div>
                  <p className="text-gray-600">Tiempo Usado</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <Progress 
                  value={examResult.percentage} 
                  className="w-full max-w-md mx-auto mb-2" 
                />
                <p className="text-sm text-gray-600">
                  Puntuación mínima requerida: {exam.passing_score}%
                </p>
              </div>

              {examResult.feedback && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">Comentarios del Instructor:</h4>
                  <p className="text-gray-700">{examResult.feedback}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate(`/courses/${exam.course_id}`)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Volver al Curso
                </Button>
                
                {examResult.passed && examResult.certificate_id && (
                  <Button variant="outline">
                    <Award className="h-4 w-4 mr-2" />
                    Ver Certificado
                  </Button>
                )}
                
                {!examResult.passed && (
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Intentar de Nuevo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam not started - show instructions
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <CardDescription>{exam.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>{exam.total_questions}</strong> preguntas</span>
                  </div>
                  <div className="flex items-center">
                    <Timer className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>{exam.duration_minutes}</strong> minutos</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>{exam.passing_score}%</strong> para aprobar</span>
                  </div>
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>{exam.attempts_allowed}</strong> intentos permitidos</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-yellow-800">Instrucciones:</h4>
                  <p className="text-yellow-700 text-sm">
                    {exam.instructions || 'Lee cuidadosamente cada pregunta y selecciona la mejor respuesta.'}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={startExam}
                  size="lg"
                  className="px-8"
                >
                  Iniciar Examen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{exam.title}</h2>
              <p className="text-sm text-gray-600">
                Pregunta {currentQuestionIndex + 1} de {exam.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Respondidas</div>
                <div className="font-semibold">
                  {getAnsweredCount()}/{exam.questions.length}
                </div>
              </div>
              
              {exam.time_limit && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">Tiempo Restante</div>
                  <div className={`font-semibold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    <Clock className="h-4 w-4 inline mr-1" />
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Navegación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {exam.questions.map((question, index) => (
                    <Button
                      key={`navigation-${question.id}`}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      className={`
                        relative h-10 w-10 p-0
                        ${isAnswered(question.id) 
                          ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' 
                          : ''
                        }
                      `}
                      onClick={() => goToQuestion(index)}
                      aria-label={`Ir a pregunta ${index + 1}${isAnswered(question.id) ? ' (respondida)' : ''}`}
                    >
                      {index + 1}
                      {isAnswered(question.id) && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {currentQuestion.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <CardTitle className="text-xl mb-2">
                      Pregunta {currentQuestionIndex + 1}
                    </CardTitle>
                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {currentQuestion.points} pts
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple_choice' && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.answer as string || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  >
                    {currentQuestion.options?.map((option, index) => (
                      <div key={`option-${currentQuestion.id}-${index}`} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`q${currentQuestion.id}_${index}`} />
                        <Label htmlFor={`q${currentQuestion.id}_${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Select */}
                {currentQuestion.type === 'multiple_select' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={`multi-option-${currentQuestion.id}-${index}`} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`q${currentQuestion.id}_${index}`}
                          checked={(answers[currentQuestion.id]?.answer as string[] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentAnswers = answers[currentQuestion.id]?.answer as string[] || [];
                            const newAnswers = checked
                              ? [...currentAnswers, option]
                              : currentAnswers.filter(a => a !== option);
                            handleAnswerChange(currentQuestion.id, newAnswers);
                          }}
                        />
                        <Label htmlFor={`q${currentQuestion.id}_${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Answer */}
                {(currentQuestion.type === 'text' || currentQuestion.type === 'essay') && (
                  <Textarea
                    value={answers[currentQuestion.id]?.answer as string || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={currentQuestion.type === 'essay' ? 8 : 4}
                    className="w-full"
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex space-x-4">
                    {currentQuestionIndex === exam.questions.length - 1 ? (
                      <Button
                        onClick={submitExamAnswers}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? 'Enviando...' : 'Finalizar Examen'}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === exam.questions.length - 1}
                      >
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;