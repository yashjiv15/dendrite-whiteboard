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
  const [color, setColor] = useState<string>(() => localStorage.getItem("color") || "#000000");
  const [brushSize, setBrushSize] = useState<number>(() => Number(localStorage.getItem("brushSize")) || 5);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(() => JSON.parse(localStorage.getItem("history") || "[]"));
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);
  const userId = useRef(`user-${Math.random().toString(36).slice(2, 10)}`);
  const [whiteboardId, setWhiteboardId] = useState<number | null>(null);

  const sessionId = window.location.pathname.split("/").pop() || "defaultSessionId";

  // Check login
  useEffect(() => {
    if (!KeycloakService.isLoggedIn()) {
      KeycloakService.callLogin();
    }
  }, []);

  // Setup WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081/ws/whiteboard");
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket connected");

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

    return () => {
      socket.close();
    };
  }, []);

  // Setup fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, { isDrawingMode: true });
    canvas.setWidth(1000);
    canvas.setHeight(600);
    fabricRef.current = canvas;

    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    const loadWhiteboardEntry = async () => {
      try {
        const response = await getWhiteboardBySessionId(sessionId);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched data:", data); // Log the fetched data
          if (data.length > 0) {
            const drawingAssets = data[0].drawing_assets.drawing_assets;
            console.log("Drawing assets:", drawingAssets); // Log the drawing assets
            if (fabricRef.current) {
              fabricRef.current.loadFromJSON(drawingAssets, () => {
                fabricRef.current?.renderAll();
              });
              setWhiteboardId(data[0].white_board_id);
            } else {
              console.error("Fabric canvas is not initialized.");
            }
          } else {
            console.warn("No drawing assets found, clearing canvas.");
            fabricRef.current?.clear();
            setWhiteboardId(null);
          }
        } else {
          console.error("Failed to load whiteboard:", response.statusText);
          fabricRef.current?.clear();
        }
      } catch (error) {
        console.error("Error loading whiteboard:", error);
      }
    };

    const createWhiteboardEntry = async () => {
      try {
        const initialState = canvas.toJSON();
        const response = await createWhiteboard(sessionId, initialState);
        if (response.ok) {
          const data = await response.json();
          setWhiteboardId(data.white_board_id);
        }
      } catch (error) {
        console.error("Error creating whiteboard:", error);
      }
    };

    const saveState = async () => {
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
      }
    };

    canvas.on("path:created", saveState);
    canvas.on("mouse:up", saveState);

    canvas.on("mouse:down", () => {
      if (!whiteboardId) {
        createWhiteboardEntry();
      }
    });

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

    loadWhiteboardEntry();

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [color, brushSize, whiteboardId]);

  // Update brush when color or size changes
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.freeDrawingBrush!.color = isEraser ? "#ffffff" : color;
      fabricRef.current.freeDrawingBrush!.width = brushSize;
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
      if (newHistory.length > 0) {
        fabricRef.current?.loadFromJSON(newHistory[newHistory.length - 1], () => {
          fabricRef.current?.renderAll();
        });
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
        fabricRef.current?.renderAll();
      });
    }
  };

  const saveAsImage = () => {
    if (fabricRef.current) {
      const dataUrl = fabricRef.current.toDataURL({ format: "png", multiplier: 0 });
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
        <button className="btn btn-secondary" onClick ={redo}>
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