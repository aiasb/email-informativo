import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

import Toolbar, { saveSelection } from './components/Toolbar';
import CalendarModal from './components/CalendarModal';
import IconPickerModal from './components/IconPickerModal';
import InfoCard from './components/InfoCard';
import AlertCard from './components/AlertCard';
import { DEFAULT_LOGO } from './assets/default_logo';

const CACHE_KEY = 'ti_informa_cache_v1';

const INITIAL_FIELDS = {
  headerEye: 'INFORMA',
  headerTitle: 'TI INFORMA',
  dateDisplay: '26 Mai 2026',
  commTitle: 'COMUNICADO TI',
  commSub: 'INFORMAÇÃO E PREVENÇÃO',
  bodyText: 'Prezados colaboradores,<br><br>Gostaríamos de informar que realizaremos uma <strong>manutenção programada</strong> em nossos servidores para melhorias de infraestrutura e segurança.<br><br>Durante o período indicado, alguns sistemas poderão apresentar instabilidade temporária. Agradecemos a compreensão de todos.',
  alertTitle: 'ATENÇÃO!',
  alertText: 'Lembramos que a manutenção poderá ser concluída antes do prazo previsto. Fique atento aos novos comunicados para atualizações.',
  footerText: 'Uso interno · Não encaminhe externamente'
};

const INITIAL_CARDS = [
  { id: 'card-1', color: 'blue', icon: '🖥️', iconBg: '', label: 'SISTEMAS AFETADOS', content: 'ERP · Portal RH · E-mail Corporativo · Intranet' },
  { id: 'card-2', color: 'green', icon: '🕐', iconBg: '', label: 'PERÍODO', content: 'Início: Sex. 29/05 — 22h00 | Término: Sáb. 30/05 — 02h00' },
  { id: 'card-3', color: 'lime', icon: '📞', iconBg: '', label: 'CONTATO TI', content: 'E-mail: ti@empresa.com.br | Ramal: 2200' }
];

export default function App() {
  // Estados de customização visual
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO);
  const [fontFamily, setFontFamily] = useState('Barlow');
  const [sizes, setSizes] = useState({
    body: '14px',
    title: '22px',
    header: '28px',
    label: '10px'
  });

  // Estados de conteúdo
  const [headerEye, setHeaderEye] = useState(INITIAL_FIELDS.headerEye);
  const [headerTitle, setHeaderTitle] = useState(INITIAL_FIELDS.headerTitle);
  const [dateDisplay, setDateDisplay] = useState(INITIAL_FIELDS.dateDisplay);
  const [commTitle, setCommTitle] = useState(INITIAL_FIELDS.commTitle);
  const [commSub, setCommSub] = useState(INITIAL_FIELDS.commSub);
  const [bodyText, setBodyText] = useState(INITIAL_FIELDS.bodyText);
  const [mainIcon, setMainIcon] = useState('🔧');
  const [alertIcon, setAlertIcon] = useState('⚠️');
  const [alertTitle, setAlertTitle] = useState(INITIAL_FIELDS.alertTitle);
  const [alertText, setAlertText] = useState(INITIAL_FIELDS.alertText);
  const [footerText, setFooterText] = useState(INITIAL_FIELDS.footerText);

  // Estado dos cartões
  const [cards, setCards] = useState(INITIAL_CARDS);

  // Estados de controle de modais
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState(null); // 'main', 'alert' ou cardId

  // Estado de status do PNG
  const [isExportingPNG, setIsExportingPNG] = useState(false);

  // Ref para gerar identificadores únicos para novos cartões
  const cardCounterRef = useRef(3);

  // Efeito para sincronizar os sliders de tamanhos de fonte no CSS do documento
  useEffect(() => {
    document.documentElement.style.setProperty('--size-body', sizes.body);
    document.documentElement.style.setProperty('--size-title', sizes.title);
    document.documentElement.style.setProperty('--size-header', sizes.header);
    document.documentElement.style.setProperty('--size-label', sizes.label);
  }, [sizes]);

  // Carrega cache do localStorage na montagem
  useEffect(() => {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        loadData(data);
        showToast('📂 Dados restaurados do navegador');
      } catch (e) {
        console.warn('Erro ao restaurar cache:', e);
      }
    }
  }, []);

  // Efeito para Auto-save automático com debounce (800ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCache();
    }, 800);
    return () => clearTimeout(timer);
  }, [
    logoSrc, fontFamily, sizes, headerEye, headerTitle, dateDisplay,
    commTitle, commSub, bodyText, mainIcon, alertIcon, alertTitle, alertText, footerText, cards
  ]);

  // Toast Visual
  const showToast = (msg) => {
    let t = document.getElementById('cache-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cache-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
  };

  // Salvar cache no localStorage
  const saveCache = () => {
    try {
      const data = {
        logoSrc,
        fontFamily,
        sizes,
        headerEye,
        headerTitle,
        dateDisplay,
        commTitle,
        commSub,
        bodyText,
        mainIcon,
        alertIcon,
        alertTitle,
        alertText,
        footerText,
        cards,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  };

  // Mapear dados antigos (.tinf legado) e novos
  const loadData = (data) => {
    if (!data) return;
    
    // Suporte a arquivos legados exportados do antigo editor HTML
    const isLegacy = data.fields && data.fields.field_0 !== undefined;
    
    if (isLegacy) {
      const f = data.fields;
      const legacyCards = data.cards || [];
      
      setLogoSrc(data.logoSrc || DEFAULT_LOGO);
      setFontFamily(data.fontFamily || 'Barlow');
      if (data.sizes) setSizes(data.sizes);
      
      setHeaderEye(f.field_0 || 'INFORMA');
      setHeaderTitle(f.field_1 || 'TI INFORMA');
      setDateDisplay(data.dateDisplay || '26 Mai 2026');
      setCommTitle(f.field_2 || 'COMUNICADO TI');
      setCommSub(f.field_3 || 'INFORMAÇÃO E PREVENÇÃO');
      setBodyText(f.field_4 || '');
      setMainIcon(data.mainIcon || '🔧');
      setAlertIcon(data.alertIcon || '⚠️');

      const n = legacyCards.length;
      const mappedCards = legacyCards.map((c, i) => ({
        id: `card-${i + 1}`,
        color: c.color || 'blue',
        icon: c.icon || '🖥️',
        iconBg: c.iconBg || '',
        label: f[`field_${5 + 2 * i}`] || c.label || '',
        content: f[`field_${6 + 2 * i}`] || c.content || ''
      }));
      setCards(mappedCards);
      cardCounterRef.current = Math.max(n, 3);

      setAlertTitle(f[`field_${5 + 2 * n}`] || 'ATENÇÃO!');
      setAlertText(f[`field_${6 + 2 * n}`] || '');
      setFooterText(f[`field_${7 + 2 * n}`] || 'Uso interno · Não encaminhe externamente');
    } else {
      // Formato novo em React
      if (data.logoSrc) setLogoSrc(data.logoSrc);
      if (data.fontFamily) setFontFamily(data.fontFamily);
      if (data.sizes) setSizes(data.sizes);
      
      if (data.headerEye !== undefined) setHeaderEye(data.headerEye);
      if (data.headerTitle !== undefined) setHeaderTitle(data.headerTitle);
      if (data.dateDisplay !== undefined) setDateDisplay(data.dateDisplay);
      if (data.commTitle !== undefined) setCommTitle(data.commTitle);
      if (data.commSub !== undefined) setCommSub(data.commSub);
      if (data.bodyText !== undefined) setBodyText(data.bodyText);
      if (data.mainIcon !== undefined) setMainIcon(data.mainIcon);
      if (data.alertIcon !== undefined) setAlertIcon(data.alertIcon);
      if (data.alertTitle !== undefined) setAlertTitle(data.alertTitle);
      if (data.alertText !== undefined) setAlertText(data.alertText);
      if (data.footerText !== undefined) setFooterText(data.footerText);
      if (data.cards) {
        setCards(data.cards);
        // Ajusta a referência do contador
        const maxIdNum = data.cards.reduce((max, c) => {
          const num = parseInt(c.id.replace('card-', ''));
          return isNaN(num) ? max : Math.max(max, num);
        }, 3);
        cardCounterRef.current = maxIdNum;
      }
    }
  };

  // Alterar logo (Input file)
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoSrc(ev.target.result);
      showToast('🖼️ Logo atualizada');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Exportar arquivo .tinf
  const handleExportFile = () => {
    try {
      const data = {
        logoSrc,
        fontFamily,
        sizes,
        headerEye,
        headerTitle,
        dateDisplay,
        commTitle,
        commSub,
        bodyText,
        mainIcon,
        alertIcon,
        alertTitle,
        alertText,
        footerText,
        cards,
        exportVersion: '1.0',
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.download = `ti_informa_${date}.tinf`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('✅ Arquivo .tinf exportado!');
    } catch (e) {
      console.error(e);
      showToast('❌ Erro ao exportar arquivo');
    }
  };

  // Importar arquivo .tinf
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (confirm('Isso vai substituir o comunicado atual. Continuar?')) {
          loadData(data);
          showToast('✅ Arquivo importado com sucesso!');
        }
      } catch (err) {
        console.error(err);
        showToast('❌ Erro ao ler o arquivo .tinf');
      }
    };
    reader.readAsText(file);
  };

  // Exportar para PNG (html2canvas)
  const handleExportPNG = async () => {
    const folder = document.getElementById('folder');
    if (!folder) return;

    setIsExportingPNG(true);
    folder.classList.add('is-exporting');

    try {
      await document.fonts.ready;
      const canvas = await html2canvas(folder, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#F0F4F7',
        logging: false
      });

      const link = document.createElement('a');
      link.download = 'ti_informa_comunicado.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('✅ Imagem PNG gerada e baixada!');
    } catch (err) {
      console.error(err);
      showToast('❌ Erro ao gerar PNG');
    } finally {
      folder.classList.remove('is-exporting');
      setIsExportingPNG(false);
    }
  };

  // Limpar dados de cache
  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setLogoSrc(DEFAULT_LOGO);
    setFontFamily('Barlow');
    setSizes({ body: '14px', title: '22px', header: '28px', label: '10px' });
    setHeaderEye(INITIAL_FIELDS.headerEye);
    setHeaderTitle(INITIAL_FIELDS.headerTitle);
    setDateDisplay(INITIAL_FIELDS.dateDisplay);
    setCommTitle(INITIAL_FIELDS.commTitle);
    setCommSub(INITIAL_FIELDS.commSub);
    setBodyText(INITIAL_FIELDS.bodyText);
    setMainIcon('🔧');
    setAlertIcon('⚠️');
    setAlertTitle(INITIAL_FIELDS.alertTitle);
    setAlertText(INITIAL_FIELDS.alertText);
    setFooterText(INITIAL_FIELDS.footerText);
    setCards(INITIAL_CARDS);
    cardCounterRef.current = 3;
    showToast('🗑️ Cache local apagado');
  };

  // Manipulação de Cartões (InfoCard)
  const handleAddCard = (color) => {
    cardCounterRef.current += 1;
    const newCard = {
      id: `card-${cardCounterRef.current}`,
      color,
      icon: '🖥️',
      iconBg: '',
      label: 'NOVO CARTÃO',
      content: 'Item informativo · clique para editar'
    };
    setCards([...cards, newCard]);
    showToast('➕ Cartão adicionado!');
  };

  const handleRemoveCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
    showToast('🗑️ Cartão removido');
  };

  const handleMoveCard = (id, direction) => {
    const idx = cards.findIndex(c => c.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= cards.length) return;

    const newCards = [...cards];
    const temp = newCards[idx];
    newCards[idx] = newCards[newIdx];
    newCards[newIdx] = temp;
    setCards(newCards);
  };

  const handleUpdateCard = (id, updatedFields) => {
    setCards(cards.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  // Atualizar campo de conteúdo
  const handleUpdateField = (key, value) => {
    switch (key) {
      case 'headerEye': setHeaderEye(value); break;
      case 'headerTitle': setHeaderTitle(value); break;
      case 'commTitle': setCommTitle(value); break;
      case 'commSub': setCommSub(value); break;
      case 'bodyText': setBodyText(value); break;
      case 'footerText': setFooterText(value); break;
      default: break;
    }
  };

  // Modal de Ícones
  const openIconPicker = (target) => {
    setIconPickerTarget(target);
    setIsIconPickerOpen(true);
  };

  const handleSelectIcon = (emoji) => {
    if (iconPickerTarget === 'main') {
      setMainIcon(emoji);
    } else if (iconPickerTarget === 'alert') {
      setAlertIcon(emoji);
    } else {
      // É um cartão
      handleUpdateCard(iconPickerTarget, { icon: emoji });
    }
    setIconPickerTarget(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
      {/* Barra de Ferramentas */}
      <Toolbar
        logoSrc={logoSrc}
        onChangeLogo={handleLogoChange}
        fontFamily={fontFamily}
        onChangeFont={setFontFamily}
        sizes={sizes}
        onChangeSize={(type, val) => setSizes({ ...sizes, [type]: val })}
        onExportFile={handleExportFile}
        onImportFile={handleImportFile}
        onExportPNG={handleExportPNG}
        isExportingPNG={isExportingPNG}
        onClearCache={handleClearCache}
        showToast={showToast}
      />

      {/* Folder Visual */}
      <div
        className="folder"
        id="folder"
        style={{ fontFamily: `'${fontFamily}', sans-serif` }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      >
        {/* Cabeçalho Gradiente */}
        <div className="header">
          <div className="logo-wrap" onClick={() => handleLogoChange({ target: { files: [] } })}>
            <img id="headerLogo" src={logoSrc} alt="Logo" />
            <div className="logo-ov">✏️</div>
          </div>
          <div className="chevrons">
            <div className="chev"><i></i><i></i><i></i></div>
            <div className="chev"><i></i><i></i><i></i></div>
          </div>
          <div className="hdr-text">
            <div
              className="hdr-eye"
              contentEditable="true"
              suppressContentEditableWarning={true}
              onBlur={(e) => setHeaderEye(e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: headerEye }}
            />
            <div
              className="hdr-title"
              contentEditable="true"
              suppressContentEditableWarning={true}
              onBlur={(e) => setHeaderTitle(e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: headerTitle }}
              style={{ fontFamily: `'${fontFamily}', sans-serif` }}
            />
          </div>
          <div className="hdr-badge" onClick={() => setIsCalendarOpen(true)}>
            <span className="date-val" id="dateDisplay">{dateDisplay}</span>
          </div>
        </div>

        {/* Faixa Colorida */}
        <div className="stripe"></div>

        {/* Corpo do Comunicado */}
        <div className="body">
          <div className="comm-hdr">
            <div
              className="comm-icon"
              id="icon-main"
              onClick={() => openIconPicker('main')}
              title="Trocar ícone"
            >
              {mainIcon}
            </div>
            <div className="comm-title-block">
              <div
                className="comm-title"
                contentEditable="true"
                suppressContentEditableWarning={true}
                onBlur={(e) => setCommTitle(e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: commTitle }}
                style={{ fontFamily: `'${fontFamily}', sans-serif` }}
              />
              <div
                className="comm-sub"
                contentEditable="true"
                suppressContentEditableWarning={true}
                onBlur={(e) => setCommSub(e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: commSub }}
              />
            </div>
          </div>

          <hr className="div" />

          {/* Texto Principal */}
          <div
            className="body-text"
            contentEditable="true"
            suppressContentEditableWarning={true}
            onBlur={(e) => setBodyText(e.target.innerHTML)}
            dangerouslySetInnerHTML={{ __html: bodyText }}
          />

          {/* Contêiner de Cartões */}
          <div className="cards" id="cardsContainer">
            {cards.map((c) => (
              <InfoCard
                key={c.id}
                card={c}
                onIconClick={openIconPicker}
                onUpdate={handleUpdateCard}
                onMove={handleMoveCard}
                onRemove={handleRemoveCard}
              />
            ))}
          </div>

          {/* Linha de botões de adicionar cartões */}
          <div className="add-card-row" id="addCardRow">
            <button className="add-card-btn blue" onClick={() => handleAddCard('blue')}>➕ Azul</button>
            <button className="add-card-btn green" onClick={() => handleAddCard('green')}>➕ Verde</button>
            <button className="add-card-btn lime" onClick={() => handleAddCard('lime')}>➕ Lima</button>
            <button className="add-card-btn orange" onClick={() => handleAddCard('orange')}>➕ Laranja</button>
            <button className="add-card-btn red" onClick={() => handleAddCard('red')}>➕ Vermelho</button>
            <button className="add-card-btn purple" onClick={() => handleAddCard('purple')}>➕ Roxo</button>
          </div>

          {/* Cartão de Alerta */}
          <AlertCard
            alertIcon={alertIcon}
            alertTitle={alertTitle}
            alertText={alertText}
            onIconClick={() => openIconPicker('alert')}
            onUpdate={(fields) => {
              if (fields.alertTitle !== undefined) setAlertTitle(fields.alertTitle);
              if (fields.alertText !== undefined) setAlertText(fields.alertText);
            }}
          />
        </div>

        {/* Rodapé */}
        <div className="footer">
          <div className="footer-brand">
            <span>TI INFORMA</span>
            <div className="footer-dot"></div>
            <span>COMUNICAÇÃO INTERNA</span>
          </div>
          <span
            contentEditable="true"
            suppressContentEditableWarning={true}
            onBlur={(e) => setFooterText(e.target.innerHTML)}
            dangerouslySetInnerHTML={{ __html: footerText }}
          />
        </div>

        {/* Barra inferior */}
        <div className="bottom-bar"></div>
      </div>

      {/* Modais */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onConfirm={setDateDisplay}
        initialDate={dateDisplay}
      />

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelectIcon={handleSelectIcon}
      />
    </div>
  );
}
