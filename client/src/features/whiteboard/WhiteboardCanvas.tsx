import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { FaUndo, FaRedo, FaSave, FaEraser, FaPaintBrush, FaSignOutAlt } from "react-icons/fa";
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

  // --- Rest of your backend/socket logic stays same (good quality) ---

  useEffect(() => {
    if (!KeycloakService.isLoggedIn()) KeycloakService.callLogin();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8081/ws/whiteboard");
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket connected");
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "draw" && fabricRef.current) {
        fabricRef.current.loadFromJSON(data.canvas, () => fabricRef.current?.requestRenderAll());
      } else if (data.type === "cursor") {
        setCursors((prev) => {
          const updated = new Map(prev);
          updated.set(data.userId, data);
          return updated;
        });
      }
    };
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, { isDrawingMode: true });
    fabricRef.current = canvas;

    const resizeCanvas = () => {
      const container = document.getElementById("canvas-container");
      if (container) {
        canvas.setWidth(container.clientWidth);
        canvas.setHeight(window.innerHeight - 150); // Adjust as per header height
      }
      canvas.requestRenderAll();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

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
            const latestWhiteboard = data.reduce((latest: { updated_at: string | number | Date; }, current: { updated_at: string | number | Date; }) => {
              return new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest;
            }, data[0]);
            const drawingAssets = latestWhiteboard?.drawing_assets;
            if (drawingAssets && Object.keys(drawingAssets).length > 0) {
              fabricRef.current?.loadFromJSON(drawingAssets, () => fabricRef.current?.requestRenderAll());
            }
            setWhiteboardId(latestWhiteboard.white_board_id);
          }
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

      try {
        if (whiteboardId) {
          await updateWhiteboard(whiteboardId, json);
        } else {
          const response = await createWhiteboard(sessionId, json);
          if (response.ok) {
            const data = await response.json();
            setWhiteboardId(data.white_board_id);
          }
        }
      } catch (error) {
        console.error("Error saving whiteboard:", error);
      }
    };

    canvas.on("path:created", saveCanvas);

    canvas.on("mouse:move", (opt) => {
      const pointer = canvas.getPointer(opt.e);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "cursor",
          userId: userId.current,
          x: pointer.x,
          y: pointer.y,
          color,
        }));
      }
    });

    loadWhiteboard();

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', resizeCanvas);
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
        fabricRef.current?.loadFromJSON(lastState, () => fabricRef.current?.requestRenderAll());
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
      fabricRef.current?.loadFromJSON(redoState, () => fabricRef.current?.requestRenderAll());
    }
  };

  const saveAsImage = () => {
    if (fabricRef.current) {
      const dataUrl = fabricRef.current.toDataURL({ format: "png", multiplier: 2 });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "whiteboard.png";
      link.click();
    }
  };

  return (
<div className="whiteboard-container" style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
  
  {/* Toolbar */}
  <div className="toolbar d-flex flex-wrap align-items-center justify-content-between mb-3 p-2 bg-light rounded shadow-sm">
    <div className="d-flex gap-2 align-items-center flex-wrap">
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Pick Color"
        style={{ width: '30px', height: '30px', border: 'none', background: 'transparent' }}
      />
      <input
        type="range"
        min="1"
        max="50"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        title="Brush Size"
        style={{ maxWidth: '100px' }}
      />
      <button
        className={`btn ${isEraser ? 'btn-danger' : 'btn-warning'} rounded-circle`}
        onClick={() => setIsEraser(!isEraser)}
        title={isEraser ? "Switch to Brush" : "Switch to Eraser"}
        style={{ minWidth: '35px', minHeight: '35px' }}
      >
        {isEraser ? <FaPaintBrush /> : <FaEraser />}
      </button>
      <button className="btn btn-secondary rounded-circle" onClick={undo} title="Undo" style={{ minWidth: '35px', minHeight: '35px' }}>
        <FaUndo />
      </button>
      <button className="btn btn-secondary rounded-circle" onClick={redo} title="Redo" style={{ minWidth: '35px', minHeight: '35px' }}>
        <FaRedo />
      </button>
      <button className="btn btn-success rounded-circle" onClick={saveAsImage} title="Save as Image" style={{ minWidth: '35px', minHeight: '35px' }}>
        <FaSave />
      </button>
    </div>
    <div>
      <button className="btn btn-outline-danger" onClick={() => KeycloakService.callLogout()}>
        <FaSignOutAlt className="me-2" />
        Logout
      </button>
    </div>
  </div>

  {/* Main content area (whiteboard + sidebar) */}
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    overflow: 'hidden',
    flexWrap: 'wrap',  // Allow wrapping of the canvas and sidebar on smaller screens
  }}>
    
    {/* Whiteboard */}
    <div id="canvas-container" style={{
      flex: 3,
      border: '1px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
      marginRight: '10px',
      height: '100%',
      minWidth: '300px',
    }}>
      <canvas ref={canvasRef}></canvas>
    </div>

    {/* Sidebar for Chat + Collaborators */}
    <div style={{
      flex: 1,
      background: '#f8f9fa',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: '280px',
      marginTop: '10px',  // Margin for mobile spacing
      maxWidth: '100%',
    }}>
      
      {/* Collaborators */}
      <div style={{ marginBottom: '20px', flex: '1' }}>
        <h5 className="text-primary">Collaborators (Chat features in progress)</h5>
        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {[...cursors.values()].map((cursor) => (
            <div key={cursor.userId} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: cursor.color,
                borderRadius: '50%',
                marginRight: '8px',
              }} />
              <span>{cursor.userId}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h5 className="text-success">Chat</h5>
        <div id="chat-messages" style={{
          flex: 1,
          overflowY: 'auto',
          background: '#ffffff',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '10px',
        }}>
          {/* Chat messages will appear here */}
          <div style={{ color: 'gray', fontStyle: 'italic' }}>No messages yet</div>
        </div>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              flex: 1,
              borderRadius: '5px 0 0 5px',
              border: '1px solid #ccc',
              padding: '5px',
              fontSize: '14px',
            }}
          />
          <button className="btn btn-primary" style={{ borderRadius: '0 5px 5px 0', fontSize: '14px' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


  );
}
