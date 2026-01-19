import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Scale, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLawyerProfile } from "@/hooks/useLawyerProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveQuizQuestions, type QuizQuestion } from "@/hooks/useLawyerQuiz";

export default function LawyerQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useLawyerProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch quiz questions with options
  const { data: questions = [], isLoading: questionsLoading } = useActiveQuizQuestions();

  // Check if already completed
  useEffect(() => {
    if (profile?.quiz_completed) {
      navigate('/lawyer/dashboard');
    }
  }, [profile, navigate]);

  // Submit answers mutation
  const submitAnswers = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile');

      // Insert all answers
      const answersToInsert = Object.entries(answers).map(([questionId, answer]) => ({
        lawyer_id: profile.id,
        question_id: questionId,
        answer
      }));

      const { error: answersError } = await supabase
        .from('lawyer_quiz_answers')
        .insert(answersToInsert);

      if (answersError) throw answersError;

      // Mark quiz as completed
      const { error: updateError } = await supabase
        .from('lawyers')
        .update({ quiz_completed: true, submitted_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawyer-profile'] });
      toast({
        title: "Pendaftaran Selesai!",
        description: "Tim kami akan meninjau aplikasi Anda. Silakan tunggu konfirmasi."
      });
      navigate('/lawyer/dashboard');
    },
    onError: () => {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive"
      });
    }
  });

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  
  // Validation: essay needs 10+ chars, multiple choice just needs selection
  const canGoNext = currentQuestion && (
    currentQuestion.question_type === 'multiple_choice' 
      ? !!answers[currentQuestion.id]
      : (answers[currentQuestion.id]?.trim().length || 0) > 10
  );
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      submitAnswers.mutate();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  if (profileLoading || questionsLoading) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </MobileLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <MobileLayout showBottomNav={false}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Scale className="w-12 h-12 text-primary mb-4" />
          <h1 className="text-xl font-bold text-center mb-2">Pendaftaran Dalam Proses</h1>
          <p className="text-muted-foreground text-center text-sm">
            Tim kami akan menghubungi Anda untuk tahap selanjutnya.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate('/lawyer/dashboard')}
          >
            Ke Dashboard
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="gradient-hero p-6 pb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Legal Connect</h1>
              <p className="text-primary-foreground/70 text-xs">Pertanyaan Verifikasi</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-primary-foreground/80">
              <span>Pertanyaan {currentIndex + 1} dari {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-primary-foreground/20" />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 px-4 -mt-6">
          <Card className="shadow-elevated">
            <CardHeader className="pb-3">
              {/* Category Badge */}
              {currentQuestion?.category && (
                <Badge variant="secondary" className="w-fit mb-2">
                  {currentQuestion.category}
                </Badge>
              )}
              <CardTitle className="text-base leading-relaxed whitespace-pre-wrap">
                {currentQuestion?.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Essay type */}
              {currentQuestion?.question_type === 'essay' && (
                <>
                  <Textarea
                    placeholder="Tulis jawaban Anda di sini... (minimal 10 karakter)"
                    value={answers[currentQuestion?.id] || ""}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [currentQuestion?.id]: e.target.value
                    })}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(answers[currentQuestion?.id] || "").length} karakter
                    {(answers[currentQuestion?.id] || "").length < 10 && " (minimal 10)"}
                  </p>
                </>
              )}

              {/* Multiple Choice type */}
              {currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => setAnswers({
                    ...answers,
                    [currentQuestion.id]: value
                  })}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option.option_label 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setAnswers({
                        ...answers,
                        [currentQuestion.id]: option.option_label
                      })}
                    >
                      <RadioGroupItem value={option.option_label} id={option.id} className="mt-0.5" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal leading-relaxed">
                        <span className="font-medium">{option.option_label}.</span> {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {currentIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Sebelumnya
                  </Button>
                )}
                
                <Button
                  variant="gradient"
                  onClick={handleNext}
                  disabled={!canGoNext || submitAnswers.isPending}
                  className="flex-1"
                >
                  {submitAnswers.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Mengirim...
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Selesai
                    </>
                  ) : (
                    <>
                      Selanjutnya
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 <span className="font-medium">Tips:</span> {
                currentQuestion?.question_type === 'multiple_choice' 
                  ? 'Pilih jawaban yang paling tepat berdasarkan pengetahuan hukum Anda.'
                  : 'Jawab dengan jujur dan detail. Jawaban Anda akan membantu kami memahami kualifikasi dan pengalaman Anda sebagai konsultan hukum.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Jawaban Anda akan ditinjau oleh tim Legal Connect
        </p>
      </div>
    </MobileLayout>
  );
}
