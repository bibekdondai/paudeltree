'use client';

import React, { useState, useEffect } from 'react';
import { FamilyMember } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import {
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  addSpouseRelationship,
  removeSpouseRelationship,
} from '@/lib/firestoreService';

// --- 1. GALLERY LINK FORM (External Links Only) ---
export function GalleryLinkForm() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      setError('Title and Image URL are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'gallery'), {
        title,
        url,
        date,
        order: Date.now(),
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setUrl('');
      setDate('');
      alert("Memory saved to gallery!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 leading-none">Add Memory</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b pb-3">External Link Hosting</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {url && (
          <div className="w-full h-32 rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center">
            <img 
              src={url} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              onError={() => setError("Invalid image link. Make sure it's a direct link to an image.")}
            />
          </div>
        )}

        <input
          type="text"
          placeholder="Memory Title (e.g., Annual Gathering 2024)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
        
        <input
          type="url"
          placeholder="Paste Image Link (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Year (Optional)"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
        />

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || !url}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-black transition-colors"
        >
          {loading ? 'Saving...' : 'Save Memory'}
        </button>
      </form>
    </div>
  );
}

// --- 2. ADD MEMBER FORM (Original) ---
export function AddMemberForm({ 
  allMembers = [], 
  onMemberAdded 
}: { 
  allMembers?: FamilyMember[], 
  onMemberAdded?: (member: FamilyMember) => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    photoUrl: '',
    fatherId: '',
    motherId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newMember: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        gender: formData.gender as 'male' | 'female',
        photoUrl: formData.photoUrl || undefined,
        fatherId: formData.fatherId || null,
        motherId: formData.motherId || null,
        spouseIds: [],
      };

      const id = await addFamilyMember(newMember);
      onMemberAdded?.({
        id,
        ...newMember,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as FamilyMember);

      setFormData({ name: '', gender: 'male', photoUrl: '', fatherId: '', motherId: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 leading-none">Add Member</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b pb-3">Tree Management</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Father</label>
            <select
              value={formData.fatherId}
              onChange={e => setFormData({ ...formData, fatherId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
            >
              <option value="">Select Father...</option>
              {allMembers.filter(m => m.gender === 'male').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Mother</label>
            <select
              value={formData.motherId}
              onChange={e => setFormData({ ...formData, motherId: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
            >
              <option value="">Select Mother...</option>
              {allMembers.filter(m => m.gender === 'female').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <input
          type="url"
          placeholder="Profile Photo Link"
          value={formData.photoUrl}
          onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs outline-none"
        />

        {error && <div className="text-xs text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading || !formData.name}
          className="w-full rounded-md bg-blue-600 py-2.5 text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100"
        >
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}

// --- 3. EDIT MEMBER FORM (Original) ---
export function EditMemberForm({
  member,
  onMemberUpdated,
  allMembers = [],
}: {
  member: FamilyMember;
  onMemberUpdated?: (member: FamilyMember) => void;
  allMembers?: FamilyMember[];
}) {
  const [formData, setFormData] = useState({
    ...member,
    spouseIds: member.spouseIds || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpouse, setSelectedSpouse] = useState<string>('');
  const [relationshipLoading, setRelationshipLoading] = useState(false);

  useEffect(() => {
    setFormData({ ...member, spouseIds: member.spouseIds || [] });
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { id, createdAt, updatedAt, ...updateData } = formData;
      await updateFamilyMember(id, updateData);
      onMemberUpdated?.({ ...formData });
      alert("Changes saved!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpouse = async () => {
    if (!selectedSpouse) return;
    setRelationshipLoading(true);
    try {
      await addSpouseRelationship(member.id, selectedSpouse);
      const updatedSpouses = [...new Set([...(formData.spouseIds || []), selectedSpouse])];
      setFormData(prev => ({ ...prev, spouseIds: updatedSpouses }));
      setSelectedSpouse('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRelationshipLoading(false);
    }
  };

  const handleRemoveSpouse = async (spouseId: string) => {
    if (!confirm("Unlink this spouse?")) return;
    setRelationshipLoading(true);
    try {
      await removeSpouseRelationship(member.id, spouseId);
      setFormData(prev => ({
        ...prev,
        spouseIds: (prev.spouseIds || []).filter(id => id !== spouseId),
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRelationshipLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Edit {member.name}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        
        <input
          type="url"
          placeholder="Photo Link"
          value={formData.photoUrl || ''}
          onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Father</label>
              <select 
                value={formData.fatherId || ''} 
                onChange={e => setFormData({...formData, fatherId: e.target.value})}
                className="w-full bg-transparent text-sm font-medium outline-none"
              >
                <option value="">None</option>
                {allMembers.filter(m => m.gender === 'male' && m.id !== member.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Mother</label>
              <select 
                value={formData.motherId || ''} 
                onChange={e => setFormData({...formData, motherId: e.target.value})}
                className="w-full bg-transparent text-sm font-medium outline-none"
              >
                <option value="">None</option>
                {allMembers.filter(m => m.gender === 'female' && m.id !== member.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
           </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-slate-900 py-2.5 text-white font-bold text-[11px] uppercase tracking-widest">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest">Spouses</h4>
        <div className="flex flex-wrap gap-2">
          {(formData.spouseIds || []).map(spouseId => {
            const s = allMembers.find(m => m.id === spouseId);
            return (
              <div key={spouseId} className="flex items-center gap-2 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-[10px] font-bold text-pink-700">
                {s?.name || 'Unknown'}
                <button onClick={() => handleRemoveSpouse(spouseId)} className="text-red-500 hover:text-red-800">×</button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSpouse}
            onChange={e => setSelectedSpouse(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="">Link Spouse...</option>
            {allMembers
              .filter(m => m.id !== member.id && !(formData.spouseIds || []).includes(m.id))
              .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button type="button" onClick={handleAddSpouse} disabled={relationshipLoading || !selectedSpouse} className="rounded bg-green-600 px-4 py-1 text-white text-[10px] font-bold uppercase">
            Link
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 4. MEMBERS LIST (Original) ---
export function MembersList({
  members,
  onSelectMember,
  onDeleteMember,
}: {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onDeleteMember: (memberId: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    setLoading(memberId);
    try {
      await deleteFamilyMember(memberId);
      onDeleteMember(memberId);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 leading-none">Directory</h3>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b pb-3">Count: {members.length}</p>
      <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between rounded-md border border-gray-50 p-3 hover:bg-slate-50 transition-all group">
            <div className="flex-1 cursor-pointer" onClick={() => onSelectMember(member)}>
              <p className="font-bold text-gray-800 text-sm leading-tight">{member.name}</p>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{member.gender}</p>
            </div>
            <button
              onClick={() => handleDelete(member.id)}
              disabled={loading === member.id}
              className="opacity-0 group-hover:opacity-100 ml-2 text-[9px] text-red-400 hover:text-red-700 font-black tracking-widest transition-opacity"
            >
              {loading === member.id ? '...' : 'DELETE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}