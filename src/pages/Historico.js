import React, { useState, useEffect } from "react";
import OrderCard from "../components/OrderCard";
import { Box, TextField, MenuItem } from "@mui/material";
import "./../styles/Historico.css";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const Historico = () => {
  const [customerName, setCustomerName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [valor, setValor] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (customerName) params.append("customerName", customerName);
      if (orderDate) params.append("orderDate", orderDate);
      if (orderStatus) params.append("status", orderStatus);
      if (valor) params.append("valor", valor);

      const response = await fetch(`http://localhost:8800/pedidos/filtred?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar pedidos");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [customerName, orderDate, orderStatus, valor]);

  return (
    <div className="historico-container">
      <h2 className="title">Histórico de Pedidos</h2>
      <div className="filters">
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <TextField
            label="Nome do Cliente"
            variant="outlined"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite o nome do cliente"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#FD1F4A" },
                "&.Mui-focused fieldset": { borderColor: "#FD1F4A" },
              },
              width: "25ch",
            }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DatePicker
              label="Data do Pedido"
              value={orderDate ? dayjs(orderDate) : null}
              onChange={(newValue) => setOrderDate(newValue?.format("YYYY-MM-DD"))}
              slotProps={{
                textField: {
                  variant: "outlined",
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: "#FD1F4A" },
                      "&.Mui-focused fieldset": { borderColor: "#FD1F4A" },
                    },
                    width: "20ch",
                  },
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Status do Pedido"
            variant="outlined"
            select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#FD1F4A" },
                "&.Mui-focused fieldset": { borderColor: "#FD1F4A" },
              },
              width: "22ch",
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Em Andamento">Em andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
            <MenuItem value="Cancelado">Cancelado</MenuItem>
          </TextField>

          <TextField
            label="Valor"
            variant="outlined"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#FD1F4A" },
                "&.Mui-focused fieldset": { borderColor: "#FD1F4A" },
              },
              width: "15ch",
            }}
          />
        </Box>
      </div>

      {loading ? (
        <p>Carregando pedidos...</p>
      ) : orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.ped_id}
              id={order.ped_id}
              name={`${order.cli_nome} ${order.cli_sobrenome}`}
              details={`Funcionário: ${order.fun_nome} - Tipo Pagamento: ${order.ped_tipoPagamento}`}
              status={order.ped_status}
              data={order.ped_data}
              day_order={order.ped_day_order}
              products={order.ped_observacao}
              valor={order.ped_valor}
              refreshOrders={fetchOrders} // 🔥 Refresh após editar ou mudar status
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Nenhum pedido encontrado.</p>
      )}
    </div>
  );
};

export default Historico;
