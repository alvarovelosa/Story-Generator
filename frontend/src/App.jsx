import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Builder from './pages/Builder';
import Player from './pages/Player';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">Story Generator</h1>
                <div className="flex space-x-2">
                  <Link
                    to="/builder"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition"
                  >
                    Builder
                  </Link>
                  <Link
                    to="/player"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition"
                  >
                    Player
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Builder />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/player" element={<Player />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
