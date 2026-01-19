import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { type QuizQuestion, type QuizOption } from "@/hooks/useLawyerQuiz";

interface QuizQuestionFormProps {
  initialData?: QuizQuestion;
  onSubmit: (data: {
    question: string;
    question_type: 'essay' | 'multiple_choice';
    category: string;
    options?: { label: string; text: string; is_correct: boolean }[];
  }) => void;
  isPending?: boolean;
  categories?: string[];
}

export function QuizQuestionForm({ initialData, onSubmit, isPending, categories = [] }: QuizQuestionFormProps) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [questionType, setQuestionType] = useState<'essay' | 'multiple_choice'>(
    initialData?.question_type || 'essay'
  );
  const [category, setCategory] = useState(initialData?.category || "");
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [options, setOptions] = useState<{ label: string; text: string; is_correct: boolean }[]>(
    initialData?.options?.map(o => ({
      label: o.option_label,
      text: o.option_text,
      is_correct: o.is_correct
    })) || [
      { label: 'A', text: '', is_correct: false },
      { label: 'B', text: '', is_correct: false },
      { label: 'C', text: '', is_correct: false },
      { label: 'D', text: '', is_correct: false },
    ]
  );

  const handleAddOption = () => {
    const nextLabel = String.fromCharCode(65 + options.length); // A, B, C, D, E...
    if (options.length < 6) {
      setOptions([...options, { label: nextLabel, text: '', is_correct: false }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Re-label options
      const relabeled = newOptions.map((opt, i) => ({
        ...opt,
        label: String.fromCharCode(65 + i)
      }));
      setOptions(relabeled);
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const finalCategory = useNewCategory ? newCategory : category;
    
    if (questionType === 'multiple_choice') {
      const validOptions = options.filter(o => o.text.trim());
      const hasCorrect = validOptions.some(o => o.is_correct);
      
      if (validOptions.length < 2) {
        return; // Need at least 2 options
      }
      if (!hasCorrect) {
        return; // Need a correct answer
      }

      onSubmit({
        question,
        question_type: questionType,
        category: finalCategory,
        options: validOptions
      });
    } else {
      onSubmit({
        question,
        question_type: questionType,
        category: finalCategory
      });
    }
  };

  const isValid = question.trim().length > 0 && (
    questionType === 'essay' || (
      options.filter(o => o.text.trim()).length >= 2 &&
      options.some(o => o.is_correct && o.text.trim())
    )
  );

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-3">
        <Label>Kategori</Label>
        <div className="flex items-center gap-2 mb-2">
          <Switch 
            checked={useNewCategory} 
            onCheckedChange={setUseNewCategory} 
            id="new-cat"
          />
          <Label htmlFor="new-cat" className="text-sm font-normal">
            Buat kategori baru
          </Label>
        </div>
        {useNewCategory ? (
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
            placeholder="Contoh: PERDATA, PIDANA, ADMINISTRASI"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={category === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("")}
            >
              Tanpa Kategori
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                type="button"
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Question Type */}
      <div className="space-y-3">
        <Label>Tipe Pertanyaan</Label>
        <RadioGroup 
          value={questionType} 
          onValueChange={(v) => setQuestionType(v as 'essay' | 'multiple_choice')}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="essay" id="type-essay" />
            <Label htmlFor="type-essay" className="font-normal cursor-pointer">Essay</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiple_choice" id="type-mc" />
            <Label htmlFor="type-mc" className="font-normal cursor-pointer">Pilihan Ganda</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <Label>Pertanyaan</Label>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Masukkan pertanyaan untuk calon lawyer..."
          rows={4}
        />
      </div>

      {/* Options for Multiple Choice */}
      {questionType === 'multiple_choice' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pilihan Jawaban</Label>
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex items-center h-10 px-2 text-sm font-medium text-muted-foreground">
                  <GripVertical className="w-4 h-4 mr-1 opacity-50" />
                  {option.label}.
                </div>
                <div className="flex-1">
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Pilihan ${option.label}`}
                  />
                </div>
                <div className="flex items-center h-10 gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={option.is_correct}
                      onChange={() => handleCorrectChange(index)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-xs text-muted-foreground">Benar</span>
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Pilih satu jawaban yang benar dengan mengklik radio button "Benar"
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isPending || !isValid}
      >
        {initialData ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}
      </Button>
    </div>
  );
}
