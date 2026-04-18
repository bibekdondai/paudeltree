export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  photoUrl?: string;
 fatherId: string | null;
  motherId: string | null;
  spouseIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface TreeNode {
  id: string;
  name: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  photoUrl?: string;
  parents?: TreeNode[];
  children?: TreeNode[];
  spouses?: TreeNode[];
  generation: number;
}
