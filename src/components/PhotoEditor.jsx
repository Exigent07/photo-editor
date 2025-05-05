"use client";

import { useState, useRef, useEffect } from 'react';
import ImageCanvas from './ImageCanvas';
import ControlPanel from './ControlPanel';
import HistoryViewer from './HistoryViewer';

export default function PhotoEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setProcessedImage(img);
        
        setImageHistory([img]);
        setHistoryIndex(0);
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const createThumbnail = (image, width = 80) => {
    const canvas = document.createElement('canvas');
    const aspectRatio = image.width / image.height;
    canvas.width = width;
    canvas.height = width / aspectRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.5);
  };

  const applyFilter = (filterName, params = {}, isPreview = false) => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(processedImage, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      try {
        const src = window.cv.matFromImageData(imgData);
        let dst = new window.cv.Mat();
        
        switch (filterName) {
          case 'grayscale':
            window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY, 0);
            window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGBA, 0);
            break;
          case 'blur':
            const ksize = params.ksize || 5;
            window.cv.GaussianBlur(src, dst, new window.cv.Size(ksize, ksize), 0, 0, window.cv.BORDER_DEFAULT);
            break;
          case 'canny':
            let gray = new window.cv.Mat();
            window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
            window.cv.Canny(gray, dst, 50, 150);
            window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGBA);
            gray.delete();
            break;
          case 'threshold':
            let grayThresh = new window.cv.Mat();
            window.cv.cvtColor(src, grayThresh, window.cv.COLOR_RGBA2GRAY);
            window.cv.threshold(grayThresh, dst, params.thresh || 127, 255, window.cv.THRESH_BINARY);
            window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGBA);
            grayThresh.delete();
            break;
          case 'brightness':
            dst = src.clone();
            const alpha = params.alpha || 1.5;
            const beta = params.beta || 0;
            
            let channels = new window.cv.MatVector();
            window.cv.split(dst, channels);
            
            for (let i = 0; i < 3; i++) {
              channels.get(i).convertTo(channels.get(i), -1, alpha, beta);
            }
            
            window.cv.merge(channels, dst);
            channels.delete();
            break;
          case 'rotation':
            const angle = params.angle || 90;
            const center = new window.cv.Point(src.cols / 2, src.rows / 2);
            const rotMatrix = window.cv.getRotationMatrix2D(center, angle, 1);
            window.cv.warpAffine(src, dst, rotMatrix, new window.cv.Size(src.cols, src.rows));
            rotMatrix.delete();
            break;
          default:
            dst = src.clone();
        }
        
        window.cv.imshow(canvas, dst);
        
        const newImg = new Image();
        newImg.src = canvas.toDataURL();
        
        newImg.onload = () => {
          setProcessedImage(newImg);
          
          if (!isPreview) {
            const newHistory = imageHistory.slice(0, historyIndex + 1);
            newHistory.push(newImg);
            setImageHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
          }
          
          setIsProcessing(false);
        };
        
        src.delete();
        dst.delete();
      } catch (error) {
        console.error('Error applying filter:', error);
        setIsProcessing(false);
      }
    }, 50);
  };

  const resetImage = () => {
    if (originalImage) {
      setProcessedImage(originalImage);
      setImageHistory([originalImage]);
      setHistoryIndex(0);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setProcessedImage(imageHistory[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < imageHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setProcessedImage(imageHistory[historyIndex + 1]);
    }
  };

  const saveImage = () => {
    if (!processedImage) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = processedImage.width;
    canvas.height = processedImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(processedImage, 0, 0);
    
    const link = document.createElement('a');
    link.download = 'edited-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const jumpToHistory = (index) => {
    if (index >= 0 && index < imageHistory.length) {
      setHistoryIndex(index);
      setProcessedImage(imageHistory[index]);
    }
  };

  return (
    <div className="w-full h-full mx-auto flex flex-col items-center justify-center gap-4 p-4 bg-base-200 min-h-screen">
      <header className="navbar bg-base-100 rounded-box shadow">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <div className="avatar avatar-placeholder">
              <div className="bg-primary text-primary-content rounded-lg w-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-bold">PhotoPro Editor</h1>
          </div>
        </div>
        
        <div className="navbar-end">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
          
          {processedImage && (
            <div className="join mr-2">
              <button onClick={undo} disabled={!processedImage || historyIndex <= 0} 
                className="btn btn-sm btn-circle join-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <button onClick={redo} disabled={!processedImage || historyIndex >= imageHistory.length - 1}
                className="btn btn-sm btn-circle join-item">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <button onClick={resetImage} className="btn btn-sm join-item">
                Reset
              </button>
              
              <button onClick={() => setHistoryVisible(!historyVisible)} 
                className={`btn btn-sm join-item ${historyVisible ? 'btn-accent' : ''}`}>
                {historyVisible ? 'Hide History' : 'History'}
              </button>
              
              <button onClick={saveImage} className="btn btn-sm btn-success join-item">
                Save
              </button>
            </div>
          )}
          
          <button 
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
          >
            {processedImage ? 'Change Image' : 'Upload Image'}
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {processedImage ? (
          <>
            <div className="flex-1 card bg-base-100 shadow-md relative">
              <div className="card-body">
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                      <p className="font-medium">Processing...</p>
                    </div>
                  </div>
                )}
                
                <ImageCanvas image={processedImage} />
                
                {historyVisible && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <HistoryViewer 
                      history={imageHistory} 
                      currentIndex={historyIndex}
                      onSelect={jumpToHistory}
                      createThumbnail={createThumbnail}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full lg:w-72 card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title">Edit Tools</h2>
                <ControlPanel 
                  applyFilter={applyFilter}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < imageHistory.length - 1}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="card bg-base-100 shadow-md w-full">
            <div className="card-body items-center text-center py-16">
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral-content rounded-full w-32 h-32">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4">Welcome to PhotoPro Editor</h2>
              <p className="py-4 max-w-md">
                Upload an image to start editing with our powerful yet simple tools
              </p>
              <div className="card-actions">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => fileInputRef.current.click()}
                >
                  Upload an Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="footer footer-center p-4 text-base-content mt-auto">
        <div>
          <p>© 2025 PhotoPro Editor • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}