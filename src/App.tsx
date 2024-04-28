import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { ModalAlert } from './components/ModalAlert';
import { HomePage } from './pages/Home/HomePage';

const App: React.FC = () => {
  return (
    <>
      <ModalAlert />
      <LoadingScreen />

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
