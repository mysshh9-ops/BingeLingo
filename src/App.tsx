import { RouterProvider, useRouter } from '@/lib/router';
import { Sidebar, MobileNav } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { LibraryPage } from '@/pages/LibraryPage';
import { CapturePage } from '@/pages/CapturePage';
import { LessonPage } from '@/pages/LessonPage';
import { QuizPage } from '@/pages/QuizPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { ProgressPage } from '@/pages/ProgressPage';

function AppContent() {
  const { page, sessionId } = useRouter();

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'library':
        return <LibraryPage />;
      case 'capture':
        return <CapturePage />;
      case 'lesson':
        return sessionId ? <LessonPage sessionId={sessionId} /> : <LibraryPage />;
      case 'quiz':
        return sessionId ? <QuizPage sessionId={sessionId} /> : <LibraryPage />;
      case 'flashcards':
        return sessionId ? <FlashcardsPage sessionId={sessionId} /> : <HomePage />;
      case 'progress':
        return <ProgressPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-cream bg-confetti flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {renderPage()}
      </main>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
