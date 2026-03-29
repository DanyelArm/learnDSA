import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { MapPage } from '@/pages/MapPage'
import { LessonPage } from '@/pages/LessonPage'
import { TheoryView } from '@/components/lesson/TheoryView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/topic/:id" element={<LessonPage />}>
            <Route index element={<Navigate to="theory" replace />} />
            <Route path="theory" element={<TheoryView />} />
            <Route path="quiz" element={<div className="font-heading text-center py-12 text-brown">Quiz coming in Plan 05</div>} />
            <Route path="practice" element={<div className="font-heading text-center py-12 text-brown">Practice coming in Plan 07</div>} />
            <Route path="challenge" element={<div className="font-heading text-center py-12 text-brown">Challenge coming in Plan 07</div>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
