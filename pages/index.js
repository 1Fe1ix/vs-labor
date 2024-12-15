import React, { useState, useEffect } from 'react';
//import axios from 'axios';
const axios = require('axios');
import styles from './ShoppingApp.module.css';


export default function ShoppingApp() {
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedItemName, setSelectedItemName] = useState('');
    const [selectedItemAmount, setSelectedItemAmount] = useState(1);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    


    
    // Fetch all shopping items on initial render
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(API_URL);
                console.log(API_URL);
                setItems(response.data);
            } catch (error) {
                console.error('Error fetching items:', error);
                if (error.response) {
                    console.error('Server responded with:', error.response.data);
                } else if (error.request) {
                    console.error('Request was made but no response received:', error.request);
                } else {
                    console.error('Error setting up the request:', error.message);
                }
            }
        };

        fetchItems();
    }, []);

    // Add an item to the cart
    const addToCart = (item, amount) => {
        const existingItem = cart.find(cartItem => cartItem.name === item.name);
        const availableAmount = item.amount;
        const desiredAmount = existingItem ? existingItem.amount + amount : amount;

        if (desiredAmount > availableAmount) {
            alert(`You cannot add more than ${availableAmount} of ${item.name} to the cart.`);
            return;
        }

        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.name === item.name ? { ...cartItem, amount: cartItem.amount + amount } : cartItem
            ));
        } else {
            setCart([...cart, { ...item, amount: amount }]);
        }
    };

    // Remove an item from the cart
    const removeFromCart = (name) => {
        const itemInCart = cart.find(cartItem => cartItem.name === name);
        if (itemInCart) {
            const updatedCart = cart.filter(cartItem => cartItem.name !== name);
            setCart(updatedCart);
        }
    };

    // Add a new item to the shopping list
    const addItem = async () => {
        if (!selectedItemName) return;
        const newItem = { name: selectedItemName, amount: selectedItemAmount };

        try {
            const response = await axios.post(API_URL, newItem);
            setItems([...items, response.data]);
            setSelectedItemName('');
            setSelectedItemAmount(1);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Update an item in the shopping list
    const updateItem = async (itemName, newAmount) => {
        try {

            const data = {
                amount: newAmount
            };
    
            const response = await axios.put(`${API_URL}/${itemName}`, data, {headers: { 'Content-Type': 'application/json' }});
            

            //reload page
            window.location.reload();
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    // Delete an item from the shopping list
    const deleteItem = async (name) => {
        try {
            await axios.delete(`${API_URL}/${name}`);
            setItems(items.filter(item => item.name !== name));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Shopping List</h1>
            <div className={styles.itemsGrid}>
                {items.map((item) => {
                    const existingItemInCart = cart.find(cartItem => cartItem.name === item.name);
                    const addButtonDisabled = existingItemInCart && existingItemInCart.amount >= item.amount;
                    return (
                        <div key={item.name} className={styles.itemCard}>
                            <div className={styles.itemDetails}>
                                <h2 className={styles.itemName}>{item.name}</h2>
                                <p className={styles.itemAmount}>Available Quantity: {item.amount}</p>
                                <input
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    className={styles.input}
                                    onChange={(e) => item.selectedAmount = parseInt(e.target.value)}
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button
                                    onClick={() => addToCart(item, item.selectedAmount || 1)}
                                    className={styles.addButton}
                                    disabled={addButtonDisabled}
                                >
                                    {addButtonDisabled ? 'Max Reached' : 'Add to Cart'}
                                </button>
                                <button onClick={() => deleteItem(item.name)} className={styles.deleteButton}>
                                    Delete Item
                                </button>
                            </div>

                            {/* update option below*/}
                            <div className = {styles.updateArea}>
                            <input
                            type="number"
                            min="1"
                            defaultValue={item.amount}
                            className={styles.input}
                            onChange={(e) => item.newAmount = parseInt(e.target.value)}
                            />

                            <div className={styles.buttonGroup}>
                            <button
                            onClick={() => {
                                const updatedAmount = item.newAmount || item.amount;
                                updateItem(item.name, updatedAmount);
                            }}
                            className={styles.updateButton}
                            >
                                Update Amount
                            </button>    
                            </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            <div className={styles.cartContainer}>
                <h2 className={styles.cartTitle}>Shopping Cart</h2>
                {cart.length === 0 ? (
                    <p className={styles.emptyCart}>Your cart is empty</p>
                ) : (
                    <ul className={styles.cartList}>
                        {cart.map((item) => (
                            <li key={item.name} className={styles.cartItem}>
                                <span>{item.name} - {item.amount}</span>
                                <button onClick={() => removeFromCart(item.name)} className={styles.deleteButton}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={styles.addItemContainerBottomRight}>
                <input
                    type="text"
                    placeholder="Item name"
                    value={selectedItemName}
                    onChange={(e) => setSelectedItemName(e.target.value)}
                    className={styles.input}
                />
                <input
                    type="number"
                    min="1"
                    value={selectedItemAmount}
                    onChange={(e) => setSelectedItemAmount(e.target.value)}
                    className={styles.input}
                />
                <button onClick={addItem} className={styles.addButton}>Add Item</button>
            </div>
        </div>
    );
}