"use client";

import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Palette, Type, Ruler, X, Save, RotateCcw } from 'lucide-react';

interface ThemeEditorProps {
  onClose?: () => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ onClose }) => {
  const { theme, updateThemeColors, updateThemeTypography, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors');
  const [draftTheme, setDraftTheme] = useState(theme);

  const handleColorChange = (colorKey: string, value: string, scheme: 'light' | 'dark') => {
    const newColors = { 
      ...draftTheme.theme.colors, 
      [scheme]: { 
        ...draftTheme.theme.colors[scheme], 
        [colorKey]: value 
      } 
    };
    setDraftTheme({
      ...draftTheme,
      theme: { ...draftTheme.theme, colors: newColors }
    });
  };

  const handleTypographyChange = (key: keyof typeof theme.theme.typography, property: keyof typeof theme.theme.typography.text1, value: string) => {
    const newTypography = { 
      ...draftTheme.theme.typography, 
      [key]: { 
        ...draftTheme.theme.typography[key], 
        [property]: value 
      } 
    };
    setDraftTheme({
      ...draftTheme,
      theme: { ...draftTheme.theme, typography: newTypography }
    });
  };

  const handleSave = () => {
    setTheme(draftTheme);
    onClose?.();
  };

  const handleReset = () => {
    setDraftTheme(theme);
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Ruler }
  ] as const;

  const colorKeys = Object.keys(theme.theme.colors.light).filter(key => 
    typeof theme.theme.colors.light[key as keyof typeof theme.theme.colors.light] === 'string'
  );

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Theme Editor</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Light Theme Colors</h4>
              <div className="space-y-4">
                {colorKeys.map((key) => (
                  <div key={`light-${key}`} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={draftTheme.theme.colors.light[key as keyof typeof draftTheme.theme.colors.light] as string}
                        onChange={(e) => handleColorChange(key, e.target.value, 'light')}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={draftTheme.theme.colors.light[key as keyof typeof draftTheme.theme.colors.light] as string}
                        onChange={(e) => handleColorChange(key, e.target.value, 'light')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Dark Theme Colors</h4>
              <div className="space-y-4">
                {colorKeys.map((key) => (
                  <div key={`dark-${key}`} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={draftTheme.theme.colors.dark[key as keyof typeof draftTheme.theme.colors.dark] as string}
                        onChange={(e) => handleColorChange(key, e.target.value, 'dark')}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={draftTheme.theme.colors.dark[key as keyof typeof draftTheme.theme.colors.dark] as string}
                        onChange={(e) => handleColorChange(key, e.target.value, 'dark')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Typography</h4>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Font Family</label>
              <select
                value={draftTheme.theme.typography.text1.fontFamily}
                onChange={(e) => handleTypographyChange('text1', 'fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Montserrat, sans-serif">Montserrat</option>
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Open Sans, sans-serif">Open Sans</option>
                <option value="Poppins, sans-serif">Poppins</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Font Size</label>
              <select
                value={draftTheme.theme.typography.text1.fontSize}
                onChange={(e) => handleTypographyChange('text1', 'fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Spacing Scale</h4>
            <p className="text-sm text-gray-600">
              Spacing is controlled through Tailwind CSS classes. Use px-4, py-8, etc.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
      </div>
    </div>
  );
};
