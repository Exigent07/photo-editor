"use client";

import { useState, useEffect } from 'react';

export default function ControlPanel({ 
  applyFilter, 
  canUndo,
  canRedo
}) {
  const [blurSize, setBlurSize] = useState(5);
  const [thresholdValue, setThresholdValue] = useState(127);
  const [brightnessValue, setBrightnessValue] = useState(0);
  const [contrastValue, setContrastValue] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(90);
  const [activeTab, setActiveTab] = useState("basic");

  const applyPreviewFilter = (filterName, params) => {
    applyFilter(filterName, params, true);
  };

  const applyFinalFilter = (filterName, params) => {
    applyFilter(filterName, params, false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "blur") {
        applyPreviewFilter('blur', { ksize: blurSize });
      }
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [blurSize, activeTab]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "threshold") {
        applyPreviewFilter('threshold', { thresh: thresholdValue });
      }
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [thresholdValue, activeTab]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "brightness") {
        applyPreviewFilter('brightness', { alpha: contrastValue, beta: brightnessValue });
      }
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [brightnessValue, contrastValue, activeTab]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === "rotation") {
        applyPreviewFilter('rotation', { angle: rotationAngle });
      }
    }, 200);
    return () => clearTimeout(debounceTimer);
  }, [rotationAngle, activeTab]);

  return (
    <div>
      <div className="tabs tabs-boxed mb-4">
        <a 
          className={`tab ${activeTab === "basic" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic
        </a>
        <a 
          className={`tab ${activeTab === "blur" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("blur")}
        >
          Blur
        </a>
        <a 
          className={`tab ${activeTab === "threshold" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("threshold")}
        >
          Threshold
        </a>
        <a 
          className={`tab ${activeTab === "brightness" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("brightness")}
        >
          Brightness/Contrast
        </a>
        <a 
          className={`tab ${activeTab === "rotation" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("rotation")}
        >
          Rotation
        </a>
      </div>

      {activeTab === "basic" && (
        <div className="grid grid-cols-1 w-full gap-4">
          <div className="card bg-base-200 w-full">
            <div className="card-body p-4 w-full">
              <h3 className="card-title text-sm">One-click Filters</h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => applyFilter('grayscale')}
                >
                  Grayscale
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => applyFilter('canny')}
                >
                  Edge Detection
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => applyFilter('threshold', { thresh: 127 })}
                >
                  Default Threshold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "blur" && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Blur: {blurSize}px</span>
            </label>
            <input
              type="range"
              min="1"
              max="21"
              step="2"
              value={blurSize}
              onChange={(e) => setBlurSize(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>1</span>
              <span>5</span>
              <span>9</span>
              <span>13</span>
              <span>17</span>
              <span>21</span>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-primary w-full mt-2"
            onClick={() => applyFinalFilter('blur', { ksize: blurSize })}
          >
            Apply Blur
          </button>
        </div>
      )}
      
      {activeTab === "threshold" && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Threshold: {thresholdValue}</span>
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>255</span>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-primary w-full mt-2"
            onClick={() => applyFinalFilter('threshold', { thresh: thresholdValue })}
          >
            Apply Threshold
          </button>
        </div>
      )}
      
      {activeTab === "brightness" && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Brightness: {brightnessValue}</span>
            </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightnessValue}
              onChange={(e) => setBrightnessValue(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>-100</span>
              <span>-50</span>
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Contrast: {contrastValue.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={contrastValue}
              onChange={(e) => setContrastValue(parseFloat(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>0.5</span>
              <span>1.0</span>
              <span>1.5</span>
              <span>2.0</span>
              <span>2.5</span>
              <span>3.0</span>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-primary w-full mt-2"
            onClick={() => applyFinalFilter('brightness', { alpha: contrastValue, beta: brightnessValue })}
          >
            Apply Brightness/Contrast
          </button>
        </div>
      )}
      
      {activeTab === "rotation" && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Rotation: {rotationAngle}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseInt(e.target.value))}
              className="range range-primary"
            />
            <div className="w-full flex justify-between text-xs px-2 mt-1">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>
          <button 
            className="btn btn-sm btn-primary w-full mt-2"
            onClick={() => applyFinalFilter('rotation', { angle: rotationAngle })}
          >
            Apply Rotation
          </button>
        </div>
      )}
    </div>
  );
}