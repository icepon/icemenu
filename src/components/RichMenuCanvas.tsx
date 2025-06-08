import React, { useState, useRef, useCallback } from 'react';
import { ActionArea } from '../types/richMenu';
import { Plus, Move, Maximize as Resize } from 'lucide-react';

interface RichMenuCanvasProps {
  imageUrl: string;
  areas: ActionArea[];
  onAreasChange: (areas: ActionArea[]) => void;
  canvasSize: { width: number; height: number };
  onAreaSelect: (area: ActionArea | null) => void;
  selectedArea: ActionArea | null;
}

export const RichMenuCanvas: React.FC<RichMenuCanvasProps> = ({
  imageUrl,
  areas,
  onAreasChange,
  canvasSize,
  onAreaSelect,
  selectedArea,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [newArea, setNewArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (areas.length >= 10) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * canvasSize.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvasSize.height;

    setIsCreating(true);
    setNewArea({ x, y, width: 0, height: 0 });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [areas.length, canvasSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isCreating || !newArea) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = ((e.clientX - rect.left) / rect.width) * canvasSize.width;
    const currentY = ((e.clientY - rect.top) / rect.height) * canvasSize.height;

    setNewArea({
      x: Math.min(newArea.x, currentX),
      y: Math.min(newArea.y, currentY),
      width: Math.abs(currentX - newArea.x),
      height: Math.abs(currentY - newArea.y),
    });
  }, [isCreating, newArea, canvasSize]);

  const handleMouseUp = useCallback(() => {
    if (isCreating && newArea && newArea.width > 20 && newArea.height > 20) {
      const newActionArea: ActionArea = {
        id: `area-${Date.now()}`,
        bounds: {
          x: Math.round(newArea.x),
          y: Math.round(newArea.y),
          width: Math.round(newArea.width),
          height: Math.round(newArea.height),
        },
        action: {
          type: 'uri',
          uri: 'https://example.com',
        },
      };

      onAreasChange([...areas, newActionArea]);
      onAreaSelect(newActionArea);
    }

    setIsCreating(false);
    setNewArea(null);
  }, [isCreating, newArea, areas, onAreasChange, onAreaSelect]);

  const handleAreaMouseDown = useCallback((e: React.MouseEvent, area: ActionArea) => {
    e.stopPropagation();
    onAreaSelect(area);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [onAreaSelect]);

  const handleAreaMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedArea) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;

    const newX = Math.max(0, Math.min(canvasSize.width - selectedArea.bounds.width, 
      selectedArea.bounds.x + (deltaX * scaleX)));
    const newY = Math.max(0, Math.min(canvasSize.height - selectedArea.bounds.height, 
      selectedArea.bounds.y + (deltaY * scaleY)));

    const updatedAreas = areas.map(area =>
      area.id === selectedArea.id
        ? { ...area, bounds: { ...area.bounds, x: newX, y: newY } }
        : area
    );

    onAreasChange(updatedAreas);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, selectedArea, dragStart, areas, onAreasChange, canvasSize]);

  const handleAreaMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const deleteArea = useCallback((areaId: string) => {
    const updatedAreas = areas.filter(area => area.id !== areaId);
    onAreasChange(updatedAreas);
    if (selectedArea?.id === areaId) {
      onAreaSelect(null);
    }
  }, [areas, selectedArea, onAreasChange, onAreaSelect]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Rich Menu Canvas</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Plus className="w-4 h-4" />
          <span>Click and drag to create areas ({areas.length}/10)</span>
        </div>
      </div>

      <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <div
          ref={canvasRef}
          className="relative cursor-crosshair select-none"
          style={{
            width: '100%',
            maxWidth: '800px',
            aspectRatio: `${canvasSize.width}/${canvasSize.height}`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={isCreating ? handleMouseMove : isDragging ? handleAreaMouseMove : undefined}
          onMouseUp={isCreating ? handleMouseUp : isDragging ? handleAreaMouseUp : undefined}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Rich Menu Background"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          )}

          {/* Existing Areas */}
          {areas.map((area, index) => (
            <div
              key={area.id}
              className={`absolute border-2 cursor-move group transition-all duration-200 ${
                selectedArea?.id === area.id
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
              }`}
              style={{
                left: `${(area.bounds.x / canvasSize.width) * 100}%`,
                top: `${(area.bounds.y / canvasSize.height) * 100}%`,
                width: `${(area.bounds.width / canvasSize.width) * 100}%`,
                height: `${(area.bounds.height / canvasSize.height) * 100}%`,
              }}
              onMouseDown={(e) => handleAreaMouseDown(e, area)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-sm">
                  Area {index + 1}
                </div>
              </div>

              {/* Move handle */}
              <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3 text-white m-0.5" />
              </div>

              {/* Delete button */}
              <button
                className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteArea(area.id);
                }}
              >
                ×
              </button>
            </div>
          ))}

          {/* New Area Preview */}
          {isCreating && newArea && (
            <div
              className="absolute border-2 border-dashed border-green-500 bg-green-500/10"
              style={{
                left: `${(newArea.x / canvasSize.width) * 100}%`,
                top: `${(newArea.y / canvasSize.height) * 100}%`,
                width: `${(newArea.width / canvasSize.width) * 100}%`,
                height: `${(newArea.height / canvasSize.height) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>• Click and drag to create new action areas (up to 10)</p>
        <p>• Click on an area to select and configure it</p>
        <p>• Drag selected areas to reposition them</p>
      </div>
    </div>
  );
};