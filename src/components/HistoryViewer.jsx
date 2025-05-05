"use client";

import { useEffect, useState } from 'react';

export default function HistoryViewer({ 
  history, 
  currentIndex, 
  onSelect,
  createThumbnail 
}) {
  const [thumbnails, setThumbnails] = useState([]);

  useEffect(() => {
    if (history && history.length > 0) {
      const thumbs = history.map(img => createThumbnail(img));
      setThumbnails(thumbs);
    }
  }, [history, createThumbnail]);

  if (!history || history.length === 0) return null;

  return (
    <div className="card bg-base-100 shadow-md mt-4">
      <div className="card-body p-4">
        <h3 className="card-title text-sm flex justify-between">
          <span>Edit History</span>
          <span className="badge badge-primary">{currentIndex + 1} / {history.length}</span>
        </h3>
        
        <div className="overflow-x-auto py-2">
          <div className="flex gap-2">
            {thumbnails.map((thumb, index) => (
              <div 
                key={index}
                className={`
                  cursor-pointer border-2 rounded-md overflow-hidden 
                  ${index === currentIndex ? 'border-primary' : 'border-base-300 opacity-70 hover:opacity-100'}
                `}
                onClick={() => onSelect(index)}
              >
                <img 
                  src={thumb} 
                  alt={`History state ${index + 1}`} 
                  className="w-16 h-16 object-cover"
                />
                <div className="text-center text-xs bg-base-200 py-1">
                  {index === 0 ? 'Original' : `Edit ${index}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}