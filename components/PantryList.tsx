import React, { useState } from 'react';
import { Package, Plus, Trash2, X } from 'lucide-react';
import { PantryItem } from '../types';
import { Button } from './Button';

interface PantryListProps {
  items: PantryItem[];
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PantryList: React.FC<PantryListProps> = ({ 
  items, 
  onRemoveItem, 
  onAddItem,
  isOpen,
  onClose
}) => {
  const [newItemName, setNewItemName] = useState('');

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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } flex flex-col`}>
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-800 text-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h2 className="font-semibold text-lg">My Pantry</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your pantry is empty.</p>
              <p className="text-xs">Add common staples like flour, spices, or oils.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.id} className="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="text-slate-700 font-medium px-2">
                    {item.name}
                  </span>
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
              placeholder="e.g. Olive Oil, Salt..."
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