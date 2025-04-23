// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SessionLanding from "./features/session/SessionLanding";
import WhiteboardCanvas from "./features/whiteboard/WhiteboardCanvas";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SessionLanding />} />
        <Route path="/board/:sessionId" element={<WhiteboardCanvas />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
  