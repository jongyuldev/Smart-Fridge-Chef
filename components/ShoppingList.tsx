import React from 'react';
import { ShoppingBag, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { ShoppingItem } from '../types';
import { Button } from './Button';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  onToggleItem, 
  onRemoveItem, 
  onAddItem,
  isOpen,
  onClose
}) => {
  const [newItemName, setNewItemName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } flex flex-col`}>
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Shopping List</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your list is empty.</p>
              <p className="text-xs">Add missing ingredients from recipes.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.id} className="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <button 
                    onClick={() => onToggleItem(item.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {item.checked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                    )}
                    <span className={`text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.name} {item.amount && <span className="text-slate-400 text-xs">({item.amount})</span>}
                    </span>
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add item..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
            <Button type="submit" size="sm" disabled={!newItemName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </form>

      </div>
    </>
  );
};