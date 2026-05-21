import { Trash2 } from 'lucide-react';

interface ToolbarProps {
    onDelete: () => void;
    onColorChange: (color: string) => void;
    onTextColorChange: (color: string) => void;
    onFontChange: (font: string) => void;
}

const COLORS = ['#FFFFFF', '#E3F2FD', '#E8F5E9', '#FFFDE7'];
const TEXT_COLORS = ['#000000', '#D32F2F', '#1976D2', '#388E3C'];
const FONTS = ['Inter, sans-serif', 'Georgia, serif', 'Courier New, monospace'];

export function Toolbar({ onDelete, onColorChange, onTextColorChange, onFontChange }: ToolbarProps) {
    return (
        <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            background: '#fff', padding: '10px', borderRadius: '12px', border: '1px solid #ddd',
            display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            {/* Выбор цвета фона */}
            <div style={{ display: 'flex', gap: '5px' }}>
                {COLORS.map(c => <button key={c} onClick={() => onColorChange(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid #ccc', cursor: 'pointer' }} />)}
            </div>

            {/* Выбор цвета текста */}
            <div style={{ display: 'flex', gap: '5px' }}>
                {TEXT_COLORS.map(c => <button key={c} onClick={() => onTextColorChange(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid #ccc', cursor: 'pointer' }} />)}
            </div>

            {/* Выбор шрифта */}
            <select onChange={(e) => onFontChange(e.target.value)} style={{ padding: '2px 5px', fontSize: '12px' }}>
                {FONTS.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
            </select>

            <button onClick={onDelete} style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                <Trash2 size={14} />
            </button>
        </div>
    );
}