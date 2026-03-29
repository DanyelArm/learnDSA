import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { MapPage } from '@/pages/MapPage'
import { LessonPage } from '@/pages/LessonPage'
import { TheoryView } from '@/components/lesson/TheoryView'
import { QuizView } from '@/components/lesson/QuizView'
import { EditorView } from '@/components/lesson/EditorView'

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
            <Route path="quiz" element={<QuizView />} />
            <Route path="practice" element={<EditorView stage="practice" />} />
            <Route path="challenge" element={<EditorView stage="challenge" />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
