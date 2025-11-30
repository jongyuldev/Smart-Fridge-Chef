import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, Loader2, UtensilsCrossed, Sparkles, Package } from 'lucide-react';
import { AnalysisResult, DietaryFilter, Recipe, ShoppingItem, Ingredient, PantryItem } from './types';
import { analyzeFridgeImage } from './services/geminiService';
import { UploadSection } from './components/UploadSection';
import { RecipeCard } from './components/RecipeCard';
import { ShoppingList } from './components/ShoppingList';
import { PantryList } from './components/PantryList';
import { CookingMode } from './components/CookingMode';
import { Button } from './components/Button';

const App: React.FC = () => {
  // State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<DietaryFilter>(DietaryFilter.None);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  
  const [isShoppingListOpen, setShoppingListOpen] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping-list');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPantryOpen, setPantryOpen] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem('pantry-list');
    return saved ? JSON.parse(saved) : [];
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('shopping-list', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem('pantry-list', JSON.stringify(pantryItems));
  }, [pantryItems]);

  // Handlers
  const handleImageSelected = async (base64: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const pantryNames = pantryItems.map(item => item.name);
      const result = await analyzeFridgeImage(base64, selectedDiet, pantryNames);
      setAnalysisResult(result);
    } catch (error) {
      alert("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingItems(items => items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingItems(items => items.filter(item => item.id !== id));
  };

  const addShoppingItem = (name: string, amount: string = '') => {
    const newItem: ShoppingItem = {
      id: Date.now().toString() + Math.random().toString(),
      name,
      amount,
      checked: false
    };
    setShoppingItems(prev => [newItem, ...prev]);
  };

  const addMissingIngredients = (ingredients: Ingredient[]) => {
    ingredients.forEach(ing => addShoppingItem(ing.name, ing.amount));
    setShoppingListOpen(true);
  };

  // Pantry Handlers
  const addPantryItem = (name: string) => {
    const newItem: PantryItem = {
      id: Date.now().toString() + Math.random().toString(),
      name
    };
    setPantryItems(prev => [newItem, ...prev]);
  };

  const removePantryItem = (id: string) => {
    setPantryItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <ChefHat className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-800">Smart Fridge Chef</span>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value as DietaryFilter)}
              className="hidden md:block text-sm border-slate-200 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-2 pl-3 pr-8"
            >
              {Object.values(DietaryFilter).map(filter => (
                <option key={filter} value={filter}>{filter === 'None' ? 'No Restrictions' : filter}</option>
              ))}
            </select>

            <button 
              onClick={() => setPantryOpen(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="My Pantry"
            >
              <Package className="w-6 h-6" />
              {pantryItems.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-slate-600 rounded-full border-2 border-white"></span>
              )}
            </button>

            <button 
              onClick={() => setShoppingListOpen(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Shopping List"
            >
              <ShoppingBag className="w-6 h-6" />
              {shoppingItems.filter(i => !i.checked).length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome / Upload Section */}
        {!analysisResult && !analyzing && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="text-center mb-10 space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
                Turn your <span className="text-emerald-600">Leftovers</span><br/>
                into <span className="text-emerald-600">Masterpieces</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Don't know what to cook? Just snap a photo of your open fridge, select your diet, and let AI do the magic.
              </p>
            </div>

            <div className="w-full max-w-md mb-6 md:hidden">
               <label className="block text-sm font-medium text-slate-700 mb-2">Dietary Preference</label>
               <select 
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value as DietaryFilter)}
                className="w-full text-sm border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 py-3"
              >
                {Object.values(DietaryFilter).map(filter => (
                  <option key={filter} value={filter}>{filter === 'None' ? 'No Restrictions' : filter}</option>
                ))}
              </select>
            </div>

            <UploadSection onImageSelected={handleImageSelected} isLoading={analyzing} />
            
            <div className="flex gap-8 text-slate-400 mt-12">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <UtensilsCrossed className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-sm font-medium">Get Recipes</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="p-3 bg-white rounded-full shadow-sm">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="p-3 bg-white rounded-full shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Smart List</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {analyzing && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900">Analyzing your ingredients...</h2>
              <p className="text-slate-500">Our AI chef is dreaming up delicious recipes for you.</p>
              {pantryItems.length > 0 && (
                 <p className="text-xs text-slate-400">Includes {pantryItems.length} pantry items</p>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && !analyzing && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Suggested Recipes</h2>
                <p className="text-slate-500">Based on: {analysisResult.identifiedIngredients.join(', ')}</p>
              </div>
              <Button variant="outline" onClick={() => setAnalysisResult(null)}>
                Scan New Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResult.recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onClick={() => setActiveRecipe(recipe)}
                />
              ))}
            </div>
            
            {analysisResult.recipes.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-lg text-slate-500">No recipes found matching your criteria. Try adjusting the dietary filter or taking a clearer photo.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Overlays */}
      <ShoppingList 
        items={shoppingItems}
        isOpen={isShoppingListOpen}
        onClose={() => setShoppingListOpen(false)}
        onAddItem={addShoppingItem}
        onRemoveItem={removeShoppingItem}
        onToggleItem={toggleShoppingItem}
      />

      <PantryList
        items={pantryItems}
        isOpen={isPantryOpen}
        onClose={() => setPantryOpen(false)}
        onAddItem={addPantryItem}
        onRemoveItem={removePantryItem}
      />

      {activeRecipe && (
        <CookingMode 
          recipe={activeRecipe} 
          onClose={() => setActiveRecipe(null)}
          onAddMissingIngredients={addMissingIngredients}
        />
      )}
    </div>
  );
};

export default App;