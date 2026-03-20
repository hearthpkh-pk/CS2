'use client';

import React, { useState } from 'react';
import { Play, BookOpen, Clock, Search, Filter, ShieldAlert, Zap, Plus, Edit, Trash2 } from 'lucide-react';
import { User, VideoTutorial } from '@/types';
import { LearningEditorDrawer } from './LearningEditorDrawer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const initialVideos: VideoTutorial[] = [
  {
    id: '1',
    title: 'กฎระเบียบการส่งงานและค่าคอมมิชชัน',
    description: 'เรียนรู้เรื่องการนับคลิปงาน และการคำนวณเงินจากยอดวิวรายเดือนอย่างละเอียด',
    duration: '12:45',
    category: 'Mandatory',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
    tags: ['HR', 'Payroll', 'Rules'],
    priority: 10,
    isNew: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'เทคนิคการหาคลิปไวรัล (Facebook Reels)',
    description: 'วิธีการเลือกเนื้อหาและเทคนิคการตัดต่อให้มีโอกาสแมสได้ง่ายขึ้น',
    duration: '08:20',
    category: 'Technical',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['Reels', 'Marketing', 'Creative'],
    priority: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'การใช้งานระบบ CRM และการตรวจความปลอดภัย',
    description: 'สอนการเช็คสถานะเพจผ่านหน้า Setup และการจัดการ Account UID',
    duration: '15:10',
    category: 'Mandatory',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    tags: ['System', 'Security', 'CRM'],
    priority: 7,
    createdAt: new Date().toISOString()
  }
];

interface LearningCenterViewProps {
  currentUser: User;
}

export const LearningCenterView: React.FC<LearningCenterViewProps> = ({ currentUser }) => {
  const [videos, setVideos] = useState<VideoTutorial[]>(initialVideos);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Mandatory' | 'Technical'>('All');
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoTutorial | null>(null);

  // Get all unique tags
  const allTags = Array.from(new Set(videos.flatMap(v => v.tags)));

  const filteredVideos = videos
    .filter(v => 
      (activeCategory === 'All' || v.category === activeCategory) &&
      (v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       v.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!selectedTag || v.tags.includes(selectedTag))
    )
    .sort((a, b) => b.priority - a.priority);

  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';

  const handleSaveVideo = (videoData: Partial<VideoTutorial>) => {
    if (editingVideo) {
      setVideos(prev => prev.map(v => v.id === editingVideo.id ? { ...v, ...videoData } as VideoTutorial : v));
    } else {
      const newVideo: VideoTutorial = {
        id: Math.random().toString(36).substr(2, 9),
        ...videoData as any,
      };
      setVideos(prev => [...prev, newVideo]);
    }
    setEditingVideo(null);
  };

  const handleDeleteVideo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบทเรียนนี้?')) {
      setVideos(prev => prev.filter(v => v.id !== id));
      if (selectedVideo?.id === id) setSelectedVideo(null);
    }
  };

  const handleEditVideo = (video: VideoTutorial, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVideo(video);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search & Filter Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-outfit uppercase tracking-tight flex items-center gap-3">
            <BookOpen size={28} className="text-blue-600" />
            Learning Center
          </h2>
          <p className="text-slate-400 text-xs font-noto font-bold mt-1 uppercase tracking-widest">ศูนย์รวมความรู้และเทคนิคการทำงาน</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 min-w-[280px]">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาบทเรียนที่ต้องการ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full placeholder:text-slate-300"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => {
                setEditingVideo(null);
                setIsEditorOpen(true);
              }}
              className="h-11 px-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-100"
            >
               <Plus size={14} /> Add Content
            </button>
          )}
        </div>
      </div>

      {/* Tags & Categories Row */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['All', 'Mandatory', 'Technical'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                activeCategory === cat 
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500"
              )}
            >
              {cat === 'All' ? 'ทั้งหมด' : cat === 'Mandatory' ? '📌 คอร์สบังคับ' : '⚡ เทคนิคการทำงาน'}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={14} className="text-slate-300 shrink-0" />
            <button
               onClick={() => setSelectedTag(null)}
               className={cn(
                 "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                 !selectedTag ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-transparent border-transparent text-slate-400"
               )}
            >
               #ALL
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                  selectedTag === tag 
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-blue-100 hover:text-blue-500"
                )}
              >
                #{tag.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video Content Player (Conditional) */}
      {selectedVideo && (
        <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/5">
           <div className="aspect-video relative group">
              <iframe 
                src={selectedVideo.videoUrl} 
                className="w-full h-full"
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
              >
                <Plus className="rotate-45" size={20} />
              </button>
           </div>
           <div className="p-8 pb-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className={cn(
                   "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                   selectedVideo.category === 'Mandatory' ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                 )}>
                   {selectedVideo.category}
                 </div>
                 <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                    <Clock size={12} /> {selectedVideo.duration}
                 </div>
              </div>
              <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tight mb-2">{selectedVideo.title}</h3>
              <p className="text-slate-400 text-sm font-noto leading-relaxed max-w-2xl">{selectedVideo.description}</p>
           </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map(video => (
          <div 
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer relative"
          >
            {video.isNew && (
              <div className="absolute top-4 left-4 z-10 px-2 py-1 bg-yellow-400 text-slate-900 text-[8px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                 New
              </div>
            )}
            
            <div className="aspect-video relative overflow-hidden">
               <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="p-4 bg-white rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                     <Play className="text-blue-600 fill-blue-600" size={24} />
                  </div>
               </div>
               <div className="absolute bottom-4 right-4 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                  {video.duration}
               </div>
            </div>

            <div className="p-6">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                    {video.category === 'Mandatory' ? (
                      <ShieldAlert size={14} className="text-red-500" />
                    ) : (
                      <Zap size={14} className="text-blue-500" />
                    )}
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest",
                      video.category === 'Mandatory' ? "text-red-500" : "text-blue-500"
                    )}>
                      {video.category}
                    </span>
                 </div>
                 {isAdmin && (
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleEditVideo(video, e)}
                        className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                         <Edit size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteVideo(video.id, e)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                 )}
               </div>
               
               <h4 className="font-bold text-slate-800 text-base font-noto leading-tight group-hover:text-blue-600 transition-colors mb-2 truncate">
                  {video.title}
               </h4>
               
               {video.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1.5 mb-3">
                    {video.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                    {video.tags.length > 2 && (
                       <span className="text-[8px] font-black text-slate-300">+{video.tags.length - 2}</span>
                    )}
                 </div>
               )}

               <p className="text-[11px] text-slate-400 font-noto line-clamp-2">
                  {video.description}
               </p>
            </div>
          </div>
        ))}

        {filteredVideos.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
             <Search size={48} className="mb-4 opacity-20" />
             <p className="font-bold">ไม่พบบทเรียนที่คุณต้องการ</p>
          </div>
        )}
      </div>

      <LearningEditorDrawer 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveVideo}
        editingVideo={editingVideo}
      />
    </div>
  );
};
