import React, { useState, useEffect } from 'react';
import './App.css';

const apiUrl = 'http://localhost:5000';

const App = () => {
  const [orders, setOrders] = useState([]);
  const [orderName, setOrderName] = useState('');
  const [selectedItems, setSelectedItems] =   useState({
    pizza: false,
    burger: false,
    pasta: false,
    coke: false,
  });

  const menu = {
    pizza: 200,
    burger: 100,
    pasta: 150,
    coke: 50,
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch all orders from the server
  const fetchOrders = async () => {
    const response = await fetch(`${apiUrl}/orders`);
    const data = await response.json();
    setOrders(data);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (item) => {
    setSelectedItems((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  // Place a new order
  const createOrder = async () => {
    const selectedItemsList = Object.keys(selectedItems).filter(item => selectedItems[item]);
    if (!orderName || selectedItemsList.length === 0) {
      alert('Please enter your name and select at least one item.');
      return;
    }

    const response = await fetch(`${apiUrl}/placeOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orderName, items: selectedItemsList.join(',') }),
    });
    const data = await response.json();
    alert(data.message);
    setOrderName('');
    setSelectedItems({
      pizza: false,
      burger: false,
      pasta: false,
      coke: false,
    });
    fetchOrders();
  };

  // Delete an order
  const deleteOrder = async (id) => {
    if (window.confirm('Delete this order?')) {
      await fetch(`${apiUrl}/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    }
  };

  // Edit an order
  const editOrder = (id, currentName, currentItems) => {
    const newName = prompt('Enter new customer name:', currentName);
    const newItems = prompt('Enter new items (comma-separated):', currentItems);
    if (newName && newItems) {
      fetch(`${apiUrl}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, items: newItems }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          fetchOrders();
        });
    }
  };

  return (
    <div className="App">
      <h1>🍕 Food Delivery Orders</h1>

      <h3>Create New Order:</h3>
      <input
        type="text"
        placeholder="Customer Name"
        value={orderName}
        onChange={(e) => setOrderName(e.target.value)}
      />

      <div id="menuItems">
        {Object.keys(menu).map((item) => (
          <div key={item} className="menu-item">
            <input
              type="checkbox"
              checked={selectedItems[item]}
              onChange={() => handleCheckboxChange(item)}
            />
            <label>{`${item.charAt(0).toUpperCase() + item.slice(1)} (₹${menu[item]})`}</label>
          </div>
        ))}
      </div>

      <button onClick={createOrder}>Place Order</button>

      <h3>All Orders:</h3>
      <button onClick={fetchOrders}>Refresh Orders</button>
      <div id="orders">
        {orders.map((order) => (
          <div key={order._id} className="order">
            <strong>Order ID:</strong> {order._id} <br />
            <strong>Name:</strong> {order.name} <br />
            <strong>Items:</strong> {order.items.join(', ')} <br />
            <strong>Total:</strong> ₹{order.totalCost} <br />
            <button onClick={() => deleteOrder(order._id)}>Delete</button>
            <button onClick={() => editOrder(order._id, order.name, order.items.join(','))}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;