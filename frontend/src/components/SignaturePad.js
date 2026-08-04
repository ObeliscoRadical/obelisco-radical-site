import React, { useRef, useEffect, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel, width = 400, height = 200 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Set drawing style
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Fill with dark background
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, width, height);
    
    // Draw signature line
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    
    // Reset stroke style
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
  }, [width, height]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and redraw background
    ctx.fillStyle = '#18181B';
    ctx.fillRect(0, 0, width, height);
    
    // Redraw signature line
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    
    // Reset stroke style
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-4" data-testid="signature-pad">
      <div className="text-center">
        <p className="text-sm text-zinc-400 mb-2">Assinatura do Cliente</p>
        <p className="text-xs text-zinc-500">Desenhe a assinatura na area abaixo</p>
      </div>
      
      <div className="border border-zinc-700 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          data-testid="signature-canvas"
          className="w-full touch-none cursor-crosshair"
          style={{ maxWidth: '100%', height: 'auto', aspectRatio: `${width}/${height}` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearSignature}
          className="flex-1 py-2 px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
          data-testid="signature-clear"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
          data-testid="signature-cancel"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={saveSignature}
          disabled={!hasSignature}
          className="flex-1 py-2 px-4 bg-[#FFD700] text-black font-bold hover:bg-[#FFD700]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="signature-save"
        >
          <Check className="w-4 h-4" />
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
