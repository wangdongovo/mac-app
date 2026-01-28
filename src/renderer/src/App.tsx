import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { OverviewPage } from './modules/overview/OverviewPage';
import { TrafficPage } from './modules/traffic/TrafficPage';
import { SettingsPage } from './modules/settings/SettingsPage';
import { ClipboardPage } from './modules/clipboard/ClipboardPage';
import { ImagePage } from './modules/images/ImagePage';
import { ComingSoon } from './components/ComingSoon';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="traffic" element={<TrafficPage />} />
          <Route path="clipboard" element={<ClipboardPage />} />
          <Route path="images" element={<ImagePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
