import { supabase } from '@/integrations/supabase/client';

export interface ExamQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'text' | 'essay';
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  explanation?: string;
  order_index?: number;
}

export interface Exam {
  id: string;
  course_id: string;
  title: string;
  description: string;
  passing_score: number;
  max_attempts: number;
  time_limit_minutes: number;
  is_active: boolean;
  instructions?: string;
  questions: ExamQuestion[];
}

export interface ExamAttempt {
  exam_id: string;
  user_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken?: number;
  answers: { question_id: string; answer: string | string[] }[];
  feedback?: string;
  certificate_id?: string;
}

export const examService = {
  async createExam(exam: Exam) {
    const { data: examRow, error } = await supabase
      .from('exams')
      .insert({
        course_id: exam.course_id,
        title: exam.title,
        description: exam.description,
        passing_score: exam.passing_score,
        max_attempts: exam.max_attempts,
        time_limit_minutes: exam.time_limit_minutes,
        is_active: exam.is_active,
        instructions: exam.instructions
      })
      .select('id')
      .single();

    if (error || !examRow) throw error || new Error('Error creating exam');

    const questions = exam.questions.map(q => ({
      exam_id: examRow.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      correct_answer: q.correct_answer,
      points: q.points,
      order_index: q.order_index
    }));

    const { error: qError } = await supabase.from('exam_questions').insert(questions);

    if (qError) throw qError;

    return examRow.id;
  },

  async fetchExam(examId: string) {
    const { data, error } = await supabase
      .from('exams')
      .select(
        `id, title, description, course_id, passing_score, max_attempts, time_limit_minutes, instructions, exam_questions(id, question_text, question_type, options, correct_answer, points, explanation, order_index)`
      )
      .eq('id', examId)
      .single();

    if (error || !data) throw error || new Error('Exam not found');

    const questions = (data.exam_questions || []) as ExamQuestion[];
    const total_points = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      course_id: data.course_id,
      course_title: '',
      duration_minutes: data.time_limit_minutes,
      total_questions: questions.length,
      total_points,
      passing_score: data.passing_score,
      questions,
      attempts_allowed: data.max_attempts,
      time_limit: !!data.time_limit_minutes,
      instructions: data.instructions
    };
  },

  async submitExamAttempt(exam: Exam, answers: { question_id: string; answer: string | string[] }[], timeTaken?: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    let score = 0;
    for (const q of exam.questions) {
      const ans = answers.find(a => a.question_id === q.id);
      if (!ans) continue;
      const correct = q.correct_answer;
      if (Array.isArray(correct)) {
        if (Array.isArray(ans.answer) && correct.sort().toString() === ans.answer.sort().toString()) {
          score += q.points;
        }
      } else if (ans.answer === correct) {
        score += q.points;
      }
    }
    const max_score = exam.questions.reduce((s, q) => s + q.points, 0);
    const percentage = max_score > 0 ? Math.round((score / max_score) * 100) : 0;
    const passed = percentage >= exam.passing_score;

    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: exam.id,
        user_id: user.id,
        score,
        max_score,
        percentage,
        passed,
        time_taken: timeTaken,
        answers
      })
      .select('id, certificate_id, feedback')
      .single();

    if (error || !data) throw error || new Error('Error saving attempt');

    return {
      id: data.id,
      score,
      percentage,
      passed,
      time_taken: timeTaken || 0,
      answers,
      certificate_id: data.certificate_id,
      feedback: data.feedback
    };
  }
};

export default examService;
