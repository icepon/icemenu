import React, { useState } from 'react';
import { RichMenuTemplate } from '../types/richMenu';
import { Image, Download, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface RichMenuSettingsProps {
  template: RichMenuTemplate;
  onTemplateUpdate: (template: RichMenuTemplate) => void;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
}

export const RichMenuSettings: React.FC<RichMenuSettingsProps> = ({
  template,
  onTemplateUpdate,
  imageUrl,
  onImageUrlChange,
}) => {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const updateTemplate = (updates: Partial<RichMenuTemplate>) => {
    onTemplateUpdate({ ...template, ...updates });
  };

  const handleSizeChange = (width: number, height: number) => {
    updateTemplate({
      size: { width, height },
    });
  };

  const exportToJSON = () => {
    const richMenuData = {
      size: template.size,
      selected: template.selected,
      name: template.name,
      chatBarText: template.chatBarText,
      areas: template.areas,
    };

    const blob = new Blob([JSON.stringify(richMenuData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'rich-menu'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus({ type: 'success', message: 'Rich menu JSON exported successfully!' });
    setTimeout(() => setStatus(null), 3000);
  };

  const applyToLine = async () => {
    if (!accessToken.trim()) {
      setStatus({ type: 'error', message: 'Please enter your LINE channel access token' });
      return;
    }

    if (!imageUrl.trim()) {
      setStatus({ type: 'error', message: 'Please provide an image URL for the rich menu' });
      return;
    }

    if (template.areas.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one action area' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // Use the edge function URL - you'll need to replace this with your actual Supabase project URL
      const baseUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:54321/functions/v1/line-richmenu'
        : 'https://your-project.supabase.co/functions/v1/line-richmenu';

      // Create rich menu
      const richMenuData = {
        size: template.size,
        selected: template.selected,
        name: template.name,
        chatBarText: template.chatBarText,
        areas: template.areas,
      };

      const createResponse = await fetch(`${baseUrl}?action=create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(richMenuData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to create rich menu: ${createResponse.status}`);
      }

      const { richMenuId } = await createResponse.json();

      // Upload image
      const uploadResponse = await fetch(`${baseUrl}?action=upload-image&richMenuId=${richMenuId}&imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to upload image');
      }

      // Set as default (optional)
      const setDefaultResponse = await fetch(`${baseUrl}?action=set-default&richMenuId=${richMenuId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (setDefaultResponse.ok) {
        setStatus({ type: 'success', message: 'Rich menu created and set as default successfully!' });
      } else {
        setStatus({ type: 'success', message: 'Rich menu created successfully! (Not set as default)' });
      }

    } catch (error) {
      console.error('Error applying rich menu:', error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to apply rich menu' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rich Menu Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Name
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => updateTemplate({ name: e.target.value })}
              placeholder="My Rich Menu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat Bar Text
            </label>
            <input
              type="text"
              value={template.chatBarText}
              onChange={(e) => updateTemplate({ chatBarText: e.target.value })}
              placeholder="Menu"
              maxLength={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 14 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSizeChange(2500, 1686)}
                className={`p-3 border-2 rounded-md text-sm font-medium transition-colors ${
                  template.size.width === 2500 && template.size.height === 1686
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Full Size
                <div className="text-xs text-gray-500">2500×1686</div>
              </button>
              <button
                onClick={() => handleSizeChange(2500, 843)}
                className={`p-3 border-2 rounded-md text-sm font-medium transition-colors ${
                  template.size.width === 2500 && template.size.height === 843
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Compact
                <div className="text-xs text-gray-500">2500×843</div>
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="selected"
              checked={template.selected}
              onChange={(e) => updateTemplate({ selected: e.target.checked })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="selected" className="ml-2 block text-sm text-gray-700">
              Set as default rich menu
            </label>
          </div>
        </div>
      </div>

      {/* Image Settings */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <Image className="w-5 h-5 inline mr-2" />
          Background Image
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/rich-menu-image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Image should be {template.size.width}×{template.size.height} pixels, JPEG or PNG format
          </p>
        </div>
      </div>

      {/* Export & Apply */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Apply</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LINE Channel Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Your LINE channel access token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your token from LINE Developers Console
            </p>
          </div>

          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              status.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{status.message}</span>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Setup Required</p>
                <p>To use the LINE API integration, you need to set up Supabase Edge Functions. The serverless function has been created but needs to be deployed to your Supabase project.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToJSON}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            
            <button
              onClick={applyToLine}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Applying...' : 'Apply to LINE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};