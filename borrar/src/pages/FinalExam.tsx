import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const FinalExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [course, setCourse] = useState<{ title: string; instructor: string } | null>(null);
  const [score, setScore] = useState(0);

  // Sample questions - in a real app, these would come from the database
  const questions: Question[] = [
    {
      id: '1',
      question: '¿Cuál es el primer paso en el proceso de diseño UX/UI?',
      options: [
        'Crear wireframes',
        'Investigación de usuario',
        'Diseño visual',
        'Prototipado'
      ],
      correctAnswer: 1,
      explanation: 'La investigación de usuario es fundamental para entender las necesidades y comportamientos antes de diseñar.'
    },
    {
      id: '2',
      question: '¿Qué es un wireframe?',
      options: [
        'Un prototipo funcional',
        'Una representación visual básica de la estructura',
        'El diseño final',
        'Una herramienta de código'
      ],
      correctAnswer: 1,
      explanation: 'Los wireframes son representaciones básicas de la estructura y layout, sin elementos visuales detallados.'
    },
    {
      id: '3',
      question: '¿Cuál es la diferencia principal entre UX y UI?',
      options: [
        'No hay diferencia',
        'UX es la experiencia, UI es la interfaz visual',
        'UX es para web, UI para móvil',
        'UX es más importante que UI'
      ],
      correctAnswer: 1,
      explanation: 'UX se enfoca en la experiencia completa del usuario, mientras UI se centra en los elementos visuales de la interfaz.'
    },
    {
      id: '4',
      question: '¿Qué herramienta es más comúnmente usada para prototipado en 2025?',
      options: [
        'Photoshop',
        'Figma',
        'Paint',
        'Word'
      ],
      correctAnswer: 1,
      explanation: 'Figma es actualmente la herramienta líder para diseño y prototipado de interfaces.'
    },
    {
      id: '5',
      question: '¿Qué es un persona en UX?',
      options: [
        'Una persona real',
        'Un personaje ficticio basado en investigación de usuarios',
        'El diseñador',
        'El cliente'
      ],
      correctAnswer: 1,
      explanation: 'Los personas son personajes ficticios creados basándose en investigación real para representar diferentes tipos de usuarios.'
    }
  ];

  // Timer effect
  useEffect(() => {
    if (examStarted && !examFinished && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && examStarted) {
      finishExam();
    }
  }, [examStarted, examFinished, timeLeft]);

  // Load course info
  useEffect(() => {
    // In a real app, fetch course info from database
    setCourse({
      title: 'Diseño UX/UI Completo: De la Idea al Prototipo',
      instructor: 'Carlos J. Chile S.'
    });
  }, [courseId]);

  const startExam = () => {
    setExamStarted(true);
    setTimeLeft(30 * 60); // Reset timer
  };

  const selectAnswer = (answerIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answerIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishExam = () => {
    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setExamFinished(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const goBackToCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Aprobado</Badge>;
    return <Badge className="bg-red-100 text-red-800">Necesita Mejorar</Badge>;
  };

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={goBackToCourse}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al curso
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-primary rounded-xl">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Examen Final</CardTitle>
              <CardDescription>
                {course?.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Instrucciones del Examen</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• El examen consta de {questions.length} preguntas de opción múltiple</li>
                  <li>• Tienes 30 minutos para completar el examen</li>
                  <li>• Necesitas al menos 60% para aprobar</li>
                  <li>• Puedes navegar entre las preguntas antes de entregar</li>
                  <li>• Una vez que inicies, el tiempo comenzará a correr</li>
                </ul>
              </div>

              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  30 minutos
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  {questions.length} preguntas
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={startExam}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
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

  if (examFinished) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-xl ${score >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {score >= 60 ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-2xl">
                {score >= 60 ? '¡Felicitaciones!' : 'Examen Completado'}
              </CardTitle>
              <CardDescription>
                {score >= 60 ? 'Has aprobado el examen final' : 'Necesitas estudiar más para aprobar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}%
                </div>
                {getScoreBadge(score)}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Resumen de Resultados</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Respuestas correctas:</span>
                    <span className="font-medium ml-2">
                      {Object.keys(answers).filter(key => answers[parseInt(key)] === questions[parseInt(key)].correctAnswer).length} de {questions.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo usado:</span>
                    <span className="font-medium ml-2">
                      {formatTime(30 * 60 - timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {score >= 60 && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    ¡Has obtenido tu certificado de finalización!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Puedes descargar tu certificado desde tu dashboard.
                  </p>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={goBackToCourse}>
                  Volver al Curso
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Ir al Dashboard
                </Button>
                {score < 60 && (
                  <Button onClick={() => {
                    setExamFinished(false);
                    setExamStarted(false);
                    setCurrentQuestion(0);
                    setAnswers({});
                    setTimeLeft(30 * 60);
                  }}>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">Examen Final</h1>
              <p className="text-gray-600">{course?.title}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-lg font-medium mb-1">
                <Clock className="h-5 w-5 mr-2" />
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">
                Pregunta {currentQuestion + 1} de {questions.length}
              </div>
            </div>
          </div>
          
          <Progress 
            value={((currentQuestion + 1) / questions.length) * 100} 
            className="h-3" 
          />
        </div>

        {/* Question */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectAnswer(index)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer ${
                  index === currentQuestion
                    ? 'bg-primary text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={finishExam} className="bg-green-600 hover:bg-green-700">
              Finalizar Examen
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalExam;
