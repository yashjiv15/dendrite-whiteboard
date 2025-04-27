import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { FaUndo, FaRedo, FaSave, FaEraser, FaPaintBrush } from "react-icons/fa";
import KeycloakService from '../../services/KeycloakService';
import { createWhiteboard, updateWhiteboard, getWhiteboardBySessionId } from '../../services/api';

interface CursorData {
  userId: string;
  x: number;
  y: number;
  color: string;
}

export default function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const userId = useRef(`user-${Math.random().toString(36).substring(2, 10)}`);
  const sessionId = window.location.pathname.split("/").pop() || "defaultSessionId";

  const [color, setColor] = useState<string>(() => localStorage.getItem("color") || "#000000");
  const [brushSize, setBrushSize] = useState<number>(() => Number(localStorage.getItem("brushSize")) || 5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem("history") || "[]"));
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [whiteboardId, setWhiteboardId] = useState<number | null>(null);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());

  useEffect(() => {
    if (!KeycloakService.isLoggedIn()) {
      KeycloakService.callLogin();
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081/ws/whiteboard");
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "draw" && fabricRef.current) {
        fabricRef.current.loadFromJSON(data.canvas, () => {
          fabricRef.current?.requestRenderAll(); // <-- fixed here
        });
      } else if (data.type === "cursor") {
        setCursors((prev) => {
          const updated = new Map(prev);
          updated.set(data.userId, data);
          return updated;
        });
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, { isDrawingMode: true });
    fabricRef.current = canvas;
    canvas.setWidth(1000);
    canvas.setHeight(600);

    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    const loadWhiteboard = async () => {
      try {
        const response = await getWhiteboardBySessionId(sessionId);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // Find the latest whiteboard by updated_at
            const latestWhiteboard = data.reduce((latest: { updated_at: string | number | Date; }, current: { updated_at: string | number | Date; }) => {
              return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
            }, data[0]);
    
            const drawingAssets = latestWhiteboard?.drawing_assets;
    
            if (drawingAssets && Object.keys(drawingAssets).length > 0) {
              fabricRef.current?.loadFromJSON(drawingAssets, () => {
                fabricRef.current?.requestRenderAll();
              });
              console.log("Whiteboard loaded successfully");
            } else {
              console.warn("No drawing assets found, initializing empty canvas");
              fabricRef.current?.clear();
              fabricRef.current?.requestRenderAll();
            }
    
            setWhiteboardId(latestWhiteboard.white_board_id);
          } else {
            console.warn("No whiteboard data found for session, initializing empty canvas");
            fabricRef.current?.clear();
            fabricRef.current?.requestRenderAll();
            setWhiteboardId(null);
          }
        } else {
          console.error("Failed to load whiteboard:", response.statusText);
        }
      } catch (error) {
        console.error("Error loading whiteboard:", error);
      }
    };
    

    const saveCanvas = async () => {
      if (!fabricRef.current) return;
      const json = fabricRef.current.toJSON();
      const jsonStr = JSON.stringify(json);

      setHistory((prev) => {
        const updated = [...prev, jsonStr];
        localStorage.setItem("history", JSON.stringify(updated));
        return updated;
      });
      setRedoStack([]);
      localStorage.setItem(`canvasState_${sessionId}`, jsonStr);

      if (whiteboardId) {
        try {
          await updateWhiteboard(whiteboardId, json);
        } catch (error) {
          console.error("Error updating whiteboard:", error);
        }
      } else {
        try {
          const response = await createWhiteboard(sessionId, json);
          if (response.ok) {
            const data = await response.json();
            setWhiteboardId(data.white_board_id);
          }
        } catch (error) {
          console.error("Error creating whiteboard:", error);
        }
      }
    };

    canvas.on("path:created", saveCanvas);

    canvas.on("mouse:move", (opt) => {
      const pointer = canvas.getPointer(opt.e);
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "cursor",
            userId: userId.current,
            x: pointer.x,
            y: pointer.y,
            color,
          })
        );
      }
    });

    loadWhiteboard();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    if (fabricRef.current) {
      const brush = fabricRef.current.freeDrawingBrush as fabric.PencilBrush;
      brush.color = isEraser ? "#ffffff" : color;
      brush.width = brushSize;
    }
    localStorage.setItem("color", color);
    localStorage.setItem("brushSize", brushSize.toString());
  }, [color, brushSize, isEraser]);

  const undo = () => {
    const newHistory = [...history];
    const currentState = newHistory.pop();
    if (currentState) {
      setHistory(newHistory);
      setRedoStack((prev) => [currentState, ...prev]);
      const lastState = newHistory[newHistory.length - 1];
      if (lastState) {
        fabricRef.current?.loadFromJSON(lastState, () => {
          fabricRef.current?.requestRenderAll();
        });
      } else {
        fabricRef.current?.clear();
      }
    }
  };

  const redo = () => {
    const newRedoStack = [...redoStack];
    const redoState = newRedoStack.shift();
    if (redoState) {
      setRedoStack(newRedoStack);
      setHistory((prev) => [...prev, redoState]);
      fabricRef.current?.loadFromJSON(redoState, () => {
        fabricRef.current?.requestRenderAll();
      });
    }
  };

  const saveAsImage = () => {
    if (fabricRef.current) {
      const dataUrl = fabricRef.current.toDataURL({
        format: "png",
        multiplier: 1,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "whiteboard.png";
      link.click();
    }
  };

  return (
    <div className="container mt-3">
      <div className="d-flex flex-wrap gap-3 mb-2 align-items-center">
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
        <button className="btn btn-warning" onClick={() => setIsEraser(!isEraser)}>
          {isEraser ? <FaPaintBrush /> : <FaEraser />}
        </button>
        <button className="btn btn-secondary" onClick={undo}>
          <FaUndo />
        </button>
        <button className="btn btn-secondary" onClick={redo}>
          <FaRedo />
        </button>
        <button className="btn btn-primary" onClick={saveAsImage}>
          <FaSave />
        </button>
        <button className="btn btn-danger" onClick={() => KeycloakService.callLogout()}>
          Logout
        </button>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
