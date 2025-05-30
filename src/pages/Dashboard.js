import React, { useState, useEffect } from 'react';
import OrderCard from './../components/OrderCard';
import './../styles/Dashboard.css';
import styled from 'styled-components';
import { FaDollarSign, FaMoneyBillTransfer } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FilterComponent from '../components/FilterComponent.js';
import axios from 'axios';

const DolarGreen = styled(FaDollarSign)`
  font-size: 1.59rem;
  background-color: #098A52;
  color: #ffffff;
  border-radius: 50%;
  padding: 10px;
`;

const DolarRed = styled(FaDollarSign)`
  font-size: 1.59rem;
  background-color: #B50A2B;
  color: #ffffff;
  border-radius: 50%;
  padding: 10px;
`;

const Statistic = styled.p`
  color: #000000;
  font-size: 1rem;
  font-weight: bold;
  padding: 0px;
  margin: 0px;
`;

const AmountGreen = styled.p`
  color: #098A52;
  font-size: 1rem;
  font-weight: bold;
  padding: 0px;
  margin: 0px;
`;

const AmountRed = styled.p`
  color: #B50A2B;
  font-size: 1rem;
  font-weight: bold;
  padding: 0px;
  margin: 0px;
`;

const TransferGreen = styled(FaMoneyBillTransfer)`
  font-size: 2.19rem;
  color: #1DAD6F;
`;

const TransferRed = styled(FaMoneyBillTransfer)`
  font-size: 2.19rem;
  color: #FD1F4A;
`;

const productTypes = [
  { value: "Em Andamento", label: "Em Andamento" },
  { value: "Concluído", label: "Concluído" },
  { value: "Cancelado", label: "Cancelado" },
];

const Dashboard = () => {
  const [filter, setFilter] = useState('Tudo');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);

  const fetchRevenueData = async () => {
    try {
      const response = await axios.get("http://localhost:8800/pedidos/soma-mensal");
      const { totalUltimos30Dias, mediaUltimos30Dias, totalMesAtual, mediaMesAtual } = response.data;
      setMonthlyRevenue(totalMesAtual);
      setMonthlyAverage(mediaMesAtual);
    } catch (error) {
      console.error("Erro ao buscar dados de faturamento:", error);
      toast.error("Erro ao buscar faturamento mensal.");
    }
  };

  const refreshOrders = async () => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get('http://localhost:8800/pedidos'),
        axios.get('http://localhost:8800/produtos')
      ]);

      const productsMap = productsResponse.data.reduce((acc, product) => {
        acc[product.pro_id] = product.pro_nome;
        return acc;
      }, {});

      const today = new Date();
      const isSameDay = (date1, date2) =>
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();

      const ordersData = ordersResponse.data;

      const filteredOrdersData = ordersData.filter(order => {
        const orderDate = new Date(order.ped_data);
        return isSameDay(orderDate, today);
      });

      const mappedOrders = filteredOrdersData.map(order => {
        const productNames = [];
        if (order.arroz_fk) productNames.push(productsMap[order.arroz_fk]);
        if (order.feijao_fk) productNames.push(productsMap[order.feijao_fk]);
        if (order.massa_fk) productNames.push(productsMap[order.massa_fk]);
        if (order.carne01_fk) productNames.push(productsMap[order.carne01_fk]);
        if (order.carne02_fk) productNames.push(productsMap[order.carne02_fk]);

        return {
          id: order.ped_id,
          name: `${order.cli_nome} ${order.cli_sobrenome}`,
          products: productNames.join(', '),
          details: order.ped_observacao,
          status: order.ped_status,
          data: new Date().toISOString().split('T')[0],
          valor: order.ped_valor,
          day_order: order.ped_ordem_dia,
          visible: true
        };
      });

      setOrders(mappedOrders);

      const dailySum = filteredOrdersData.reduce((sum, order) => sum + parseFloat(order.ped_valor), 0);
      const dailyCount = filteredOrdersData.length;
      setDailyRevenue(dailySum);
      setDailyAverage(dailyCount > 0 ? dailySum / dailyCount : 0);
    } catch (error) {
      console.error("Erro ao atualizar pedidos:", error);
      toast.error("Erro ao atualizar pedidos.");
    }
  };

  useEffect(() => {
    refreshOrders();
    fetchRevenueData();
  }, []);

  useEffect(() => {
    const handleSearch = (event) => {
      const text = event.detail.toLowerCase();
      setSearchTerm(text);
    };
    window.addEventListener("search", handleSearch);
    return () => window.removeEventListener("search", handleSearch);
  }, []);

  useEffect(() => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        const matchesFilter = filter === 'Tudo' || order.status === filter;
        const matchesSearch = order.name.toLowerCase().includes(searchTerm);
        return {
          ...order,
          visible: matchesFilter && matchesSearch,
        };
      })
    );
  }, [filter, searchTerm]);

  const filteredOrders = orders.filter(order => order.visible !== false);

  return (
    <main className="dashboard">
      <div className="revenue-section">
        <div className="header-card card-green">
          <div className="revenue-header revenue-green">
            <DolarGreen />
            <div className="revenue-info">
              <h3>Faturamento de Hoje</h3>
              <p>R$ {dailyRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="revenue-transfer">
            <div className="vertical-divider"></div>
            <TransferGreen />
            <div className="transfer-details">
              <Statistic>Média Estatística</Statistic>
              <AmountGreen>R$ {dailyAverage.toFixed(2)}</AmountGreen>
            </div>
          </div>
        </div>

        <div className="header-card card-red">
          <div className="revenue-header revenue-red">
            <DolarRed />
            <div className="revenue-info">
              <h3>Faturamento deste Mês</h3>
              <p>R$ {monthlyRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="revenue-transfer">
            <div className="vertical-divider"></div>
            <TransferRed />
            <div className="transfer-details">
              <Statistic>Média Estatística do mês</Statistic>
              <AmountRed>R$ {monthlyAverage.toFixed(2)}</AmountRed>
            </div>
          </div>
        </div>
      </div>

      <section className="orders">
        <h2>Pedidos</h2>
        <FilterComponent
          filterState={filter}
          setFilter={setFilter}
          filterItens={productTypes}
        />
        <div className="order-cards">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} {...order} onStatusChange={refreshOrders} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
