'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, BadgeCheck, Play, User, Trophy, Tv } from 'lucide-react';
import Modal from '@/components/Modal';

export default function FamososPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  const openVideo = (sources: string[]) => {
    setSelectedSources(sources);
    setCurrentSourceIndex(0);
    setIsVideoModalOpen(true);
  };

  const futbolistas = [
    { name: "Leo Balerdi", role: "Jugador Profesional", src: '/videos/Balerdi.mp4' },
    { name: "Juan Foyth", role: "Jugador Profesional", src: '/videos/Foyth 1.mp4', src2: '/videos/foyth 2.mp4' },
    { name: "Neymar Jr", role: "Jugador Profesional", src: '/videos/Neymar.mp4' },
  ];

  const influencers = [
    { name: "Coscu", role: "Streamer", src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { name: "Momo", role: "Streamer", src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { name: "Markito", role: "Creador", src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  ];

  const renderVideoGrid = (data: typeof futbolistas) => (
    <div className="grid grid-cols-2 gap-3">
      {data.map((video, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => openVideo(video.src2 ? [video.src, video.src2] : [video.src])}
          className="w-full aspect-[9/16] rounded-2xl bg-black shadow-lg relative overflow-hidden group cursor-pointer border border-white/10"
        >
          {/* Progress Bars Placeholder */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
            <div className="h-0.5 bg-white/40 flex-1 rounded-full overflow-hidden"><div className="w-1/3 h-full bg-white rounded-full"></div></div>
            {video.src2 && <div className="h-0.5 bg-white/40 flex-1 rounded-full"></div>}
          </div>

          <video
            src={video.src}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
            preload="metadata"
            muted
            playsInline
            loop
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 opacity-90" />

          {/* Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1 w-full">
              <h4 className="text-white font-bold text-xs truncate leading-none">{video.name}</h4>
              <BadgeCheck className="w-3 h-3 text-blue-400 shrink-0" />
            </div>
            <p className="text-white/70 text-[9px] font-medium truncate">{video.role}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-neon-light/10 dark:bg-neon/10 flex items-center justify-center border border-neon-light/20 dark:border-neon/20 mb-4 relative">
             <div className="absolute inset-0 rounded-full border border-neon-light/30 dark:border-neon/30 animate-ping opacity-75" />
             <Star className="w-8 h-8 text-neon-light dark:text-neon fill-current" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[#1A1A1A] dark:text-white leading-none">VIP Club</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Los que eligen Venta Gaming</p>
        </div>

        {/* Futbolistas Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
             <Trophy className="w-5 h-5 text-yellow-500" />
             <h2 className="text-lg font-black italic uppercase text-[#1A1A1A] dark:text-white tracking-tight">Futbolistas</h2>
          </div>
          {renderVideoGrid(futbolistas)}
        </div>

        {/* Influencers Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
             <Tv className="w-5 h-5 text-blue-500" />
             <h2 className="text-lg font-black italic uppercase text-[#1A1A1A] dark:text-white tracking-tight">Influencers</h2>
          </div>
          {renderVideoGrid(influencers)}
        </div>
      </div>

      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setCurrentSourceIndex(0);
        }}
        title="Reproductor VIP"
      >
        <div className="w-full bg-black flex items-center justify-center relative group overflow-hidden">
          {selectedSources.length > 0 && (
            <video
              key={selectedSources[currentSourceIndex]}
              src={selectedSources[currentSourceIndex]}
              autoPlay
              controls
              playsInline
              className="w-full h-auto max-h-[75vh] object-contain"
              onEnded={() => {
                if (currentSourceIndex < selectedSources.length - 1) {
                  setCurrentSourceIndex(prev => prev + 1);
                }
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
