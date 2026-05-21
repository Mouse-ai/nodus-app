import { Trash2 } from 'lucide-react';

interface ToolbarProps {
    onDelete: () => void;
}

export function Toolbar({ onDelete }: ToolbarProps) {
    return (
        <div style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: '#fff',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            display: 'flex',
            gap: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}>
            <button
                onClick={onDelete}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    border: 'none',
                    background: '#ff4d4f',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500
                }}
            >
                <Trash2 size={16} /> Удалить блок
            </button>
        </div>
    );
}