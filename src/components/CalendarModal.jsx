import React, { useState, useEffect } from 'react';

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const MESES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];
const DIAS_PT = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export default function CalendarModal({ isOpen, onClose, onConfirm, initialDate }) {
  const [calCurrent, setCalCurrent] = useState(new Date(2026, 4, 26)); // Maio 2026 padrão original
  const [calSelected, setCalSelected] = useState(new Date(2026, 4, 26));

  useEffect(() => {
    if (initialDate) {
      // Tenta fazer o parse de datas no formato "DD Mês YYYY" ou Date object
      if (initialDate instanceof Date) {
        setCalSelected(initialDate);
        setCalCurrent(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
      } else {
        // Formato string do app: "26 Mai 2026"
        const parts = initialDate.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const mesShort = parts[1];
          const year = parseInt(parts[2]);
          const mesIdx = MESES_SHORT.findIndex(m => m.toLowerCase() === mesShort.toLowerCase());
          if (day && mesIdx !== -1 && year) {
            const parsedDate = new Date(year, mesIdx, day);
            setCalSelected(parsedDate);
            setCalCurrent(new Date(year, mesIdx, 1));
          }
        }
      }
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

  const year = calCurrent.getFullYear();
  const month = calCurrent.getMonth();
  const today = new Date();

  // Grid de dias
  const firstDay = new Date(year, month, 1).getDay(); // 0=dom, 1=seg...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const handleDaySelect = (day, y, m) => {
    setCalSelected(new Date(y, m, day));
  };

  const handleNavMonth = (dir) => {
    setCalCurrent(new Date(year, month + dir, 1));
  };

  const handleSelectToday = () => {
    const t = new Date();
    setCalSelected(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
    setCalCurrent(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const handleConfirm = () => {
    const d = calSelected;
    const day = String(d.getDate()).padStart(2, '0');
    const mes = MESES_SHORT[d.getMonth()];
    const ano = d.getFullYear();
    const formatted = `${day} ${mes} ${ano}`;
    onConfirm(formatted);
    onClose();
  };

  // Renderizar dias
  const daysList = [];

  // Mês anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const prevMonthIdx = month - 1;
    const prevYear = prevMonthIdx < 0 ? year - 1 : year;
    const pmIdx = prevMonthIdx < 0 ? 11 : prevMonthIdx;
    daysList.push({
      day: d,
      year: prevYear,
      month: pmIdx,
      extra: 'other-month'
    });
  }

  // Mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    daysList.push({
      day: d,
      year: year,
      month: month,
      extra: ''
    });
  }

  // Mês seguinte
  const totalDays = daysList.length;
  const remaining = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = month + 1;
    const nextYear = nextMonthIdx > 11 ? year + 1 : year;
    const nmIdx = nextMonthIdx > 11 ? 0 : nextMonthIdx;
    daysList.push({
      day: d,
      year: nextYear,
      month: nmIdx,
      extra: 'other-month'
    });
  }

  // Textos exibidos no header do calendário
  const selDay = calSelected.getDate();
  const selMes = MESES_PT[calSelected.getMonth()];
  const selAno = calSelected.getFullYear();
  const selDiaSem = DIAS_PT[calSelected.getDay()];

  return (
    <div className="cal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cal-popup">
        <div className="cal-header">
          <div className="cal-header-top">
            <h3>Selecionar Data</h3>
            <button className="cal-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="cal-selected-display">{selDay} de {selMes}</div>
          <div className="cal-selected-sub">{selAno} · {selDiaSem}</div>
        </div>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => handleNavMonth(-1)}>‹</button>
          <span className="cal-month-label">{MESES_PT[month]} {year}</span>
          <button className="cal-nav-btn" onClick={() => handleNavMonth(1)}>›</button>
        </div>
        <div className="cal-grid">
          <div className="cal-weekdays">
            <div className="cal-wd">Dom</div>
            <div className="cal-wd">Seg</div>
            <div className="cal-wd">Ter</div>
            <div className="cal-wd">Qua</div>
            <div className="cal-wd">Qui</div>
            <div className="cal-wd">Sex</div>
            <div className="cal-wd">Sáb</div>
          </div>
          <div className="cal-days">
            {daysList.map((item, idx) => {
              const isToday =
                today.getDate() === item.day &&
                today.getMonth() === item.month &&
                today.getFullYear() === item.year;
              const isSelected =
                calSelected.getDate() === item.day &&
                calSelected.getMonth() === item.month &&
                calSelected.getFullYear() === item.year;

              let classes = `cal-day ${item.extra}`;
              if (isToday) classes += ' today';
              if (isSelected) classes += ' selected';

              return (
                <div
                  key={idx}
                  className={classes}
                  onClick={() => handleDaySelect(item.day, item.year, item.month)}
                >
                  {item.day}
                </div>
              );
            })}
          </div>
        </div>
        <div className="cal-footer">
          <button className="cal-today-btn" onClick={handleSelectToday}>Hoje</button>
          <button className="cal-confirm-btn" onClick={handleConfirm}>✓ Confirmar</button>
        </div>
      </div>
    </div>
  );
}
