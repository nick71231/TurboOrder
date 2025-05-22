import React, { useState } from 'react';
import '../styles/FilterComponent.css';
import { FaBars } from "react-icons/fa";

const FilterComponent = ({ filterState, setFilter, filterItens, orders }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const allTypes = ['Tudo', ...filterItens.map((type) => type.value)];

  // Função para contar pedidos por status
  const getCount = (type) => {
    if (type === 'Tudo') return orders.length;
    return orders.filter(order => order.status === type).length;
  };

  return (
    <div className="filter-section">
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars size={24} />
      </button>

      <div className={`filter-buttons ${menuOpen ? "open" : ""}`}>
        <span className="filter-label">Filtro</span>
        {allTypes.map((type, index) => (
          <button
            key={index}
            className={`filter-btn ${filterState === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
          >
            {type}
            <span className="filter-badge">{getCount(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterComponent;
