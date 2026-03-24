'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Video, Tag, Hash, Star, Type, AlignLeft, Clock } from 'lucide-react';
import { VideoTutorial } from '@/types';
import { getEmbedUrl, getThumbnail } from '@/utils/videoUtils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LearningEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: Partial<VideoTutorial>) => void;
  editingVideo: VideoTutorial | null;
  allExistingTags: string[];
}

export const LearningEditorDrawer: React.FC<LearningEditorDrawerProps> = ({ 
  isOpen, onClose, onSave, editingVideo, allExistingTags
}) => {
  const [formData, setFormData] = useState<Partial<VideoTutorial>>({
    title: '',
    description: '',
    videoUrl: '',
    category: 'Mandatory',
    duration: '',
    tags: [],
    priority: 5
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingVideo) {
      setFormData(editingVideo);
    } else {
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        category: 'Mandatory',
        duration: '',
        tags: [],
        priority: 5
      });
    }
  }, [editingVideo, isOpen]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = getEmbedUrl(formData.videoUrl || '');
    const finalThumbnail = getThumbnail(formData.videoUrl || '');
    
    onSave({
      ...formData,
      videoUrl: finalUrl,
      thumbnailUrl: finalThumbnail,
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 font-outfit uppercase tracking-tight">
              {editingVideo ? 'จัดการวิดีโอสอนงาน' : 'เพิ่มบทเรียนใหม่'}
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
               Learning Content Management System
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <Type size={16} className="text-blue-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Information</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">หัวข้อบทเรียน (Title)</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-blue-100 transition-all outline-none"
                  placeholder="เช่น การใช้งาน Premiere Pro เบื้องต้น"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">คำอธิบาย (Description)</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 ring-blue-100 transition-all outline-none resize-none"
                  placeholder="อธิบายเนื้อหาโดยสังเขป..."
                />
              </div>
            </div>
          </div>

          {/* Video Config */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Video size={16} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video & Media</span>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Video Link (Youtube / Vimeo / Google Drive)</label>
                  <input 
                    required
                    type="url" 
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-blue-100 transition-all outline-none"
                    placeholder="https://drive.google.com/file/d/... หรือ https://youtu.be/..."
                  />
                  <p className="text-[9px] text-slate-400 mt-2 italic px-1 font-medium">* ระบบจะทำการฝัง (Embed) วิดีโอให้โดยอัตโนมัติ</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">ความยาว (Duration)</label>
                      <div className="relative">
                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                         <input 
                           type="text" 
                           value={formData.duration}
                           onChange={(e) => setFormData({...formData, duration: e.target.value})}
                           className="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none"
                           placeholder="10:00"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">หมวดหมู่หลัก</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 ring-blue-100 outline-none appearance-none"
                      >
                         <option value="Mandatory">📌 Mandatory</option>
                         <option value="Technical">⚡ Technical</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>

          {/* Categorization & Tags */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorization & Priority</span>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">หมวดย่อย / Tags (Press Enter)</label>
                   <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags?.map(tag => (
                        <div key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black flex items-center gap-2 border border-blue-100">
                           {tag}
                           <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                             <X size={12} />
                           </button>
                        </div>
                      ))}
                   </div>
                   
                   {/* Suggested Tags */}
                   {allExistingTags.length > 0 && (
                     <div className="mb-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Tags เดิมที่มีอยู่:</span>
                        <div className="flex flex-wrap gap-2">
                           {allExistingTags
                             .filter(tag => !formData.tags?.includes(tag))
                             .map(tag => (
                               <button 
                                 key={tag}
                                 type="button"
                                 onClick={() => setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }))}
                                 className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold hover:bg-blue-100 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                               >
                                 + {tag}
                               </button>
                             ))
                           }
                        </div>
                     </div>
                   )}

                   <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="w-full bg-slate-900 border-none rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-white focus:ring-2 ring-blue-100 outline-none placeholder:text-slate-600 shadow-xl shadow-slate-100"
                        placeholder="เพิ่มแท็ก... (เช่น Google Sheet)"
                      />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1 flex justify-between">
                     Priority / ลำดับความสำคัญ
                     <span className="text-blue-600 font-black">{formData.priority}</span>
                   </label>
                   <input 
                     type="range" 
                     min="1" 
                     max="10" 
                     step="1"
                     value={formData.priority}
                     onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                     className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                   />
                   <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      <span>Low Priority</span>
                      <span>Featured</span>
                   </div>
                </div>
             </div>
          </div>
        </form>

        {/* Action Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
          >
            <Save size={18} />
            {editingVideo ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันการเพิ่มเนื้อหา'}
          </button>
        </div>
      </div>
    </div>
  );
};
