'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FamilyMember } from '@/lib/types';
import { db } from '@/lib/firebase'; // Ensure your firebase config is exported here
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  date?: string;
}

// Sub-component for individual family nodes
function TreeNodeComponent({ member, onViewDetails }: { member: FamilyMember; onViewDetails?: (m: FamilyMember) => void }) {
  const isDeceased = !!member.dateOfDeath;
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      style={{ width: '160px' }}
      onClick={(e) => { e.stopPropagation(); onViewDetails?.(member); }}
    >
      <div className="relative flex-shrink-0">
        <div className={`p-0.5 rounded-full border-2 ${member.gender === 'male' ? 'border-blue-400' : 'border-pink-400'} bg-white shadow-sm`}>
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400 font-bold uppercase text-sm">
              {member.name?.charAt(0)}
            </div>
          )}
        </div>
        {isDeceased && (
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-slate-800 flex items-center justify-center border border-white text-white text-[7px]">
            †
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-2 py-1 rounded shadow-sm inline-block max-w-full">
          <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">{member.name}</p>
        </div>
      </div>
    </div>
  );
}

// Recursive component to build the tree branches
function FamilyUnitComponent({ primaryMember, allMembers, onViewDetails, visited = new Set() }: any) {
  if (visited.has(primaryMember.id)) return null;
  const currentVisited = new Set(visited);
  currentVisited.add(primaryMember.id);

  const normalize = (id: string | undefined | null) => id?.trim().toLowerCase() || '';
  const spouses = allMembers.filter((m: any) => (primaryMember.spouseIds || []).some((sid: any) => normalize(sid) === normalize(m.id)));
  const children = allMembers.filter((m: any) => normalize(m.fatherId) === normalize(primaryMember.id) || normalize(m.motherId) === normalize(primaryMember.id));

  const middleIndex = Math.ceil(spouses.length / 2);
  const topSpouses = spouses.slice(0, middleIndex);
  const bottomSpouses = spouses.slice(middleIndex);

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-3 min-w-[180px]">
        {topSpouses.map((spouse: any) => (
          <div key={spouse.id} className="relative pb-2">
            <TreeNodeComponent member={spouse} onViewDetails={onViewDetails} />
            <div className="absolute bottom-0 left-1/2 w-px h-3 bg-slate-200 -translate-x-1/2" />
          </div>
        ))}
        <div className="relative z-10 scale-105">
          <TreeNodeComponent member={primaryMember} onViewDetails={onViewDetails} />
        </div>
        {bottomSpouses.map((spouse: any) => (
          <div key={spouse.id} className="relative pt-2">
            <div className="absolute top-0 left-1/2 w-px h-3 bg-slate-200 -translate-x-1/2" />
            <TreeNodeComponent member={spouse} onViewDetails={onViewDetails} />
          </div>
        ))}
      </div>
      {children.length > 0 && (
        <div className="flex items-center ml-8 relative">
          <div className="absolute left-[-32px] top-1/2 w-8 h-0.5 bg-slate-200 -translate-y-1/2" />
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" style={{ top: children.length > 1 ? '1.5rem' : '50%', bottom: children.length > 1 ? '1.5rem' : '50%' }} />
          <div className="flex flex-col gap-6">
            {children.map((child: any) => (
              <div key={child.id} className="relative pl-8 flex items-center">
                <div className="absolute left-0 w-8 h-0.5 bg-slate-200 top-1/2 -translate-y-1/2" />
                <FamilyUnitComponent primaryMember={child} allMembers={allMembers} onViewDetails={onViewDetails} visited={currentVisited} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyTree({ members, rootMemberId = 'chakrapani_paudel', onViewDetails }: { members: FamilyMember[], rootMemberId?: string, onViewDetails?: (m: FamilyMember) => void }) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const zoom = 0.4;

  // FETCH FIREBASE GALLERY DATA
  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryPhoto[];
      setPhotos(photoList);
    });
    return () => unsubscribe();
  }, []);

  const rootMember = useMemo(() => {
    const normalize = (id: string | undefined | null) => id?.trim().toLowerCase() || '';
    return members.find(m => normalize(m.id) === normalize(rootMemberId)) || members[0];
  }, [members, rootMemberId]);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden select-none">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 pt-8 pb-12 bg-gradient-to-b from-slate-50 via-slate-50/95 to-transparent pointer-events-none text-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Paudel Family</h1>
      </header>

      {/* DYNAMIC GALLERY BUTTON */}
      <button 
        onClick={() => setShowGallery(true)}
        className="absolute top-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50 bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all pointer-events-auto"
      >
        📸 {photos.length > 0 ? `Memories (${photos.length})` : 'Gallery'}
      </button>

      {/* TREE VIEWPORT */}
      <div className="flex-grow overflow-auto touch-auto custom-scrollbar flex justify-start items-start">
        <div className="relative flex justify-center py-[200px] px-[400px] min-w-full">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: 'max-content', height: 'max-content' }}>
            {rootMember && (
              <FamilyUnitComponent primaryMember={rootMember} allMembers={members} onViewDetails={(m: any) => setSelectedMember(m)} />
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-0 left-0 right-0 z-40 pb-4 pt-10 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pointer-events-none">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Bibek Paudel</p>
            <a href="https://bibekpaudel1337.com.np" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 pointer-events-auto">bibekpaudel1337.com.np</a>
          </div>
      </footer>

      {/* FIREBASE GALLERY PAGE (OVERLAY) */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
          <div className="p-4 md:p-8 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Memories</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Family Collection</p>
            </div>
            <button onClick={() => setShowGallery(false)} className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-xl hover:bg-slate-200 transition-colors">✕</button>
          </div>

          <div className="flex-grow overflow-y-auto bg-slate-50 p-4 md:p-12">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold uppercase text-xs tracking-widest">No photos found in database...</div>
            ) : (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 max-w-7xl mx-auto">
                {photos.map((photo) => (
                  <div key={photo.id} className="break-inside-avoid bg-white rounded-2xl p-2 shadow-sm border border-slate-200/50 hover:shadow-lg transition-shadow">
                    <img src={photo.url} alt={photo.title} className="w-full h-auto rounded-xl" loading="lazy" />
                    <div className="p-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{photo.title}</h4>
                      {photo.date && <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-widest">{photo.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="h-20" />
          </div>
        </div>
      )}

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
             <div className="flex items-center gap-6 mb-8">
               <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                  {selectedMember.photoUrl ? <img src={selectedMember.photoUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-black">{selectedMember.name?.charAt(0)}</div>}
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{selectedMember.name}</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{selectedMember.gender}</p>
               </div>
             </div>
             <button onClick={() => setSelectedMember(null)} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[11px]">Close Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}