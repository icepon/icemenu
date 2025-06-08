import React from 'react';
import { ActionArea } from '../types/richMenu';
import { Settings, Link, MessageSquare, Calendar } from 'lucide-react';

interface ActionAreaEditorProps {
  area: ActionArea | null;
  onAreaUpdate: (area: ActionArea) => void;
}

export const ActionAreaEditor: React.FC<ActionAreaEditorProps> = ({
  area,
  onAreaUpdate,
}) => {
  if (!area) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Area Selected</h3>
          <p className="text-sm">Select an action area on the canvas to configure its properties.</p>
        </div>
      </div>
    );
  }

  const updateAction = (updates: Partial<ActionArea['action']>) => {
    onAreaUpdate({
      ...area,
      action: { ...area.action, ...updates },
    });
  };

  const renderActionFields = () => {
    switch (area.action.type) {
      case 'uri':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                URL
              </label>
              <input
                type="url"
                value={area.action.uri || ''}
                onChange={(e) => updateAction({ uri: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'postback':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postback Data
              </label>
              <input
                type="text"
                value={area.action.data || ''}
                onChange={(e) => updateAction({ data: e.target.value })}
                placeholder="action=buy&item=001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Text (Optional)
              </label>
              <input
                type="text"
                value={area.action.displayText || ''}
                onChange={(e) => updateAction({ displayText: e.target.value })}
                placeholder="Text shown to user"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Message Text
              </label>
              <textarea
                value={area.action.text || ''}
                onChange={(e) => updateAction({ text: e.target.value })}
                placeholder="Message to send"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'datetimepicker':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Picker Mode
              </label>
              <select
                value={area.action.mode || 'date'}
                onChange={(e) => updateAction({ mode: e.target.value as 'date' | 'time' | 'datetime' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="datetime">Date & Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postback Data
              </label>
              <input
                type="text"
                value={area.action.data || ''}
                onChange={(e) => updateAction({ data: e.target.value })}
                placeholder="action=schedule"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Area Settings</h3>

      <div className="space-y-6">
        {/* Position and Size */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Position & Size</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">X Position</label>
              <div className="px-3 py-2 bg-gray-50 border rounded">{area.bounds.x}px</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Y Position</label>
              <div className="px-3 py-2 bg-gray-50 border rounded">{area.bounds.y}px</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Width</label>
              <div className="px-3 py-2 bg-gray-50 border rounded">{area.bounds.width}px</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Height</label>
              <div className="px-3 py-2 bg-gray-50 border rounded">{area.bounds.height}px</div>
            </div>
          </div>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Type
          </label>
          <select
            value={area.action.type}
            onChange={(e) => updateAction({ 
              type: e.target.value as ActionArea['action']['type'],
              uri: undefined,
              data: undefined,
              text: undefined,
              displayText: undefined,
              mode: undefined,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="uri">Open URL</option>
            <option value="postback">Postback</option>
            <option value="message">Send Message</option>
            <option value="datetimepicker">Date/Time Picker</option>
          </select>
        </div>

        {/* Action-specific fields */}
        {renderActionFields()}
      </div>
    </div>
  );
};