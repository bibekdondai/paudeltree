import { FamilyMember, TreeNode } from './types';

export function buildTreeStructure(
  members: FamilyMember[],
  rootId: string
): TreeNode | null {
  const memberMap = new Map(members.map(m => [m.id, m]));

  function buildNode(id: string, visited = new Set<string>()): TreeNode | null {
    if (!id || visited.has(id)) return null;
    visited.add(id);

    const member = memberMap.get(id);
    if (!member) return null;

    // Identify parents into a flat array for logic processing
    const parentIds = [member.fatherId, member.motherId].filter((id): id is string => !!id);

    const node: TreeNode = {
      id: member.id,
      name: member.name,
      photoUrl: member.photoUrl,
      generation: member.generation || 0,
      
      // CHILDREN: Look for anyone who lists this member as Father or Mother
      children: members
        .filter(m => m.fatherId === member.id || m.motherId === member.id)
        .map(child => buildNode(child.id, new Set(visited)))
        .filter((child): child is TreeNode => child !== null),

      // PARENTS: Use the new fatherId and motherId fields
      parents: parentIds
        .map(parentId => buildNode(parentId, new Set(visited)))
        .filter((parent): parent is TreeNode => parent !== null),

      // SPOUSES: Keep existing spouse logic
      spouses: (member.spouseIds || [])
        .map(spouseId => buildNode(spouseId, new Set(visited)))
        .filter((spouse): spouse is TreeNode => spouse !== null),
    };

    return node;
  }

  return buildNode(rootId);
}

export function flattenTree(node: TreeNode | null, result: TreeNode[] = []): TreeNode[] {
  if (!node) return result;
  if (!result.find(n => n.id === node.id)) {
    result.push(node);
  }
  if (node.children) {
    node.children.forEach(child => flattenTree(child, result));
  }
  if (node.parents) {
    node.parents.forEach(parent => flattenTree(parent, result));
  }
  if (node.spouses) {
    node.spouses.forEach(spouse => flattenTree(spouse, result));
  }
  return result;
}

export function getGenerationLevel(members: FamilyMember[], memberId: string): number {
  const member = members.find(m => m.id === memberId);
  return member?.generation ?? 0;
}

export function calculateGenerations(members: FamilyMember[]): void {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const visited = new Set<string>();

  function calculateGen(id: string, generation: number) {
    const member = memberMap.get(id);
    if (!member || visited.has(id)) return;
    visited.add(id);

    member.generation = generation;

    // Recurse to Parents (Upwards)
    if (member.fatherId) calculateGen(member.fatherId, generation - 1);
    if (member.motherId) calculateGen(member.motherId, generation - 1);

    // Recurse to Children (Downwards)
    const children = members.filter(m => m.fatherId === id || m.motherId === id);
    for (const child of children) {
      calculateGen(child.id, generation + 1);
    }
  }

  // Start from root ancestors (People with no father AND no mother)
  for (const member of members) {
    const hasNoParents = !member.fatherId && !member.motherId;
    if (hasNoParents && !visited.has(member.id)) {
      calculateGen(member.id, 0);
    }
  }
}