"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ChevronLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ProductCardGrid } from "../products/product-card-grid";
import { Product } from "@/src/types/product";

// Tipos para o quiz
type QuestionId = "target" | "wellness_goal" | "pet_size";

interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  image?: string;
}

interface QuizQuestion {
  id: QuestionId;
  question: string;
  options: QuizOption[];
}

// Estrutura de perguntas do quiz
const QUESTION_TARGET: QuizQuestion = {
  id: "target",
  question: "Who is this product for?",
  options: [
    {
      id: "myself",
      label: "Myself / Someone Else",
      emoji: "👤",
      image: "/form-step-1-image-1.webp",
    },
    {
      id: "pet",
      label: "My Pet",
      emoji: "🐾",
      image: "/form-step-1-image-2.webp",
    },
  ],
};

const QUESTION_WELLNESS_GOAL: QuizQuestion = {
  id: "wellness_goal",
  question: "What's your main wellness goal?",
  options: [
    {
      id: "balance_focus",
      label: "Daily Balance & Focus",
      emoji: "🎯",
    },
    {
      id: "relaxation",
      label: "Relaxation & Calm",
      emoji: "😌",
    },
    {
      id: "sleep",
      label: "Better Sleep",
      emoji: "💤",
    },
    {
      id: "social_mood",
      label: "Social & Mood Boost",
      emoji: "🎉",
    },
    {
      id: "advanced_wellness",
      label: "Advanced Wellness",
      emoji: "🔬",
    },
    {
      id: "pain_recovery",
      label: "Pain & Recovery",
      emoji: "💪",
    },
    {
      id: "beauty_skincare",
      label: "Beauty & Skincare",
      emoji: "✨",
    },
  ],
};

const QUESTION_PET_SIZE: QuizQuestion = {
  id: "pet_size",
  question: "What's your pet's size?",
  options: [
    {
      id: "small",
      label: "Small (<25 lbs)",
      emoji: "🐕",
    },
    {
      id: "medium_large",
      label: "Medium/Large (25-75 lbs)",
      emoji: "🐕‍🦺",
    },
  ],
};

// Mapeamento de palavras-chave para filtrar produtos
// Palavras-chave são ordenadas por prioridade (mais específicas primeiro)
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  // Wellness goals (humanos)
  balance_focus: ["balance", "focus", "pure", "softgel", "capsule", "daily"],
  relaxation: ["calm", "relax", "chill", "ease", "softgel"],
  sleep: ["sleep", "night", "rest", "dream", "melatonin"],
  social_mood: ["social", "mood", "boost", "micro", "happy"],
  advanced_wellness: ["science", "advanced", "wellness", "formula"],
  pain_recovery: ["relief", "cream", "recovery", "gel", "pain", "topical"],
  beauty_skincare: ["serum", "face", "body", "lotion", "skin", "beauty"],
  // Pet sizes
  small: ["pet", "250", "treat", "small"],
  medium_large: ["pet", "450", "treat", "large", "medium"],
};

interface QuestionsFormProps {
  products: Product[];
}

export function QuestionsForm({ products }: QuestionsFormProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<QuestionId, string>>({} as Record<QuestionId, string>);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Determina as perguntas baseado nas respostas
  const questions = useMemo(() => {
    const questionList: QuizQuestion[] = [QUESTION_TARGET];

    if (answers.target === "myself") {
      questionList.push(QUESTION_WELLNESS_GOAL);
    } else if (answers.target === "pet") {
      questionList.push(QUESTION_PET_SIZE);
    }

    return questionList;
  }, [answers.target]);

  const currentQuestion = useMemo(
    () => questions[currentStep],
    [questions, currentStep]
  );

  const isLastQuestion = useMemo(
    () => currentStep === questions.length - 1 && questions.length > 1,
    [currentStep, questions.length]
  );

  // Filtra produtos baseado nas respostas
  const recommendedProducts = useMemo(() => {
    if (!showResults) return [];

    // Determina qual resposta usar para filtrar
    const filterKey = answers.target === "myself"
      ? answers.wellness_goal
      : answers.pet_size;

    if (!filterKey) return products.slice(0, 4);

    const keywords = PRODUCT_KEYWORDS[filterKey] || [];

    // Calcula score de relevância para cada produto
    const scoredProducts = products.map((product) => {
      const nameText = product.name.toLowerCase();
      const fullText = `${product.name} ${product.description} ${product.cbdType} ${product.productCategory}`.toLowerCase();

      let score = 0;

      keywords.forEach((keyword, index) => {
        const keywordLower = keyword.toLowerCase();
        // Match no nome vale mais pontos (10 pontos)
        if (nameText.includes(keywordLower)) {
          score += 10 - index; // Palavras-chave mais no início da lista valem mais
        }
        // Match na descrição/tipo/categoria vale menos (3 pontos)
        else if (fullText.includes(keywordLower)) {
          score += 3;
        }
      });

      return { product, score };
    });

    // Filtra produtos com score > 0 e ordena por score (maior primeiro)
    const filtered = scoredProducts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);

    // Se encontrou produtos, retorna até 4
    if (filtered.length > 0) {
      return filtered.slice(0, 4);
    }

    // Fallback: retorna os primeiros 4 produtos
    return products.slice(0, 4);
  }, [showResults, answers, products]);

  const handleSelectOption = useCallback(
    (optionId: string) => {
      const questionId = currentQuestion.id;

      setAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));

      setTimeout(() => {
        // Se é a primeira pergunta, avança para a próxima
        if (currentStep === 0) {
          setCurrentStep(1);
        } else if (isLastQuestion) {
          // Se é a última pergunta, mostra loading e resultados
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
            setShowResults(true);
          }, 1500);
        }
      }, 150);
    },
    [currentQuestion?.id, currentStep, isLastQuestion]
  );

  const handleBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      setHasStarted(false);
    }
  }, [showResults, currentStep]);

  const handleReset = useCallback(() => {
    setShowResults(false);
    setCurrentStep(0);
    setAnswers({} as Record<QuestionId, string>);
    setHasStarted(false);
  }, []);

  const handleStartQuiz = useCallback(() => {
    setHasStarted(true);
  }, []);

  return (
    <section className="xl:pt-12">
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-3xl bg-[#555555]/30 rounded-3xl border border-white/20 p-8 md:p-12 shadow-2xl flex flex-col min-h-[400px]">
          {/* Initial Screen */}
          {!hasStarted && !isLoading && !showResults && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-semibold text-white text-center mb-6 max-w-2xl">
                Find Your Perfect CBD Product
              </h2>
              <p className="text-white/80 text-lg text-center mb-8 max-w-xl">
                Take our quick quiz to find the perfect CBD products tailored to
                your needs.
              </p>
              <Button
                size={"lg"}
                onClick={handleStartQuiz}
                className="bg-primary hover:bg-primary/90 text-theme-accent-secondary cursor-pointer rounded-full py-6 pr-1 text-lg font-semibold"
              >
                Start Quiz
                <div className="bg-theme-accent-secondary p-3 flex justify-center items-center rounded-full">
                  <ArrowRight color="white" />
                </div>
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
              <p className="text-white text-xl">
                Finding your perfect products...
              </p>
            </div>
          )}

          {/* Results View */}
          {!isLoading && showResults && (
            <div className="flex-1 flex flex-col">
              <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-8">
                Recommended Products For You
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {recommendedProducts.map((product) => (
                  <ProductCardGrid key={product.id} product={product} />
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  size={"lg"}
                  variant="default"
                  onClick={handleReset}
                  className="text-theme-accent-secondary rounded-full cursor-pointer"
                >
                  <RotateCcw />
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}

          {/* Question View */}
          {!isLoading && !showResults && hasStarted && currentQuestion && (
            <>
              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mb-6">
                {[0, 1].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-16 rounded-full transition-colors ${
                      step <= currentStep ? "bg-primary" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Question Title */}
              <h2
                key={`question-${currentStep}`}
                className="text-2xl md:text-3xl font-semibold text-white text-center mb-8 max-w-2xl mx-auto h-20 flex items-center justify-center animate-in fade-in zoom-in-90 duration-1000"
              >
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="flex-1 flex items-center justify-center mb-8">
                <div
                  key={`options-${currentStep}`}
                  className={`flex flex-wrap gap-4 w-full justify-center animate-in fade-in zoom-in-90 duration-1000 ${
                    currentQuestion.options.length > 4 ? "max-w-5xl" : "max-w-4xl"
                  }`}
                >
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                        currentQuestion.options.length > 4 ? "w-[150px]" : "w-[180px]"
                      } ${
                        answers[currentQuestion.id] === option.id
                          ? "ring-4 ring-primary scale-105"
                          : "hover:scale-105 ring-2 ring-white/20"
                      }`}
                    >
                      <div className={`bg-white/90 backdrop-blur-sm p-4 h-full flex flex-col items-center justify-center ${
                        currentQuestion.options.length > 4 ? "min-h-[140px]" : "min-h-[200px]"
                      }`}>
                        {option.image ? (
                          <div className="relative w-full aspect-square mb-3 rounded-xl overflow-hidden bg-gray-100">
                            <Image
                              src={option.image}
                              alt={option.label}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-4xl mb-3">{option.emoji}</span>
                        )}
                        <p className="text-sm md:text-base font-medium text-secondary text-center">
                          {option.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {currentStep > 0 && (
                <div className="flex justify-center gap-4 items-center">
                  <Button
                    size={"lg"}
                    variant="default"
                    onClick={handleBack}
                    className="text-theme-accent-secondary rounded-full cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
