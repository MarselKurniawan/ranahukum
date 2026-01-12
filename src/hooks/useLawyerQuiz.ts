import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuizQuestion {
  id: string;
  question: string;
  question_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswer {
  id: string;
  lawyer_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  question?: QuizQuestion;
}

// Fetch all quiz questions (for superadmin)
export function useAllQuizQuestions() {
  return useQuery({
    queryKey: ['all-quiz-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .select('*')
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    }
  });
}

// Fetch active quiz questions (for lawyers)
export function useActiveQuizQuestions() {
  return useQuery({
    queryKey: ['active-quiz-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    }
  });
}

// Create quiz question
export function useCreateQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: { question: string; question_order?: number }) => {
      // Get max order
      const { data: existing } = await supabase
        .from('lawyer_quiz_questions')
        .select('question_order')
        .order('question_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = question.question_order ?? ((existing?.question_order || 0) + 1);

      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .insert({
          question: question.question,
          question_order: nextOrder
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['active-quiz-questions'] });
    }
  });
}

// Update quiz question
export function useUpdateQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      question, 
      is_active,
      question_order 
    }: { 
      id: string; 
      question?: string;
      is_active?: boolean;
      question_order?: number;
    }) => {
      const updates: Partial<QuizQuestion> = {};
      if (question !== undefined) updates.question = question;
      if (is_active !== undefined) updates.is_active = is_active;
      if (question_order !== undefined) updates.question_order = question_order;

      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['active-quiz-questions'] });
    }
  });
}

// Delete quiz question
export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lawyer_quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quiz-questions'] });
      queryClient.invalidateQueries({ queryKey: ['active-quiz-questions'] });
    }
  });
}

// Fetch lawyer's quiz answers (for superadmin)
export function useLawyerQuizAnswers(lawyerId: string) {
  return useQuery({
    queryKey: ['lawyer-quiz-answers', lawyerId],
    queryFn: async () => {
      // Fetch answers
      const { data: answers, error: answersError } = await supabase
        .from('lawyer_quiz_answers')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;

      // Fetch questions for each answer
      const enrichedAnswers = await Promise.all(
        (answers || []).map(async (answer) => {
          const { data: question } = await supabase
            .from('lawyer_quiz_questions')
            .select('*')
            .eq('id', answer.question_id)
            .single();

          return {
            ...answer,
            question: question || undefined
          };
        })
      );

      // Sort by question order
      return enrichedAnswers.sort((a, b) => 
        (a.question?.question_order || 0) - (b.question?.question_order || 0)
      ) as QuizAnswer[];
    },
    enabled: !!lawyerId
  });
}
