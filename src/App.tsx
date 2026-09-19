import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Preview3D from './pages/Preview3D';
import { AudioProvider } from './context/AudioContext';
import AudioController from './components/AudioController';

function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <AudioController />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preview-3d" element={<Preview3D />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  );
}

export default App;

