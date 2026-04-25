import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, CheckCircle2, Clock, ExternalLink, AlertTriangle, MessageSquare, X, Send } from 'lucide-react';

export const MobileStaffDetail = ({
  selectedStaff,
  selectedPageId,
  setSelectedPageId,
  onBack
}: {
  selectedStaff: any,
  selectedPageId: string | null,
  setSelectedPageId: (id: string) => void,
  onBack: () => void
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);
  const selectedPageIdRef = useRef(selectedPageId);

  // Mouse Drag State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const dragDistance = useRef(0);

  // Alert/Tag form state
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagType, setTagType] = useState<'Flag' | 'Note' | 'Warning'>('Warning');
  const [tagMessage, setTagMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setTagModalOpen(false);
      setTagMessage('');
      alert(`Tag sent for ${activePage.name}!\nType: ${tagType}\nMessage: ${tagMessage}`);
    }, 600);
  };

  useEffect(() => {
    selectedPageIdRef.current = selectedPageId;
  }, [selectedPageId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !selectedStaff) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      // Debounce scroll event to find the center item when scrolling settles
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestId: string | null = null;
        let minDiff = Infinity;

        Array.from(container.children).forEach((child: Element) => {
          if (!child.hasAttribute('data-page-id')) return; // ignore spacers

          const HTMLElementChild = child as HTMLElement;
          const rect = HTMLElementChild.getBoundingClientRect();
          const childCenter = rect.left + rect.width / 2;
          const diff = Math.abs(containerCenter - childCenter);

          if (diff < minDiff) {
            minDiff = diff;
            closestId = HTMLElementChild.getAttribute('data-page-id');
          }
        });

        if (closestId && closestId !== selectedPageIdRef.current) {
          setSelectedPageId(closestId);
        }
      }, 60); // 60ms debounce to let CSS snap settle
    };

    let debounceEnd: NodeJS.Timeout;
    const handleScrollDetectClickEnd = () => {
      clearTimeout(debounceEnd);
      debounceEnd = setTimeout(() => {
        isClickScrolling.current = false;
      }, 150);
    };

    const combinedScrollHandler = () => {
      handleScroll();
      handleScrollDetectClickEnd();
    };

    container.addEventListener('scroll', combinedScrollHandler, { passive: true });
    return () => {
      container.removeEventListener('scroll', combinedScrollHandler);
      clearTimeout(timeoutId);
      clearTimeout(debounceEnd);
    };
  }, [selectedStaff, setSelectedPageId]);

  if (!selectedStaff) return null;
  const progressPercent = selectedStaff.totalPages > 0 ? Math.round((selectedStaff.updatedToday / selectedStaff.totalPages) * 100) : 0;
  const isComplete = progressPercent === 100;
  const activePage = selectedStaff.pageDetails.find((p: any) => p.id === selectedPageId) || selectedStaff.pageDetails[0];

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Detail Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-200 shadow-sm z-20 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-2 bg-white rounded-lg border border-slate-200 shadow-sm"
          >
            <ChevronLeft size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider font-outfit">Overview</span>
          </button>
          <div className={cn(
            "px-2.5 py-1 rounded-md text-[10px] font-bold font-outfit border uppercase bg-white shadow-sm",
            isComplete ? 'text-emerald-500 border-slate-200' :
              progressPercent > 0 ? 'text-[#054ab3] border-slate-200' : 'text-slate-500 border-slate-200'
          )}>
            {isComplete ? 'All Tasks Done' : `${progressPercent}% Progress`}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-black text-xl text-slate-700 font-outfit border border-slate-200 shadow-sm">
            {selectedStaff.avatar}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 font-noto leading-tight mb-0.5">{selectedStaff.name}</h1>
            <p className="text-[11px] text-slate-500 font-noto">{selectedStaff.role} • <span className="font-bold text-slate-700">{selectedStaff.totalPages}</span> Assigned Pages</p>
          </div>
        </div>
      </div>

      {/* Horizontal Page Slider */}
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="pt-5">
          <div className="px-4 mb-3"><h3 className="text-[11px] font-bold text-slate-500 font-noto uppercase tracking-wide">Select Page Profile</h3></div>

          {selectedStaff.pageDetails.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-xs font-noto">No assigned pages for this staff.</div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-0 pb-4 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                isDragging.current = true;
                dragDistance.current = 0;
                startX.current = e.pageX - scrollContainerRef.current!.offsetLeft;
                scrollLeftPos.current = scrollContainerRef.current!.scrollLeft;
              }}
              onMouseLeave={() => {
                isDragging.current = false;
              }}
              onMouseUp={() => {
                isDragging.current = false;
              }}
              onMouseMove={(e) => {
                if (!isDragging.current) return;
                e.preventDefault();
                const x = e.pageX - scrollContainerRef.current!.offsetLeft;
                const walk = (x - startX.current) * 1.5;
                dragDistance.current = Math.abs(walk);
                if (scrollContainerRef.current) {
                  // Disable smooth scroll temporarily for immediate drag tracking
                  scrollContainerRef.current.style.scrollBehavior = 'auto';
                  scrollContainerRef.current.scrollLeft = scrollLeftPos.current - walk;
                  scrollContainerRef.current.style.scrollBehavior = 'smooth';
                }
              }}
            >
              {/* Start Spacer (Slate Box) - Used to push the first item to exactly center of the screen */}
              <div className="shrink-0 w-[calc(50vw-80px-0.75rem)] min-h-full bg-gradient-to-l from-[#054ab3] to-[#054ab3]/80 rounded-r-2xl flex items-center justify-end pr-3 snap-align-none shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)]">
                <div className="w-1.5 h-6 rounded-full bg-white/20" />
              </div>

              {selectedStaff.pageDetails.map((page: any) => (
                <button
                  key={page.id}
                  data-page-id={page.id}
                  onClick={(e) => {
                    // Prevent click if we dragged
                    if (dragDistance.current > 5) {
                      e.preventDefault();
                      return;
                    }
                    isClickScrolling.current = true;
                    setSelectedPageId(page.id);
                    const container = scrollContainerRef.current;
                    const target = container?.querySelector(`[data-page-id="${page.id}"]`) as HTMLElement;
                    if (target) {
                      target.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className={cn(
                    "shrink-0 snap-center w-[160px] p-3 rounded-xl flex flex-col justify-between transition-all duration-300 relative text-left border bg-white",
                    selectedPageId === page.id
                      ? 'border-[#054ab3] ring-1 ring-[#054ab3]/30 shadow-md scale-100 opacity-100'
                      : 'border-slate-200 opacity-60 scale-95 hover:opacity-100 hover:scale-100'
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center border font-black font-outfit text-[10px] transition-colors",
                      selectedPageId === page.id ? "bg-[#054ab3] text-white border-[#054ab3]" : "bg-white text-slate-400 border-slate-200"
                    )}>
                      {page.boxId.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[11px] font-noto leading-tight mb-1.5 line-clamp-2">{page.name}</h4>
                    <div className="flex items-center gap-1 mt-auto">
                      {page.status === 'completed' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Clock size={12} className="text-slate-400" />}
                      <span className={cn("text-[9px] font-bold font-noto", page.status === 'completed' ? 'text-emerald-600' : 'text-slate-500')}>
                        {page.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {/* End Spacer - Used to push the last item to exactly center of the screen */}
              <div className="shrink-0 w-[calc(50vw-80px-0.75rem)] min-h-full bg-slate-100 rounded-l-2xl snap-align-none" />
            </div>
          )}

          {activePage && (
            <div className="px-4 mt-2">
              <div key={activePage.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-sm font-bold font-noto text-slate-900 leading-tight mb-1">{activePage.name}</h2>
                    <span className="text-[9px] text-slate-500 font-outfit tracking-widest font-bold border border-slate-200 px-2 py-0.5 rounded-full">BOX {activePage.boxId.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTagModalOpen(true);
                      }}
                      className="w-8 h-8 shrink-0 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <AlertTriangle size={14} />
                    </button>
                    <a href={activePage.link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 shrink-0 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-base font-black font-outfit text-slate-900">{activePage.followers}</p>
                    <p className="text-[9px] text-slate-500 font-noto uppercase tracking-wide mt-0.5">Followers</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-base font-black font-outfit text-slate-900">{activePage.todayViews}</p>
                    <p className="text-[9px] text-slate-500 font-noto uppercase tracking-wide mt-0.5">Views Today</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Tag/Flag Modal (Portaled for absolute Z-Index override) */}
      {tagModalOpen && activePage && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom-8 duration-300 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border border-slate-200 shadow-sm text-slate-700 flex items-center justify-center rounded-lg">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-noto leading-none mt-1">Issue Reporting</h3>
                </div>
              </div>
              <button onClick={() => setTagModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="mb-5">
              <h4 className="text-[10px] font-bold text-slate-500 font-noto mb-2 px-1 uppercase tracking-wide">Select Request Type</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTagType('Warning')}
                  className={cn("py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-bold font-noto border", tagType === 'Warning' ? "bg-[#054ab3] text-white border-[#054ab3] shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                >
                  <AlertTriangle size={16} />
                  แจ้งปัญหา / เปลี่ยนเพจ
                </button>
                <button
                  onClick={() => setTagType('Note')}
                  className={cn("py-3 px-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-xs font-bold font-noto border", tagType === 'Note' ? "bg-[#054ab3] text-white border-[#054ab3] shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50")}
                >
                  <MessageSquare size={16} />
                  ฝากข้อความทั่วไป
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-slate-500 font-noto mb-2 px-1">MESSAGE DETAILS</h4>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-noto text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#054ab3] focus:border-[#054ab3] resize-none h-24 transition-all"
                placeholder="ระบุปัญหา หรือลิงก์ที่ต้องการให้ตรวจสอบ..."
                value={tagMessage}
                onChange={(e) => setTagMessage(e.target.value)}
              />
            </div>

            {/* Quick Templates */}
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden mb-6 pb-2">
              {['เปลี่ยนเพจด่วน', 'แก้ลิงก์เพจใหม่', 'เปลื่ยนแบนเนอร์', 'ตรวจสอบยอดวิว', 'แก้สถานะเพจ'].map(tmpl => (
                <button
                  key={tmpl}
                  onClick={() => setTagMessage(tmpl)}
                  className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full text-[10px] font-noto text-slate-600 transition-colors shadow-sm"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            <button
              onClick={handleTagSubmit}
              disabled={isSubmitting || tagMessage.trim() === ''}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#054ab3] text-white rounded-xl font-bold font-noto text-[13px] shadow-md disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ส่งข้อมูล...
                </>
              ) : (
                <>
                  <Send size={16} />
                  ยืนยันการแจ้งเตือน
                </>
              )}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
