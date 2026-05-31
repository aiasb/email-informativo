import React, { useRef } from 'react';

// Variável para guardar a seleção ativa do usuário
let savedRange = null;

export const saveSelection = () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
    savedRange = sel.getRangeAt(0).cloneRange();
  }
};

const restoreSelection = () => {
  if (!savedRange) return false;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
  return true;
};

// Funções utilitárias de formatação
const getEditableTarget = () => {
  if (savedRange) {
    let node = savedRange.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentNode;
    const ce = node.closest('[contenteditable]');
    if (ce) return ce;
  }
  const ae = document.activeElement;
  if (ae && ae.isContentEditable) return ae;
  return null;
};

export default function Toolbar({
  logoSrc,
  onChangeLogo,
  fontFamily,
  onChangeFont,
  sizes,
  onChangeSize,
  onExportFile,
  onImportFile,
  onExportHTML,
  isExportingHTML,
  onClearCache,
  showToast
}) {
  const logoInputRef = useRef(null);
  const importInputRef = useRef(null);

  // Formatações nativas
  const handleFmt = (cmd) => {
    restoreSelection();
    document.execCommand(cmd, false, null);
    savedRange = null;
  };

  // Marca-texto (Highlight)
  const handleHighlight = (color) => {
    if (!restoreSelection()) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);

    let container = range.commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentNode;
    if (!container.closest('[contenteditable]')) return;

    const mark = document.createElement('mark');
    mark.className = 'hl';
    mark.style.backgroundColor = color;
    mark.style.borderRadius = '3px';
    mark.style.padding = '0 2px';

    try {
      range.surroundContents(mark);
    } catch (e) {
      const fragment = range.extractContents();
      mark.appendChild(fragment);
      range.insertNode(mark);
    }

    sel.removeAllRanges();
    savedRange = null;
  };

  // Limpa marca-texto
  const handleClearHL = () => {
    if (!restoreSelection()) {
      const active = document.activeElement;
      if (active && active.isContentEditable) {
        active.querySelectorAll('mark.hl').forEach(m => {
          const parent = m.parentNode;
          while (m.firstChild) parent.insertBefore(m.firstChild, m);
          parent.removeChild(m);
        });
      }
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    let container = range.commonAncestorContainer;
    if (container.nodeType === 3) container = container.parentNode;
    const ce = container.closest('[contenteditable]');
    if (!ce) return;

    ce.querySelectorAll('mark.hl').forEach(m => {
      if (range.intersectsNode(m)) {
        const parent = m.parentNode;
        while (m.firstChild) parent.insertBefore(m.firstChild, m);
        parent.removeChild(m);
      }
    });

    sel.removeAllRanges();
    savedRange = null;
  };

  // Inserção de listas
  const handleInsertList = (type) => {
    const ce = getEditableTarget();
    if (!ce) {
      showToast('⚠️ Clique em um campo de texto primeiro');
      return;
    }
    ce.focus();

    let listEl;
    if (type === 'ol') {
      listEl = document.createElement('ol');
    } else {
      listEl = document.createElement('ul');
      listEl.className = `lista-${type}`;
    }

    let selectedText = '';
    if (savedRange && !savedRange.collapsed) selectedText = savedRange.toString();
    const lines = selectedText ? selectedText.split('\n').filter(l => l.trim()) : ['Item da lista'];

    lines.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line;
      listEl.appendChild(li);
    });

    if (savedRange) {
      restoreSelection();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(listEl);
        const firstLi = listEl.querySelector('li');
        if (firstLi) {
          const nr = document.createRange();
          nr.selectNodeContents(firstLi);
          nr.collapse(false);
          sel.removeAllRanges();
          sel.addRange(nr);
        }
      }
    } else {
      ce.appendChild(document.createElement('br'));
      ce.appendChild(listEl);
    }

    savedRange = null;
    showToast('📋 Lista inserida — edite os itens diretamente');
  };

  // Remoção de lista
  const handleRemoveList = () => {
    const ce = getEditableTarget();
    if (!ce) return;
    ce.querySelectorAll('ul, ol').forEach(list => {
      const txt = [...list.querySelectorAll('li')].map(li => li.textContent).join(' · ');
      list.replaceWith(document.createTextNode(txt));
    });
  };

  // Alinhamento
  const handleAlign = (dir) => {
    const ce = getEditableTarget();
    if (!ce) {
      showToast('⚠️ Clique em um campo de texto primeiro');
      return;
    }
    ce.style.textAlign = dir;
  };

  // Recuo (Indent)
  const handleIndent = (dir) => {
    const ce = getEditableTarget();
    if (!ce) {
      showToast('⚠️ Clique em um campo de texto primeiro');
      return;
    }
    const current = parseInt(ce.style.paddingLeft || '6') || 6;
    const next = Math.max(0, current + dir * 20);
    ce.style.paddingLeft = next + 'px';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <div className="tsec">
          <span className="tlabel">🖼 Logo</span>
          <button className="tbtn tbtn-grad" onClick={() => logoInputRef.current.click()}>📁 Alterar logo</button>
          <input
            type="file"
            ref={logoInputRef}
            id="logoFileInput"
            accept="image/*"
            onChange={onChangeLogo}
          />
        </div>
        <div className="tsec">
          <span className="tlabel">🔤 Fonte</span>
          <select value={fontFamily} onChange={(e) => onChangeFont(e.target.value)}>
            <option value="Barlow">Barlow</option>
            <option value="Barlow Condensed">Barlow Condensed</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
            <option value="Inter">Inter</option>
            <option value="DM Sans">DM Sans</option>
            <option value="IBM Plex Sans">IBM Plex Sans</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>
        <div className="tsec">
          <span className="tlabel">📂 Arquivo</span>
          <button className="tbtn tbtn-grad" onClick={onExportFile} title="Salvar arquivo editável (.tinf)">💾 Exportar</button>
          <button className="tbtn tbtn-grad" onClick={() => importInputRef.current.click()} title="Abrir arquivo salvo (.tinf)">📂 Importar</button>
          <input
            type="file"
            ref={importInputRef}
            id="importFileInput"
            accept=".tinf,.json"
            onChange={onImportFile}
            style={{ display: 'none' }}
          />
        </div>
        <button
          className="tbtn tbtn-print"
          id="btnExportHTML"
          onClick={onExportHTML}
          disabled={isExportingHTML}
        >
          {isExportingHTML ? '⏳ Gerando...' : '📧 Gerar E-mail HTML'}
        </button>
      </div>

      <div className="toolbar-row">
        <div className="tsec">
          <span className="tlabel">📐 Corpo</span>
          <input
            type="range"
            min="10"
            max="20"
            value={parseInt(sizes.body)}
            onChange={(e) => onChangeSize('body', e.target.value + 'px')}
          />
          <span className="sval">{sizes.body}</span>
        </div>
        <div className="tsec">
          <span className="tlabel">📐 Título</span>
          <input
            type="range"
            min="14"
            max="36"
            value={parseInt(sizes.title)}
            onChange={(e) => onChangeSize('title', e.target.value + 'px')}
          />
          <span className="sval">{sizes.title}</span>
        </div>
        <div className="tsec">
          <span className="tlabel">📐 Header</span>
          <input
            type="range"
            min="16"
            max="42"
            value={parseInt(sizes.header)}
            onChange={(e) => onChangeSize('header', e.target.value + 'px')}
          />
          <span className="sval">{sizes.header}</span>
        </div>
        <div className="tsec">
          <span className="tlabel">📐 Labels</span>
          <input
            type="range"
            min="8"
            max="16"
            value={parseInt(sizes.label)}
            onChange={(e) => onChangeSize('label', e.target.value + 'px')}
          />
          <span className="sval">{sizes.label}</span>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="tsec">
          <span className="tlabel">✏️ Formatação</span>
          <button className="mbtn" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFmt('bold')}><b>N</b></button>
          <button className="mbtn" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFmt('italic')}><i>I</i></button>
          <button className="mbtn" onMouseDown={(e) => e.preventDefault()} onClick={() => handleFmt('underline')}><u>S</u></button>
        </div>
        <div className="tsec">
          <span className="tlabel">🖍 Marcadores de texto</span>
          <button className="mbtn-hl" style={{ background: '#FFF176' }} title="Amarelo" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#FFF176')}>🟡</button>
          <button className="mbtn-hl" style={{ background: '#B9F6CA' }} title="Verde" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#B9F6CA')}>🟢</button>
          <button className="mbtn-hl" style={{ background: '#BBDEFB' }} title="Azul" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#BBDEFB')}>🔵</button>
          <button className="mbtn-hl" style={{ background: '#FFCDD2' }} title="Vermelho" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#FFCDD2')}>🔴</button>
          <button className="mbtn-hl" style={{ background: '#E1BEE7' }} title="Roxo" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#E1BEE7')}>🟣</button>
          <button className="mbtn-hl" style={{ background: '#FFE0B2' }} title="Laranja" onMouseDown={(e) => e.preventDefault()} onClick={() => handleHighlight('#FFE0B2')}>🟠</button>
          <button className="mbtn-clear" title="Remover marcação" onMouseDown={(e) => e.preventDefault()} onClick={handleClearHL}>✕ limpar</button>
        </div>
        <span className="thint">Selecione o texto → clique no marcador</span>
      </div>

      <div className="toolbar-row">
        <div className="tsec">
          <span className="tlabel">📋 Listas</span>
          <button className="mbtn" title="• Marcador" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('dot')} style={{ fontSize: '15px', minWidth: '32px' }}>•</button>
          <button className="mbtn" title="1. Numerada" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('ol')} style={{ fontSize: '11px', minWidth: '32px' }}>1.</button>
          <button className="mbtn" title="✅ Check" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('check')} style={{ fontSize: '14px', minWidth: '32px' }}>✅</button>
          <button className="mbtn" title="▶ Seta" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('arrow')} style={{ fontSize: '12px', minWidth: '32px' }}>▶</button>
          <button className="mbtn" title="— Traço" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('dash')} style={{ fontSize: '13px', minWidth: '32px' }}>—</button>
          <button className="mbtn" title="★ Estrela" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('star')} style={{ fontSize: '13px', minWidth: '32px' }}>★</button>
          <button className="mbtn" title="⚠️ Atenção" onMouseDown={(e) => e.preventDefault()} onClick={() => handleInsertList('warn')} style={{ fontSize: '13px', minWidth: '32px' }}>⚠️</button>
          <button className="mbtn-clear" onMouseDown={(e) => e.preventDefault()} onClick={handleRemoveList} title="Remover lista">✕ lista</button>
        </div>
        <div className="tsec">
          <span className="tlabel">⬛ Parágrafo</span>
          <button className="mbtn" title="Esquerda" onMouseDown={(e) => e.preventDefault()} onClick={() => handleAlign('left')} style={{ fontSize: '14px', minWidth: '32px' }}>≡</button>
          <button className="mbtn" title="Centro" onMouseDown={(e) => e.preventDefault()} onClick={() => handleAlign('center')} style={{ fontSize: '14px', minWidth: '32px' }}>☰</button>
          <button className="mbtn" title="Direita" onMouseDown={(e) => e.preventDefault()} onClick={() => handleAlign('right')} style={{ fontSize: '14px', minWidth: '32px' }}>⇒</button>
          <button className="mbtn" title="Justificar" onMouseDown={(e) => e.preventDefault()} onClick={() => handleAlign('justify')} style={{ fontSize: '13px', minWidth: '32px' }}>▤</button>
        </div>
        <div className="tsec">
          <span className="tlabel">↔ Recuo</span>
          <button className="mbtn" title="Aumentar recuo" onMouseDown={(e) => e.preventDefault()} onClick={() => handleIndent(1)} style={{ minWidth: '32px' }}>→</button>
          <button className="mbtn" title="Diminuir recuo" onMouseDown={(e) => e.preventDefault()} onClick={() => handleIndent(-1)} style={{ minWidth: '32px' }}>←</button>
        </div>
        <button
          className="mbtn-clear"
          style={{ marginLeft: 'auto' }}
          title="Limpar dados salvos no navegador"
          onClick={onClearCache}
        >
          🗑️ Limpar cache
        </button>
      </div>
    </div>
  );
}
