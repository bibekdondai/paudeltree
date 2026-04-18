'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { db as getDb } from './firebase';
import { FamilyMember } from './types';
import { calculateGenerations } from './treeUtils';

const MEMBERS_COLLECTION = 'familyMembers';

// Helper to ensure db is available
const getDatabase = (): Firestore => {
  if (!getDb) {
    throw new Error('Firebase is not initialized');
  }
  return getDb;
};

export async function addFamilyMember(
  member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getDatabase();
  const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
    ...member,
    createdAt: Timestamp.now().toMillis(),
    updatedAt: Timestamp.now().toMillis(),
  });
  return docRef.id;
}

export async function updateFamilyMember(
  id: string,
  updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>
): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, id);
  await updateDoc(memberRef, {
    ...updates,
    updatedAt: Timestamp.now().toMillis(),
  });
}

export async function deleteFamilyMember(id: string): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, id);
  
  // Get all members to clean up relationships
  const allMembers = await getAllFamilyMembers();
  
  // Remove this member from all parent/spouse relationships
  for (const member of allMembers) {
    const updates: any = {};
    
    if (member.parentIds.includes(id)) {
      updates.parentIds = member.parentIds.filter(pid => pid !== id);
    }
    if (member.spouseIds.includes(id)) {
      updates.spouseIds = member.spouseIds.filter(sid => sid !== id);
    }
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, MEMBERS_COLLECTION, member.id), updates);
    }
  }
  
  await deleteDoc(memberRef);
}

export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  const docRef = doc(db, MEMBERS_COLLECTION, id);
  const docSnap = await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', id)));
  
  if (docSnap.empty) return null;
  
  const data = docSnap.docs[0].data();
  return {
    id: docSnap.docs[0].id,
    ...data,
  } as FamilyMember;
}

export async function getAllFamilyMembers(): Promise<FamilyMember[]> {
  const db = getDatabase();
  const querySnapshot = await getDocs(collection(db, MEMBERS_COLLECTION));
  const members: FamilyMember[] = [];
  
  querySnapshot.forEach(docSnap => {
    members.push({
      id: docSnap.id,
      ...docSnap.data(),
    } as FamilyMember);
  });
  
  // Calculate generations
  calculateGenerations(members);
  
  return members;
}

export async function addParentRelationship(memberId: string, parentId: string): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  const memberData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', memberId)))).docs[0]?.data() as FamilyMember;
  
  if (memberData && !memberData.parentIds.includes(parentId)) {
    await updateDoc(memberRef, {
      parentIds: [...memberData.parentIds, parentId],
      updatedAt: Timestamp.now().toMillis(),
    });
  }
}

export async function removeParentRelationship(memberId: string, parentId: string): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  const memberData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', memberId)))).docs[0]?.data() as FamilyMember;
  
  if (memberData) {
    await updateDoc(memberRef, {
      parentIds: memberData.parentIds.filter(id => id !== parentId),
      updatedAt: Timestamp.now().toMillis(),
    });
  }
}

export async function addSpouseRelationship(memberId: string, spouseId: string): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  const spouseRef = doc(db, MEMBERS_COLLECTION, spouseId);
  
  const memberData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', memberId)))).docs[0]?.data() as FamilyMember;
  const spouseData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', spouseId)))).docs[0]?.data() as FamilyMember;
  
  if (memberData && !memberData.spouseIds.includes(spouseId)) {
    await updateDoc(memberRef, {
      spouseIds: [...memberData.spouseIds, spouseId],
      updatedAt: Timestamp.now().toMillis(),
    });
  }
  
  if (spouseData && !spouseData.spouseIds.includes(memberId)) {
    await updateDoc(spouseRef, {
      spouseIds: [...spouseData.spouseIds, memberId],
      updatedAt: Timestamp.now().toMillis(),
    });
  }
}

export async function removeSpouseRelationship(memberId: string, spouseId: string): Promise<void> {
  const db = getDatabase();
  const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
  const spouseRef = doc(db, MEMBERS_COLLECTION, spouseId);
  
  const memberData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', memberId)))).docs[0]?.data() as FamilyMember;
  const spouseData = (await getDocs(query(collection(db, MEMBERS_COLLECTION), where('__name__', '==', spouseId)))).docs[0]?.data() as FamilyMember;
  
  if (memberData) {
    await updateDoc(memberRef, {
      spouseIds: memberData.spouseIds.filter(id => id !== spouseId),
      updatedAt: Timestamp.now().toMillis(),
    });
  }
  
  if (spouseData) {
    await updateDoc(spouseRef, {
      spouseIds: spouseData.spouseIds.filter(id => id !== memberId),
      updatedAt: Timestamp.now().toMillis(),
    });
  }
}
