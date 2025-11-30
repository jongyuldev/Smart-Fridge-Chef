import React from 'react';
import { Clock, Flame, ChefHat, AlertCircle } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const missingCount = recipe.ingredients.filter(i => i.isMissing).length;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 mb-2 flex-wrap">
            {recipe.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                {tag}
              </span>
            ))}
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {recipe.difficulty}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-slate-500 text-sm line-clamp-3 mb-4">
          {recipe.description}
        </p>

        <div className="flex items-center gap-4 text-slate-400 text-sm mt-auto">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.prepTimeMinutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{recipe.calories} kcal</span>
          </div>
        </div>

        {missingCount > 0 && (
          <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{missingCount} missing ingredient{missingCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-emerald-50 transition-colors">
        <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700">View Recipe</span>
        <ChefHat className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
      </div>
    </div>
  );
};