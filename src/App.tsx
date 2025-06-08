import React, { useState } from 'react';
import { RichMenuCanvas } from './components/RichMenuCanvas';
import { ActionAreaEditor } from './components/ActionAreaEditor';
import { RichMenuSettings } from './components/RichMenuSettings';
import { RichMenuTemplate, ActionArea } from './types/richMenu';
import { Menu, X } from 'lucide-react';

function App() {
  const [template, setTemplate] = useState<RichMenuTemplate>({
    size: { width: 2500, height: 1686 },
    selected: true,
    name: 'My Rich Menu',
    chatBarText: 'Menu',
    areas: [],
  });

  const [selectedArea, setSelectedArea] = useState<ActionArea | null>(null);
  const [imageUrl, setImageUrl] = useState('https://images.pexels.com/photos/1005644/pexels-photo-1005644.jpeg?auto=compress&cs=tinysrgb&w=2500&h=1686&fit=crop');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleAreasChange = (areas: ActionArea[]) => {
    setTemplate(prev => ({ ...prev, areas }));
    
    // Update selected area if it was modified
    if (selectedArea) {
      const updatedArea = areas.find(area => area.id === selectedArea.id);
      setSelectedArea(updatedArea || null);
    }
  };

  const handleAreaUpdate = (updatedArea: ActionArea) => {
    const updatedAreas = template.areas.map(area =>
      area.id === updatedArea.id ? updatedArea : area
    );
    handleAreasChange(updatedAreas);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Menu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LINE Rich Menu Builder</h1>
                <p className="text-sm text-gray-500">Create interactive rich menus for your LINE bot</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Canvas Area */}
          <div className="flex-1">
            <RichMenuCanvas
              imageUrl={imageUrl}
              areas={template.areas}
              onAreasChange={handleAreasChange}
              canvasSize={template.size}
              onAreaSelect={setSelectedArea}
              selectedArea={selectedArea}
            />
          </div>

          {/* Sidebar */}
          <div className={`lg:w-80 space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <ActionAreaEditor
              area={selectedArea}
              onAreaUpdate={handleAreaUpdate}
            />
            
            <RichMenuSettings
              template={template}
              onTemplateUpdate={setTemplate}
              imageUrl={imageUrl}
              onImageUrlChange={setImageUrl}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Built for LINE developers to create rich menus easily. 
              <br />
              Get your channel access token from the 
              <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 ml-1">
                LINE Developers Console
              </a>
              <br />
              <a>Powered by Icepon</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;