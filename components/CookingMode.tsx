import React, { useState, useEffect } from 'react';
import { X, Volume2, ChevronRight, ChevronLeft, Check, ShoppingCart } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { Button } from './Button';
import { generateSpeech } from '../services/geminiService';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onAddMissingIngredients: (ingredients: Ingredient[]) => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ 
  recipe, 
  onClose,
  onAddMissingIngredients
}) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Overview
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const totalSteps = recipe.steps.length;

  useEffect(() => {
    // Stop audio when changing steps or closing
    if (audio) {
      audio.pause();
      setAudio(null);
      setIsPlaying(false);
    }
    setAudioUrl(null);
  }, [currentStep]);

  const handleSpeak = async () => {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl) {
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
      return;
    }

    setLoadingAudio(true);
    try {
      const textToSpeak = currentStep === -1 
        ? `Let's cook ${recipe.title}. It takes about ${recipe.prepTimeMinutes} minutes. You will need: ${recipe.ingredients.map(i => i.name).join(', ')}.`
        : `Step ${currentStep + 1}. ${recipe.steps[currentStep]}`;
      
      const url = await generateSpeech(textToSpeak);
      setAudioUrl(url);
      
      const newAudio = new Audio(url);
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to generate speech", err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const missingIngredients = recipe.ingredients.filter(i => i.isMissing);

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <h2 className="text-lg font-semibold truncate max-w-md">
          {recipe.title}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-slate-800">
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        {currentStep === -1 ? (
          <div className="max-w-2xl w-full animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-8 text-emerald-400">
              Ready to Cook?
            </h1>
            
            <div className="grid md:grid-cols-2 gap-8 text-left bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">1</span>
                  Ingredients
                </h3>
                <ul className="space-y-2 text-slate-300">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between border-b border-slate-700/50 pb-1 last:border-0">
                      <span>{ing.name}</span>
                      <span className="text-slate-500">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Details</h3>
                  <div className="space-y-4 text-slate-300">
                    <p>🔥 {recipe.calories} Calories</p>
                    <p>⏱️ {recipe.prepTimeMinutes} Minutes Prep</p>
                    <p>⚡ Difficulty: {recipe.difficulty}</p>
                  </div>
                </div>

                {missingIngredients.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-amber-400 text-sm mb-3">You are missing {missingIngredients.length} ingredients</p>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        onAddMissingIngredients(missingIngredients);
                        alert("Added missing items to your shopping list!");
                      }}
                      className="w-full text-sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to List
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl w-full animate-fade-in-up">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <h2 className="text-2xl md:text-4xl font-medium leading-relaxed">
                {recipe.steps[currentStep]}
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button 
            variant="secondary"
            onClick={() => setCurrentStep(prev => Math.max(-1, prev - 1))}
            disabled={currentStep === -1}
            className="w-32"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>

          <Button 
            variant="outline"
            onClick={handleSpeak}
            className={`rounded-full w-14 h-14 p-0 flex items-center justify-center border-2 ${
              isPlaying ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-slate-600 text-slate-400 hover:text-white hover:border-white'
            }`}
            isLoading={loadingAudio}
          >
            <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button 
              variant="primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="w-32"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button 
              variant="primary"
              onClick={onClose}
              className="w-32 bg-green-600 hover:bg-green-700"
            >
              Finish
              <Check className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};