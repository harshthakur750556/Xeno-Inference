import { useState } from 'react';
import { SplashIntro } from './components/SplashIntro';
import { ChatInterface } from './components/ChatInterface';

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="w-full min-h-screen bg-[#030305] text-white">
      {showSplash ? (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      ) : (
        <ChatInterface onReplayIntro={() => setShowSplash(true)} />
      )}
    </div>
  );
}

export default App;

