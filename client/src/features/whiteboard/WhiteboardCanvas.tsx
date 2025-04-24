import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { FaUndo, FaRedo, FaSave } from "react-icons/fa";
import '../../index.css'; // or wherever your tailwind styles are defined

interface CursorData {
  userId: string;
  x: number;
  y: number;
  color: string;
}

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [brushSize, setBrushSize] = useState<number>(5);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const userId = useRef(`user-${Math.random().toString(36).slice(2, 10)}`);

  // WebSocket setup
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081/ws/whiteboard");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "draw" && fabricRef.current) {
        fabricRef.current.loadFromJSON(data.canvas, () => {
          fabricRef.current?.renderAll();
        });
      } else if (data.type === "cursor") {
        setCursors((prev) => {
          const updated = new Map(prev);
          updated.set(data.userId, data);
          return updated;
        });
      }
    };

    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("WebSocket closed");

    return () => {
      socket.close();
    };
  }, []);

  // Fabric canvas setup
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
      setHistory((prev) => [...prev, JSON.stringify(json)]);
      setRedoStack([]); // Clear redo stack on new action
      socketRef.current?.send(
        JSON.stringify({ type: "draw", canvas: json })
      );
    };

    canvas.on("path:created", saveState);

    canvas.on("mouse:move", (opt) => {
      const pointer = canvas.getPointer(opt.e);
      socketRef.current?.send(
        JSON.stringify({
          type: "cursor",
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

  // Update brush settings dynamically
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.freeDrawingBrush!.color = color;
      fabricRef.current.freeDrawingBrush!.width = brushSize;
    }
  }, [color, brushSize]);

  const undo = () => {
    if (!fabricRef.current || history.length === 0) return;
    const newHistory = history.slice(0, -1);
    const lastState = history[history.length - 1];
    setRedoStack((stack) => [...stack, lastState]);
    setHistory(newHistory);
    const prevState = newHistory[newHistory.length - 1];
    if (prevState) {
      fabricRef.current.loadFromJSON(prevState, () => {
        fabricRef.current?.renderAll();
      });
    }
  };

  const redo = () => {
    if (!fabricRef.current || redoStack.length === 0) return;
    const lastState = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0 , -1));
    setHistory((prev) => [...prev, lastState]);
    fabricRef.current.loadFromJSON(lastState, () => {
      fabricRef.current?.renderAll();
    });
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
    <div className="container mt-3">
      <div className="d-flex gap-3 mb-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
        />
        <button className="btn btn-warning" onClick={undo}>
          <FaUndo /> Undo
        </button>
        <button className="btn btn-secondary" onClick={redo}>
          <FaRedo /> Redo
        </button>
        <button className="btn btn-success" onClick={saveAsImage}>
          <FaSave /> Save as Image
        </button>
        <button className="btn btn-info" onClick={saveAsPDF}>
          <FaSave /> Save as PDF
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
        style={{ border: "1px solid black" }}
      />
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
            zIndex: 999,
          }}
        />
      ))}
    </div>
  );
}