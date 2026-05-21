import { Trash2 } from 'lucide-react';

interface ToolbarProps {
    onDelete: () => void;
    onColorChange: (color: string) => void;
}

const COLORS = ['#FFFFFF', '#E3F2FD', '#E8F5E9', '#FFFDE7', '#FCE4EC'];

export function Toolbar({ onDelete, onColorChange }: ToolbarProps) {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: '#fff',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }}>
            {/* Цвета */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => onColorChange(c)}
                        style={{
                            width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ddd',
                            background: c, cursor: 'pointer'
                        }}
                    />
                ))}
            </div>

            <div style={{ width: '1px', height: '24px', background: '#eee' }} />

            {/* Удаление */}
            <button
                onClick={onDelete}
                style={{
                    display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px',
                    cursor: 'pointer', border: 'none', background: '#ff4d4f', color: '#fff',
                    borderRadius: '6px', fontSize: '12px', fontWeight: 600
                }}
            >
                <Trash2 size={14} /> Удалить
            </button>
        </div>
    );
}