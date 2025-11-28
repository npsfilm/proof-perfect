import { useState, useRef } from 'react';

export function useImageZoom() {
  const [zoom, setZoom] = useState(1);
  const initialPinchDistance = useRef<number | null>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handlePinchStart = (touches: React.TouchList) => {
    if (touches.length === 2) {
      initialPinchDistance.current = getPinchDistance(touches);
    }
  };

  const handlePinchMove = (touches: React.TouchList) => {
    if (touches.length === 2 && initialPinchDistance.current) {
      const currentDistance = getPinchDistance(touches);
      const scale = currentDistance / initialPinchDistance.current;
      const newZoom = Math.min(Math.max(zoom * scale, 1), 5);
      setZoom(newZoom);
      initialPinchDistance.current = currentDistance;
      return true; // Indicate pinch is happening
    }
    return false;
  };

  const handlePinchEnd = () => {
    initialPinchDistance.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newZoom = Math.min(Math.max(zoom + delta, 1), 5);
      setZoom(newZoom);
    }
  };

  return {
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleWheel,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
  };
}
