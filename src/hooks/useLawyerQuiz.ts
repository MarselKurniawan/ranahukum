import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface QuizOption {
  id: string;
  question_id: string;
  option_label: string;
  option_text: string;
  is_correct: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_order: number;
  question_type: 'essay' | 'multiple_choice';
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options?: QuizOption[];
}

export interface QuizAnswer {
  id: string;
  lawyer_id: string;
  question_id: string;
  answer: string;
  created_at: string;
  question?: QuizQuestion;
}

// Fetch all quiz questions with options (for superadmin)
export function useAllQuizQuestions() {
  return useQuery({
    queryKey: ['all-quiz-questions'],
    queryFn: async () => {
      const { data: questions, error } = await supabase
        .from('lawyer_quiz_questions')
        .select('*')
        .order('question_order', { ascending: true });

      if (error) throw error;

      // Fetch options for multiple choice questions
      const questionIds = (questions || [])
        .filter(q => q.question_type === 'multiple_choice')
        .map(q => q.id);

      let optionsMap: Record<string, QuizOption[]> = {};
      if (questionIds.length > 0) {
        const { data: options } = await supabase
          .from('lawyer_quiz_options')
          .select('*')
          .in('question_id', questionIds)
          .order('option_label', { ascending: true });

        (options || []).forEach(opt => {
          if (!optionsMap[opt.question_id]) {
            optionsMap[opt.question_id] = [];
          }
          optionsMap[opt.question_id].push(opt as QuizOption);
        });
      }

      return (questions || []).map(q => ({
        ...q,
        options: optionsMap[q.id] || []
      })) as QuizQuestion[];
    }
  });
}

// Fetch active quiz questions with options (for lawyers)
export function useActiveQuizQuestions() {
  return useQuery({
    queryKey: ['active-quiz-questions'],
    queryFn: async () => {
      const { data: questions, error } = await supabase
        .from('lawyer_quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('question_order', { ascending: true });

      if (error) throw error;

      // Fetch options for multiple choice questions
      const questionIds = (questions || [])
        .filter(q => q.question_type === 'multiple_choice')
        .map(q => q.id);

      let optionsMap: Record<string, QuizOption[]> = {};
      if (questionIds.length > 0) {
        const { data: options } = await supabase
          .from('lawyer_quiz_options')
          .select('*')
          .in('question_id', questionIds)
          .order('option_label', { ascending: true });

        (options || []).forEach(opt => {
          if (!optionsMap[opt.question_id]) {
            optionsMap[opt.question_id] = [];
          }
          optionsMap[opt.question_id].push(opt as QuizOption);
        });
      }

      return (questions || []).map(q => ({
        ...q,
        options: optionsMap[q.id] || []
      })) as QuizQuestion[];
    }
  });
}

// Create quiz question
export function useCreateQuizQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      question: string; 
      question_type?: 'essay' | 'multiple_choice';
      category?: string;
      question_order?: number;
      options?: { label: string; text: string; is_correct: boolean }[];
    }) => {
      // Get max order
      const { data: existing } = await supabase
        .from('lawyer_quiz_questions')
        .select('question_order')
        .order('question_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = data.question_order ?? ((existing?.question_order || 0) + 1);

      const { data: newQuestion, error } = await supabase
        .from('lawyer_quiz_questions')
        .insert({
          question: data.question,
          question_type: data.question_type || 'essay',
          category: data.category || null,
          question_order: nextOrder
        })
        .select()
        .single();

      if (error) throw error;

      // Insert options if multiple choice
      if (data.question_type === 'multiple_choice' && data.options && data.options.length > 0) {
        const optionsToInsert = data.options.map(opt => ({
          question_id: newQuestion.id,
          option_label: opt.label,
          option_text: opt.text,
          is_correct: opt.is_correct
        }));

        const { error: optError } = await supabase
          .from('lawyer_quiz_options')
          .insert(optionsToInsert);

        if (optError) throw optError;
      }

      return newQuestion;
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
      question_type,
      category,
      is_active,
      question_order,
      options
    }: { 
      id: string; 
      question?: string;
      question_type?: 'essay' | 'multiple_choice';
      category?: string | null;
      is_active?: boolean;
      question_order?: number;
      options?: { label: string; text: string; is_correct: boolean }[];
    }) => {
      const updates: Record<string, any> = {};
      if (question !== undefined) updates.question = question;
      if (question_type !== undefined) updates.question_type = question_type;
      if (category !== undefined) updates.category = category;
      if (is_active !== undefined) updates.is_active = is_active;
      if (question_order !== undefined) updates.question_order = question_order;

      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update options if provided
      if (options !== undefined) {
        // Delete existing options
        await supabase
          .from('lawyer_quiz_options')
          .delete()
          .eq('question_id', id);

        // Insert new options
        if (options.length > 0) {
          const optionsToInsert = options.map(opt => ({
            question_id: id,
            option_label: opt.label,
            option_text: opt.text,
            is_correct: opt.is_correct
          }));

          const { error: optError } = await supabase
            .from('lawyer_quiz_options')
            .insert(optionsToInsert);

          if (optError) throw optError;
        }
      }

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
      // Options will be deleted automatically due to ON DELETE CASCADE
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

// Get unique categories
export function useQuizCategories() {
  return useQuery({
    queryKey: ['quiz-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyer_quiz_questions')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;
      
      const categories = [...new Set((data || []).map(d => d.category).filter(Boolean))];
      return categories as string[];
    }
  });
}
