import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CursorData {
  userId: string;
  x: number;
  y: number;
  color: string;
}

const WhiteboardCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const userId = useRef(`user-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8081/ws/whiteboard');
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'draw') {
        fabricRef.current?.loadFromJSON(data.canvas, () => {
          fabricRef.current?.renderAll();
        });
      } else if (data.type === 'cursor') {
        setCursors((prev) => {
          const updated = new Map(prev);
          updated.set(data.userId, data);
          return updated;
        });
      }
    };

    socket.onerror = (err) => console.error('WebSocket error:', err);
    socket.onclose = () => console.log('WebSocket closed');

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = brushSize;
    fabricRef.current = canvas;

    const saveState = () => {
      const json = canvas.toJSON();
      socketRef.current?.send(JSON.stringify({ type: 'draw', canvas: json }));
    };

    canvas.on('path:created', saveState);

    canvas.on('mouse:move', (opt) => {
      const pointer = canvas.getPointer(opt.e);
      socketRef.current?.send(
        JSON.stringify({
          type: 'cursor',
          userId: userId.current,
          x: pointer.x,
          y: pointer.y,
          color,
        })
      );
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [color, brushSize]);

  const undo = () => {
    // Implement undo logic
  };

  const redo = () => {
    // Implement redo logic
  };

  const saveAsImage = () => {
    if (!canvasRef.current) return;
    html2canvas(canvasRef.current).then((canvas) => {
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, 'whiteboard.png');
      });
    });
  };

  const saveAsPDF = () => {
    if (!canvasRef.current) return;
    html2canvas(canvasRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('whiteboard.pdf');
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} width={1000} height={600} style={{ border: '1px solid black' }} />
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          style={{
            position: 'absolute',
            top: cursor.y,
            left: cursor.x,
            backgroundColor: cursor.color,
            borderRadius: '50%',
            width: '10px',
            height: '10px',
          }}
        />
      ))}
    </div>
  );
};

export default WhiteboardCanvas;
