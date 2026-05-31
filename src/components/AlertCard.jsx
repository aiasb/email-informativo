import React from 'react';

export default function AlertCard({ alertIcon, alertTitle, alertText, onIconClick, onUpdate }) {
  return (
    <div className="alert">
      <div
        className="alert-icon"
        onClick={onIconClick}
        title="Trocar ícone"
      >
        {alertIcon}
      </div>
      <div className="alert-body">
        <div
          className="alert-title"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => onUpdate({ alertTitle: e.target.innerHTML })}
          dangerouslySetInnerHTML={{ __html: alertTitle }}
        />
        <div
          className="alert-text"
          contentEditable="true"
          suppressContentEditableWarning={true}
          onBlur={(e) => onUpdate({ alertText: e.target.innerHTML })}
          dangerouslySetInnerHTML={{ __html: alertText }}
        />
      </div>
    </div>
  );
}
