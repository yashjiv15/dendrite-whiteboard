// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SessionLanding from './features/session/SessionLanding';
import WhiteboardCanvas from './features/whiteboard/WhiteboardCanvas';
import AuthForm from './auth/AuthForm';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route
          path="/session"
          element={
            <ProtectedRoute>
              <SessionLanding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/board/:sessionId"
          element={
            <ProtectedRoute>
              <WhiteboardCanvas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
