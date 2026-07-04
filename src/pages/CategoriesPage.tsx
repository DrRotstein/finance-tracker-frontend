import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '../api/categories';
import ConfirmDialog from '../components/ConfirmDialog';
import { ToastContainer, useToasts } from '../components/Toast';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toasts, addToast, dismissToast } = useToasts();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      addToast('Category created', 'success');
    },
    onError: (err: Error) => addToast(err.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      setEditName('');
      addToast('Category updated', 'success');
    },
    onError: (err: Error) => addToast(err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
      addToast('Category deleted', 'success');
    },
    onError: (err: Error) => {
      setDeleteTarget(null);
      addToast(err.message, 'error');
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    updateMutation.mutate({ id: editingId, name: editName.trim() });
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  if (error) {
    return (
      <main style={styles.page}>
        <h1 style={styles.title}>Categories</h1>
        <div style={styles.errorBox}>
          <p>⚠️ Failed to load categories</p>
          <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{(error as Error).message}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <h1 style={styles.title}>Categories</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} style={styles.createForm}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          style={styles.input}
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !newName.trim()}
          style={styles.createBtn}
        >
          {createMutation.isPending ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {/* Category list */}
      {isLoading ? (
        <div style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeletonRow}>
              <div style={{ ...styles.skeletonLine, width: '60%' }} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p style={styles.emptyText}>No categories yet. Create one above.</p>
      ) : (
        <div style={styles.listContainer}>
          {categories.map((cat) => (
            <div key={cat.id} style={styles.row}>
              {editingId === cat.id ? (
                <form onSubmit={handleUpdate} style={styles.editForm}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={styles.input}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={updateMutation.isPending || !editName.trim()}
                    style={styles.saveBtn}
                  >
                    Save
                  </button>
                  <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span style={styles.catName}>{cat.name}</span>
                  <div style={styles.rowActions}>
                    <button onClick={() => startEdit(cat)} style={styles.editBtn}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} style={styles.deleteBtn}>
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete category?"
          message={`Are you sure you want to delete "${deleteTarget.name}"? Transactions using this category will lose their category assignment.`}
          confirmLabel="Delete"
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '1.5rem 1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#1e293b',
  },
  createForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #d0d7de',
    fontSize: '0.875rem',
  },
  createBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  listContainer: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  catName: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  rowActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #fecaca',
    backgroundColor: '#fff',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    color: '#dc2626',
  },
  editForm: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
  },
  saveBtn: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#16a34a',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #d0d7de',
    backgroundColor: '#fff',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  errorBox: {
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    textAlign: 'center',
    padding: '2rem 0',
  },
  skeletonRow: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  skeletonLine: {
    height: '1rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
  },
};
