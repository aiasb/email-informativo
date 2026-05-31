import React, { useState } from 'react';

const COLOR_PALETTES = {
  blue:   ['#EBF3FC', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5'],
  green:  ['#E6F6EF', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A'],
  lime:   ['#E8F9EE', '#CCFF90', '#B9F6CA', '#69F0AE', '#00E676'],
  orange: ['#FEF3E8', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726'],
  red:    ['#FDECEA', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350'],
  purple: ['#F3EAF9', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC'],
};

export default function InfoCard({ card, onIconClick, onUpdate, onMove, onRemove }) {
  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);

  const colors = COLOR_PALETTES[card.color] || COLOR_PALETTES.blue;

  const handleColorSelect = (color) => {
    onUpdate(card.id, { iconBg: color });
    setIsColorPopupOpen(false);
  };

  return (
    <div className={`info-card ${card.color}`} id={card.id}>
      <div
        className="card-icon"
        style={{ background: card.iconBg || '' }}
        onClick={() => onIconClick(card.id)}
        title="Trocar ícone"
      >
        {card.icon}
      </div>
      <div className="card-body">
        <div
          className="card-label"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => onUpdate(card.id, { label: e.target.innerHTML })}
          dangerouslySetInnerHTML={{ __html: card.label }}
        />
        <div
          className="card-content"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => onUpdate(card.id, { content: e.target.innerHTML })}
          dangerouslySetInnerHTML={{ __html: card.content }}
        />
      </div>
      <div className="card-actions">
        <button className="card-act-btn btn-up" onClick={() => onMove(card.id, -1)} title="Subir">▲</button>
        <button className="card-act-btn btn-down" onClick={() => onMove(card.id, 1)} title="Descer">▼</button>
        <button className="card-act-btn btn-color" onClick={() => setIsColorPopupOpen(!isColorPopupOpen)} title="Cor do ícone">🎨</button>
        <button className="card-act-btn btn-remove" onClick={() => onRemove(card.id)} title="Remover">🗑</button>
      </div>
      <div className={`color-popup ${isColorPopupOpen ? 'open' : ''}`}>
        {colors.map((c, idx) => (
          <div
            key={idx}
            className="cp-color"
            style={{ background: c }}
            onClick={() => handleColorSelect(c)}
          />
        ))}
      </div>
    </div>
  );
}
