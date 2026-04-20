'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FamilyMember } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  date?: string;
}

// 1. NODE COMPONENT
function TreeNodeComponent({ member, onViewDetails }: { member: FamilyMember; onViewDetails?: (m: FamilyMember) => void }) {
  const isDeceased = !!member.dateOfDeath;
  return (
    <div 
      className="flex items-center gap-3 cursor-pointer group"
      style={{ width: '200px' }}
      onClick={(e) => { e.stopPropagation(); onViewDetails?.(member); }}
    >
      <div className="relative flex-shrink-0 z-20">
        <div className={`p-1 rounded-full border-2 ${member.gender === 'male' ? 'border-blue-500' : 'border-pink-500'} bg-white shadow-lg transition-transform group-hover:scale-105`}>
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg ${member.gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
              {member.name?.charAt(0)}
            </div>
          )}
        </div>
        {isDeceased && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white text-white text-[10px] font-bold z-30">†</div>
        )}
      </div>
      <div className="flex-grow min-w-0 z-20">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 group-hover:border-slate-400 transition-colors">
          <p className="text-xs font-black text-slate-800 leading-tight truncate uppercase tracking-tighter">{member.name}</p>
        </div>
      </div>
    </div>
  );
}

// 2. RECURSIVE BRANCH COMPONENT
function FamilyUnitComponent({ primaryMember, allMembers, onViewDetails, visited = new Set() }: any) {
  if (visited.has(primaryMember.id)) return null;
  const currentVisited = new Set(visited);
  currentVisited.add(primaryMember.id);

  const normalize = (id: string | undefined | null) => id?.trim().toLowerCase() || '';
  const spouses = allMembers.filter((m: any) => (primaryMember.spouseIds || []).some((sid: any) => normalize(sid) === normalize(m.id)));
  const children = allMembers.filter((m: any) => normalize(m.fatherId) === normalize(primaryMember.id) || normalize(m.motherId) === normalize(primaryMember.id));

  return (
    <div className="flex items-center relative">
      <div className="flex flex-col items-center gap-4 min-w-[220px]">
        {spouses.map((spouse: any) => (
          <div key={spouse.id} className="relative pb-4">
            <TreeNodeComponent member={spouse} onViewDetails={onViewDetails} />
            <div className="absolute bottom-0 left-[26px] w-[2px] h-4 bg-slate-400" />
          </div>
        ))}
        <TreeNodeComponent member={primaryMember} onViewDetails={onViewDetails} />
      </div>

      {children.length > 0 && (
        <div className="flex items-center ml-12 relative">
          {/* Connector Line from Parent */}
          <div className="absolute left-[-48px] top-1/2 w-12 h-[2px] bg-slate-400 z-0" />
          
          {/* Vertical Spine */}
          <div className="absolute left-0 top-[24px] bottom-[24px] w-[2px] bg-slate-400 z-0" />

          <div className="flex flex-col gap-10">
            {children.map((child: any) => (
              <div key={child.id} className="relative pl-12 flex items-center">
                {/* Horizontal line to child */}
                <div className="absolute left-0 w-12 h-[2px] bg-slate-400 top-1/2 -translate-y-1/2 z-0" />
                <FamilyUnitComponent primaryMember={child} allMembers={allMembers} onViewDetails={onViewDetails} visited={currentVisited} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. MAIN COMPONENT
export default function FamilyTree({ members, rootMemberId, onViewDetails }: { members: FamilyMember[], rootMemberId?: string, onViewDetails?: (m: FamilyMember) => void }) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [zoom, setZoom] = useState(0.8);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryPhoto[]);
    });
    return () => unsubscribe();
  }, []);

  const rootMember = useMemo(() => {
    const normalize = (id: string | undefined | null) => id?.trim().toLowerCase() || '';
    if (!rootMemberId) return members[0];
    return members.find(m => normalize(m.id) === normalize(rootMemberId)) || members[0];
  }, [members, rootMemberId]);

  return (
    <div className="fixed inset-0 bg-slate-50 overflow-hidden flex flex-col">
      
      {/* HEADER & CONTROLS */}
      <header className="relative z-50 p-6 md:p-8 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900">Paudel Family Tree</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital Lineage Archive</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setShowGallery(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">📸 Gallery ({photos.length})</button>
            <div className="hidden md:flex gap-1 border-l border-slate-200 pl-3">
              <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="w-9 h-9 bg-white border border-slate-200 rounded-lg font-bold hover:bg-slate-50 shadow-sm">+</button>
              <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} className="w-9 h-9 bg-white border border-slate-200 rounded-lg font-bold hover:bg-slate-50 shadow-sm">-</button>
            </div>
        </div>
      </header>

      {/* SCROLLABLE VIEWPORT */}
      <div className="flex-grow overflow-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
        <div className="p-20 md:p-40" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: 'max-content' }}>
          {rootMember && (
            <FamilyUnitComponent 
              primaryMember={rootMember} 
              allMembers={members} 
              onViewDetails={(m: any) => setSelectedMember(m)} 
            />
          )}
        </div>
      </div>

      {/* FOOTER SIGNATURE */}
      <footer className="relative z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 px-8 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">© 2026 PAUDEL FAMILY TREE — ALL RIGHTS RESERVED</p>
        <div className="flex items-center gap-1">
           <span className="text-[9px] font-bold text-slate-400 uppercase">Designed & Developed By</span>
           <a href="https://bibekpaudel1337.com.np" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 hover:text-slate-900 transition-colors uppercase tracking-tight">Bibek Paudel</a>
        </div>
      </footer>

      {/* GALLERY OVERLAY */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-300">
            <header className="sticky top-0 bg-white/90 backdrop-blur-xl p-8 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Family Memories</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Secure Cloud Storage</p>
              </div>
              <button onClick={() => setShowGallery(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-black hover:bg-slate-200 transition-colors">✕</button>
            </header>
            
            <div className="p-8 md:p-16 bg-slate-50 min-h-screen">
              {photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">No photos found in database...</div>
              ) : (
                <div className="columns-1 md:columns-3 lg:columns-4 gap-6 space-y-6 max-w-7xl mx-auto">
                    {photos.map(p => (
                      <div key={p.id} className="break-inside-avoid bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <img src={p.url} className="w-full rounded-xl hover:opacity-90 transition-opacity" alt={p.title} />
                        <div className="mt-3 px-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase">{p.title}</h4>
                          {p.date && <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{p.date}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
        </div>
      )}

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMember(null)} />
          <div className="relative w-full max-w-sm bg-white p-10 rounded-[2.5rem] text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="h-24 w-24 rounded-3xl bg-slate-50 border border-slate-100 mx-auto mb-6 overflow-hidden flex items-center justify-center">
                {selectedMember.photoUrl ? (
                  <img src={selectedMember.photoUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-4xl font-black text-slate-200">{selectedMember.name?.charAt(0)}</span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">{selectedMember.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">{selectedMember.gender}</p>
              <button onClick={() => setSelectedMember(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}