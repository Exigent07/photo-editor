"use client";

import { useRef, useEffect } from 'react';

export default function ImageCanvas({ image }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  }, [image]);

  if (!image) return null;

  return (
    <div className="card bg-base-100 shadow-xl overflow-auto">
      <div className="card-body p-4">
        <div className="flex justify-center items-center bg-base-200 rounded-lg p-2">
          <canvas
            ref={canvasRef}
            className="max-w-full rounded shadow-sm"
            style={{ maxHeight: '500px' }}
          />
        </div>
        <div className="text-center text-xs text-base-content/70 mt-2">
          <p>Image Size: {image.width} × {image.height} px</p>
        </div>
      </div>
    </div>
  );
}