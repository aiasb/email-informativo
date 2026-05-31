import { useState, useEffect, useRef } from 'react';

import Toolbar, { saveSelection } from './components/Toolbar';
import CalendarModal from './components/CalendarModal';
import ConfirmModal from './components/ConfirmModal';
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
  footerBrandTitle: 'TI INFORMA',
  footerBrandSub: 'COMUNICAÇÃO INTERNA',
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
  const [footerBrandTitle, setFooterBrandTitle] = useState(INITIAL_FIELDS.footerBrandTitle);
  const [footerBrandSub, setFooterBrandSub] = useState(INITIAL_FIELDS.footerBrandSub);
  const [footerText, setFooterText] = useState(INITIAL_FIELDS.footerText);

  // Estado dos cartões
  const [cards, setCards] = useState(INITIAL_CARDS);

  // Estados de controle de modais
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState(null); // 'main', 'alert' ou cardId

  // Estado de status da exportação HTML
  const [isExportingHTML, setIsExportingHTML] = useState(false);

  // Estado do modal de confirmação
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  const openConfirm = (message, onConfirm) => setConfirmModal({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ open: false, message: '', onConfirm: null });

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
    commTitle, commSub, bodyText, mainIcon, alertIcon, alertTitle, alertText,
    footerBrandTitle, footerBrandSub, footerText, cards
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
        footerBrandTitle,
        footerBrandSub,
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
      if (data.footerBrandTitle !== undefined) setFooterBrandTitle(data.footerBrandTitle);
      if (data.footerBrandSub !== undefined) setFooterBrandSub(data.footerBrandSub);
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
        footerBrandTitle,
        footerBrandSub,
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
        openConfirm('Isso vai substituir o comunicado atual. Continuar?', () => {
          loadData(data);
          showToast('✅ Arquivo importado com sucesso!');
        });
      } catch (err) {
        console.error(err);
        showToast('❌ Erro ao ler o arquivo .tinf');
      }
    };
    reader.readAsText(file);
  };

  // Mapa de cores para os cartões (card color → tons de fundo e borda)
  const CARD_COLOR_MAP = {
    blue:   { bg: '#EBF3FC', border: '#90CAF9', label: '#1565A6' },
    green:  { bg: '#E6F6EF', border: '#A5D6A7', label: '#1E9A6E' },
    lime:   { bg: '#E8F9EE', border: '#B9F6CA', label: '#2E7D32' },
    orange: { bg: '#FEF3E8', border: '#FFCC80', label: '#E65100' },
    red:    { bg: '#FDECEA', border: '#EF9A9A', label: '#C62828' },
    purple: { bg: '#F3EAF9', border: '#CE93D8', label: '#6A1B9A' },
  };

  // Gera o HTML do email compatível com clientes de email (tabelas + inline styles)
  const generateEmailHTML = () => {
    const fontStack = `'${fontFamily}', Arial, Helvetica, sans-serif`;
    const bodySize = sizes.body;
    const titleSize = sizes.title;
    const headerSize = sizes.header;
    const labelSize = sizes.label;

    // Cards HTML
    const cardsHTML = cards.map((c) => {
      const palette = CARD_COLOR_MAP[c.color] || CARD_COLOR_MAP.blue;
      const iconBgColor = c.iconBg || palette.bg;
      return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;border-radius:10px;overflow:hidden;border:1.5px solid ${palette.border};background:${palette.bg};">
        <tr>
          <td width="54" valign="middle" style="padding:14px 12px;text-align:center;">
            <div style="width:44px;height:44px;background:${iconBgColor};border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:44px;text-align:center;">${c.icon}</div>
          </td>
          <td valign="middle" style="padding:14px 16px 14px 4px;">
            <div style="font-size:${labelSize};font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${palette.label};margin-bottom:4px;font-family:${fontStack};">${c.label}</div>
            <div style="font-size:${bodySize};color:#1A2E3B;font-family:${fontStack};line-height:1.5;">${c.content}</div>
          </td>
        </tr>
      </table>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${headerTitle.replace(/<[^>]*>/g, '')} — Comunicado TI</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#C5CDD4;font-family:${fontStack};">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#C5CDD4" style="background:#C5CDD4;">
  <tr><td align="center" bgcolor="#C5CDD4" style="padding:32px 16px;">

    <!-- Container -->
    <table width="780" cellpadding="0" cellspacing="0" border="0" style="max-width:780px;width:100%;border-radius:18px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.18);">

      <!-- HEADER -->
      <tr>
        <td bgcolor="#1565A6" style="padding:0;height:88px;background:linear-gradient(100deg,#1565A6 0%,#1A7FAA 35%,#1E9A6E 68%,#2BBD5A 100%);">
          <!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;height:88px;"><v:fill type="gradient" color="#1565A6" color2="#2BBD5A" angle="349"/><v:textbox inset="28px,0px,28px,0px" style="mso-fit-shape-to-text:true"><![endif]-->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 28px;">
            <tr>
              <td width="70" valign="middle" style="padding:11px 0;">
                <img src="${logoSrc}" width="66" height="66" alt="Logo" style="display:block;border-radius:12px;object-fit:contain;" />
              </td>
              <td width="28" valign="middle" style="padding:0 4px;opacity:.65;">
                <div style="font-size:0;line-height:0;">&#8250;&#8250;&#8250;</div>
              </td>
              <td valign="middle" style="padding:11px 0;">
                <div style="font-size:${labelSize};font-weight:700;letter-spacing:4px;color:#CCE0F5;text-transform:uppercase;font-family:${fontStack};">${headerEye}</div>
                <div style="font-size:${headerSize};font-weight:800;letter-spacing:1.5px;color:#ffffff;text-transform:uppercase;line-height:1;font-family:${fontStack};">${headerTitle}</div>
              </td>
              <td width="120" valign="middle" align="right" style="padding:11px 0;">
                <div style="background:#2a5fa8;border:1px solid #4d8fd4;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:.5px;text-align:center;font-family:${fontStack};">${dateDisplay}</div>
              </td>
            </tr>
          </table>
          <!--[if gte mso 9]></v:textbox></v:rect><![endif]-->
        </td>
      </tr>

      <!-- STRIPE -->
      <tr>
        <td height="4" bgcolor="#1565A6" style="background:linear-gradient(90deg,#1565A6,#2BBD5A);font-size:0;line-height:0;">&nbsp;</td>
      </tr>

      <!-- BODY -->
      <tr>
        <td bgcolor="#F0F4F7" style="background-color:#F0F4F7;padding:26px 36px 0 36px;">

          <!-- Comm Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
            <tr>
              <td width="54" valign="top" style="padding-right:16px;">
                <div style="width:48px;height:48px;background:linear-gradient(135deg,#1565A6,#1E9A6E);border-radius:12px;display:inline-block;text-align:center;line-height:48px;font-size:24px;">${mainIcon}</div>
              </td>
              <td valign="middle">
                <div style="font-size:${titleSize};font-weight:800;letter-spacing:1px;color:#1A2E3B;text-transform:uppercase;font-family:${fontStack};">${commTitle}</div>
                <div style="font-size:13px;color:#4A6070;font-weight:600;letter-spacing:.5px;font-family:${fontStack};">${commSub}</div>
              </td>
            </tr>
          </table>

          <!-- Divider -->
          <div style="height:1px;background:linear-gradient(90deg,#1565A6,#2BBD5A,transparent);margin-bottom:18px;"></div>

          <!-- Body Text -->
          <div style="font-size:${bodySize};color:#1A2E3B;line-height:1.75;margin-bottom:22px;font-family:${fontStack};">${bodyText}</div>

          <!-- Cards -->
          ${cardsHTML}

          <!-- Alert -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFF8E1" style="margin-top:18px;margin-bottom:0;background-color:#FFF8E1;border-radius:12px;border-left:4px solid #F59E0B;">
            <tr>
              <td width="54" valign="middle" style="padding:16px 12px;text-align:center;">
                <div style="font-size:26px;line-height:1;">${alertIcon}</div>
              </td>
              <td valign="middle" style="padding:16px 16px 16px 0;">
                <div style="font-size:13px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#92400E;margin-bottom:4px;font-family:${fontStack};">${alertTitle}</div>
                <div style="font-size:${bodySize};color:#78350F;line-height:1.55;font-family:${fontStack};">${alertText}</div>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td bgcolor="#1A2E3B" style="background-color:#1A2E3B;padding:16px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <span style="font-size:12px;font-weight:800;color:#fff;letter-spacing:2px;font-family:${fontStack};">${footerBrandTitle}</span>
                <span style="display:inline-block;width:5px;height:5px;background:#2BBD5A;border-radius:50%;vertical-align:middle;margin:0 8px;"></span>
                <span style="font-size:11px;color:rgba(255,255,255,.6);letter-spacing:1px;font-family:${fontStack};">${footerBrandSub}</span>
              </td>
              <td valign="middle" align="right">
                <span style="font-size:11px;color:rgba(255,255,255,.5);font-family:${fontStack};">${footerText}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BOTTOM BAR -->
      <tr>
        <td height="6" bgcolor="#2BBD5A" style="background:linear-gradient(90deg,#1565A6,#2BBD5A);font-size:0;line-height:0;">&nbsp;</td>
      </tr>

    </table>
  </td></tr>
</table>

</body>
</html>`;

    return html;
  };

  // Gera arquivo .eml com o HTML como corpo — ao abrir, o Outlook cria o rascunho formatado
  const handleExportHTML = () => {
    setIsExportingHTML(true);
    try {
      const html = generateEmailHTML();
      const date = new Date().toISOString().slice(0, 10);
      const subject = headerTitle.replace(/<[^>]*>/g, '') + ' — Comunicado TI';

      // UTF-8 → base64 (compatível com caracteres especiais)
      const bytes = new TextEncoder().encode(html);
      let binary = '';
      bytes.forEach(b => { binary += String.fromCharCode(b); });
      const htmlBase64 = btoa(binary);
      // Quebra em linhas de 76 chars (padrão MIME)
      const htmlB64Chunked = htmlBase64.match(/.{1,76}/g).join('\r\n');

      const boundary = `----=_Alt_${Date.now()}`;

      const eml = [
        'MIME-Version: 1.0',
        `Date: ${new Date().toUTCString()}`,
        `Subject: ${subject}`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        subject,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        htmlB64Chunked,
        '',
        `--${boundary}--`,
      ].join('\r\n');

      const blob = new Blob([eml], { type: 'message/rfc822' });
      const link = document.createElement('a');
      link.download = `ti_informa_${date}.eml`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('✅ Arquivo .eml gerado — abra para compor no Outlook');
    } catch (err) {
      console.error(err);
      showToast('❌ Erro ao gerar arquivo .eml');
    } finally {
      setIsExportingHTML(false);
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
    setFooterBrandTitle(INITIAL_FIELDS.footerBrandTitle);
    setFooterBrandSub(INITIAL_FIELDS.footerBrandSub);
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
        onChangeLogo={handleLogoChange}
        fontFamily={fontFamily}
        onChangeFont={setFontFamily}
        sizes={sizes}
        onChangeSize={(type, val) => setSizes({ ...sizes, [type]: val })}
        onExportFile={handleExportFile}
        onImportFile={handleImportFile}
        onExportHTML={handleExportHTML}
        isExportingHTML={isExportingHTML}
        onClearCache={() =>
          openConfirm('Apagar todos os dados salvos no navegador?', handleClearCache)
        }
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
            <span
              contentEditable="true"
              suppressContentEditableWarning={true}
              onBlur={(e) => setFooterBrandTitle(e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: footerBrandTitle }}
              style={{ padding: '2px 4px', borderRadius: '4px' }}
            />
            <div className="footer-dot"></div>
            <span
              contentEditable="true"
              suppressContentEditableWarning={true}
              onBlur={(e) => setFooterBrandSub(e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: footerBrandSub }}
              style={{ padding: '2px 4px', borderRadius: '4px' }}
            />
          </div>
          <div
            contentEditable="true"
            suppressContentEditableWarning={true}
            onBlur={(e) => setFooterText(e.target.innerHTML)}
            dangerouslySetInnerHTML={{ __html: footerText }}
            style={{ padding: '2px 4px', borderRadius: '4px', minWidth: '80px' }}
          ></div>
        </div>

        {/* Barra inferior */}
        <div className="bottom-bar"></div>
      </div>

      {/* Modais */}
      <ConfirmModal
        isOpen={confirmModal.open}
        message={confirmModal.message}
        onConfirm={() => { confirmModal.onConfirm?.(); closeConfirm(); }}
        onCancel={closeConfirm}
      />

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
