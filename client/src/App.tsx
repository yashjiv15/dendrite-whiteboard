// src/App.tsx
import 'bootstrap/dist/css/bootstrap.min.css';

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
      <div className="bg-green-500 text-white p-6 text-2xl">
    If you see this styled, Tailwind is working!
  </div>
    </BrowserRouter>
  );
  
}




export default App;
  