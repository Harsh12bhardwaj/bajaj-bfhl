import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = body.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid request, 'data' must be an array" },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const invalid_entries: string[] = [];
    const duplicate_edges: string[] = [];
    const valid_edges: string[] = [];
    const seen_edges = new Set<string>();

    // 1. Validation & Duplicates
    for (const entry of data) {
      if (typeof entry !== 'string') {
        invalid_entries.push(String(entry));
        continue;
      }

      const trimmed = entry.trim();
      if (!/^[A-Z]->[A-Z]$/.test(trimmed)) {
        invalid_entries.push(entry);
      } else {
        if (seen_edges.has(trimmed)) {
          duplicate_edges.push(trimmed);
        } else {
          seen_edges.add(trimmed);
          valid_edges.push(trimmed);
        }
      }
    }

    // 2. Discard multi-parents & Build Graph
    const parentMap: Record<string, string> = {};
    const childrenMap: Record<string, string[]> = {};
    const nodes = new Set<string>();

    for (const edge of valid_edges) {
      const [u, v] = edge.split("->");
      if (parentMap[v]) {
        // Discard subsequent parents silently
        continue;
      }
      parentMap[v] = u;
      if (!childrenMap[u]) childrenMap[u] = [];
      childrenMap[u].push(v);
      nodes.add(u);
      nodes.add(v);
    }

    // 3. Find weakly connected components
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n] = []);
    for (const v in parentMap) {
      const u = parentMap[v];
      adj[u].push(v);
      adj[v].push(u);
    }

    const visited = new Set<string>();
    const components: string[][] = [];

    nodes.forEach(node => {
      if (!visited.has(node)) {
        const comp: string[] = [];
        const q = [node];
        visited.add(node);
        while (q.length > 0) {
          const curr = q.shift()!;
          comp.push(curr);
          for (const neighbor of adj[curr]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              q.push(neighbor);
            }
          }
        }
        components.push(comp);
      }
    });

    // 4. Process Components
    const hierarchies: any[] = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root: string | null = null;
    let max_depth = -1;

    // Helper functions for tree processing
    const buildTree = (node: string): any => {
      const obj: any = {};
      const children = childrenMap[node] || [];
      // Sort children alphabetically for consistent output (optional but good practice)
      const sortedChildren = [...children].sort();
      for (const child of sortedChildren) {
        obj[child] = buildTree(child);
      }
      return obj;
    };

    const getDepth = (node: string): number => {
      let max_d = 0;
      const children = childrenMap[node] || [];
      for (const child of children) {
        max_d = Math.max(max_d, getDepth(child));
      }
      return 1 + max_d;
    };

    for (const comp of components) {
      const compRoots = comp.filter(n => !parentMap[n]);
      
      if (compRoots.length === 0) {
        // Pure cycle
        comp.sort();
        const root = comp[0];
        hierarchies.push({
          root,
          has_cycle: true,
          tree: {}
        });
        total_cycles++;
      } else {
        // Valid tree (1 root, due to max in-degree 1)
        const root = compRoots[0];
        const depth = getDepth(root);
        const tree: any = {};
        tree[root] = buildTree(root);
        
        hierarchies.push({
          root,
          depth,
          tree
        });
        total_trees++;

        if (depth > max_depth) {
          max_depth = depth;
          largest_tree_root = root;
        } else if (depth === max_depth) {
          if (largest_tree_root === null || root < largest_tree_root) {
            largest_tree_root = root;
          }
        }
      }
    }

    const response = {
      user_id: "harshbhardwaj_12072005",
      email_id: "hb7945@srmist.edu.in",
      college_roll_number: "RA2311003010633",
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary: {
        total_trees,
        total_cycles,
        largest_tree_root
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
