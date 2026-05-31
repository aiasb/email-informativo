import React, { useState } from 'react';

const ICONS = {
  "TI & Tecnologia": [
    ["💻", "Notebook"], ["🖥️", "Monitor"], ["🖨️", "Impressora"], ["⌨️", "Teclado"], ["鼠标", "Mouse"],
    ["📱", "Smartphone"], ["📡", "Antena"], ["🔌", "Tomada"], ["🔋", "Bateria"], ["💾", "Disquete"],
    ["💿", "CD"], ["📀", "DVD"], ["📶", "Sinal"], ["🔐", "Segurança"], ["🔒", "Cadeado"],
    ["🔑", "Chave"], ["🛡️", "Escudo"], ["⚙️", "Engrenagem"], ["🔧", "Chave inglesa"], ["🔩", "Parafuso"],
    ["🛠️", "Ferramentas"], ["🔬", "Microscópio"], ["📊", "Gráfico"], ["📈", "Alta"], ["📉", "Baixa"],
    ["🗄️", "Servidor"], ["🗃️", "Arquivo"], ["📂", "Pasta"], ["💡", "Ideia"], ["🕹️", "Controle"],
    ["🤖", "Robô"], ["🧠", "IA"], ["🌐", "Web"], ["☁️", "Nuvem"]
  ],
  "Comunicação": [
    ["📧", "E-mail"], ["📨", "Mensagem"], ["📩", "Envelope"], ["📬", "Correio"], ["📮", "Postal"],
    ["📞", "Telefone"], ["☎️", "Fixo"], ["📟", "Pager"], ["📠", "Fax"], ["📢", "Alto-falante"],
    ["📣", "Megafone"], ["🔔", "Sino"], ["🔕", "Mudo"], ["💬", "Chat"], ["🗨️", "Comentário"],
    ["💭", "Pensando"], ["📝", "Nota"], ["✉️", "Carta"], ["📤", "Enviar"], ["📥", "Receber"],
    ["📜", "Pergaminho"], ["📋", "Prancheta"], ["🗒️", "Bloco"], ["📰", "Jornal"]
  ],
  "Alertas & Status": [
    ["⚠️", "Atenção"], ["🚨", "Alarme"], ["🚦", "Semáforo"], ["🛑", "Pare"], ["⛔", "Proibido"],
    ["❌", "Erro"], ["✅", "Sucesso"], ["✔️", "Check"], ["❗", "Exclamação"], ["❓", "Dúvida"],
    ["ℹ️", "Info"], ["🔴", "Vermelho"], ["🟡", "Amarelo"], ["🟢", "Verde"], ["🔵", "Azul"],
    ["🟠", "Laranja"], ["⭕", "Círculo"], ["🔺", "Cima"], ["🔻", "Baixo"], ["⚡", "Urgente"],
    ["🔥", "Crítico"], ["❄️", "Pausado"], ["💤", "Espera"], ["✨", "Destaque"]
  ],
  "Tempo": [
    ["📅", "Calendário"], ["🗓️", "Agenda"], ["🕐", "1h"], ["🕑", "2h"], ["🕒", "3h"],
    ["🕓", "4h"], ["🕔", "5h"], ["🕕", "6h"], ["🕖", "7h"], ["🕗", "8h"], ["🕘", "9h"],
    ["🕙", "10h"], ["🕚", "11h"], ["🕛", "12h"], ["⏰", "Alarme"], ["⏱️", "Cronômetro"],
    ["⏲️", "Timer"], ["⌚", "Relógio"], ["⏳", "Ampulheta"], ["⌛", "Cheia"], ["🌅", "Manhã"],
    ["🌆", "Tarde"], ["💖", "Noite"], ["🔄", "Recorrente"]
  ],
  "Pessoas": [
    ["👤", "Pessoa"], ["👥", "Equipe"], ["🧑‍💻", "Dev"], ["👩‍💼", "Gestora"], ["👨‍💼", "Gestor"],
    ["🧑‍🔧", "Técnico"], ["👷", "Operador"], ["🤝", "Parceria"], ["🏢", "Empresa"], ["🏬", "Escritório"],
    ["📌", "Marcador"], ["📍", "Local"], ["🚀", "Lançamento"], ["🎯", "Meta"], ["🏆", "Conquista"],
    ["⭐", "Estrela"], ["💼", "Maleta"], ["🗂️", "Org."], ["📦", "Pacote"], ["🔖", "Favorito"],
    ["🧩", "Integração"], ["🎖️", "Medalha"], ["🏅", "Prêmio"], ["🎗️", "Fita"]
  ],
  "Manutenção": [
    ["🔧", "Chave"], ["🔨", "Martelo"], ["⚒️", "Ferramentas"], ["🛠️", "Manutenção"], ["⛏️", "Picareta"],
    ["🪛", "Chave fenda"], ["🪚", "Serra"], ["🔩", "Parafuso"], ["🧰", "Caixa ferramentas"], ["🪜", "Escada"],
    ["🧹", "Vassoura"], ["🚧", "Obras"], ["🏗️", "Construção"], ["⚙️", "Config."], ["🔁", "Reiniciar"],
    ["♻️", "Reciclar"], ["🗑️", "Lixeira"], ["💿", "Backup"], ["🔌", "Cabo"], ["🪣", "Balde"],
    ["🧽", "Esponja"], ["🔦", "Lanterna"], ["🕯️", "Vela"], ["🪤", "Armadilha"]
  ]
};

// Achata todos os ícones para pesquisa global rápida
const allIcons = [];
Object.entries(ICONS).forEach(([cat, arr]) => {
  arr.forEach(([em, name]) => {
    allIcons.push({ em, name, cat });
  });
});

export default function IconPickerModal({ isOpen, onClose, onSelectIcon }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');

  if (!isOpen) return null;

  const categories = ['Todos', ...Object.keys(ICONS)];

  const handleTabChange = (cat) => {
    setActiveTab(cat);
    setSearchQuery('');
  };

  // Filtragem de ícones
  let filtered = allIcons;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = allIcons.filter(ic => ic.name.toLowerCase().includes(q) || ic.em.includes(q));
  } else if (activeTab !== 'Todos') {
    filtered = allIcons.filter(ic => ic.cat === activeTab);
  }

  return (
    <div className="ipo open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ipm">
        <div className="ipm-hdr">
          <h3>Escolher Ícone</h3>
          <button className="ipm-x" onClick={onClose}>✕</button>
        </div>
        <div className="ipm-srch">
          <input
            type="text"
            placeholder="🔍 Buscar ícone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ipm-tabs">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`ipm-tab ${activeTab === cat && !searchQuery ? 'active' : ''}`}
              onClick={() => handleTabChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="ipm-grid">
          {filtered.map((ic, idx) => (
            <div
              key={idx}
              className="ipi"
              title={ic.name}
              onClick={() => {
                onSelectIcon(ic.em);
                onClose();
              }}
            >
              {ic.em}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
