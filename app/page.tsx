'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FamilyMember } from '@/lib/types';
import { getAllFamilyMembers } from '@/lib/firestoreService';
import FamilyTree from '@/components/FamilyTree';

export default function Home() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [rootMemberId, setRootMemberId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    try {
      setError(null);
      const data = await getAllFamilyMembers();
      setMembers(data);
      
      // Set root member (oldest/first ancestor)
      if (data.length > 0) {
        const minGen = Math.min(...data.map(m => m.generation));
        const rootMembers = data.filter(m => m.generation === minGen);
        if (rootMembers.length > 0) {
          setRootMemberId(rootMembers[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[v0] Error loading family data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paudel Family Tree</h1>
            <p className="mt-2 text-gray-600">Explore our family genealogy and connections</p>
          </div>
          <Link
            href="/admin/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Error loading family tree:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Family tree is empty</h2>
            <p className="text-gray-600 mb-4">No family members have been added yet.</p>
            <Link
              href="/admin/login"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Admin to add members
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg bg-white border border-gray-200 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Family Tree</h2>
                <div className="text-sm text-gray-600">
                  Total members: <span className="font-semibold">{members.length}</span>
                </div>
              </div>
              <FamilyTree
                members={members}
                rootMemberId={rootMemberId}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Paudel Family Tree. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
