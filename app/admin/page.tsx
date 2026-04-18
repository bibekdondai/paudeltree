'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { FamilyMember } from '@/lib/types';
import { getAllFamilyMembers } from '@/lib/firestoreService';
// 1. ADD THE GALLERY IMPORT HERE
import { AddMemberForm, EditMemberForm, MembersList, GalleryLinkForm } from '@/components/AdminForms';

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setError(null);
      const data = await getAllFamilyMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-500">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: UPLOADS & NEW MEMBERS */}
          <div className="lg:col-span-1 space-y-8">
  <GalleryLinkForm /> {/* Changed from GalleryUploadForm */}
  <AddMemberForm
    allMembers={members}
    onMemberAdded={(member) => {
      setMembers([...members, member]);
    }}
  />
</div>

          {/* MIDDLE COLUMN: DIRECTORY */}
          <div className="lg:col-span-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 bg-white rounded-xl border border-gray-100">
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 mb-2" />
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading members...</p>
              </div>
            ) : (
              <MembersList
                members={members}
                onSelectMember={setSelectedMember}
                onDeleteMember={(memberId) => {
                  setMembers(members.filter(m => m.id !== memberId));
                  if (selectedMember?.id === memberId) {
                    setSelectedMember(null);
                  }
                }}
              />
            )}
          </div>

          {/* RIGHT COLUMN: EDITING */}
          <div className="lg:col-span-1">
            {selectedMember ? (
              <EditMemberForm
                member={selectedMember}
                allMembers={members}
                onMemberUpdated={(updated) => {
                  setMembers(
                    members.map(m => (m.id === updated.id ? updated : m))
                  );
                }}
              />
            ) : (
              <div className="h-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-center p-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                  Select a family member<br/>from the directory to edit
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}