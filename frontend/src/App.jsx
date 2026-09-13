import React from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import FloatingTechBackground from './components/canvas/FloatingTechBackground';
import Toast from './components/common/Toast';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/sections/HeroSection';
import CodingStatsSection from './components/sections/CodingStatsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import SkillsSection from './components/sections/SkillsSection';
import EducationSection from './components/sections/EducationSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import Footer from './components/layout/Footer';

// Modals
import ProjectModal from './components/sections/ProjectModal';
import ResumeUploadModal from './components/ai/ResumeUploadModal';
import AdminPortalModal from './components/admin/AdminPortalModal';
import AddProjectModal from './components/admin/AddProjectModal';
import GitHubSyncModal from './components/admin/GitHubSyncModal';
import LeetCodeSyncModal from './components/admin/LeetCodeSyncModal';
import CodolioSyncModal from './components/admin/CodolioSyncModal';
import CodingPlatformsModal from './components/admin/CodingPlatformsModal';
import CertificateModal from './components/admin/CertificateModal';
import OwnerAuthModal from './components/admin/OwnerAuthModal';

function PortfolioApp() {
  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-[var(--text-main)] overflow-x-hidden selection:bg-[var(--primary)]/30 selection:text-[var(--primary)]">
      {/* 3D Real-time Floating Tech Logos & Particle Atmosphere */}
      <FloatingTechBackground />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-grow relative z-10">
        <HeroSection />
        <CodingStatsSection />
        <ProjectsSection />
        <SkillsSection />
        <EducationSection />
        <AboutSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Dedicated Standalone Modals */}
      <ProjectModal />
      <ResumeUploadModal />
      <AdminPortalModal />
      <AddProjectModal />
      <GitHubSyncModal />
      <LeetCodeSyncModal />
      <CodolioSyncModal />
      <CodingPlatformsModal />
      <CertificateModal />
      <OwnerAuthModal />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <PortfolioApp />
    </PortfolioProvider>
  );
}
