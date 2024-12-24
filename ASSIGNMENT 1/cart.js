// Add an item to the cart
function addToBag(name, description, price) {
    // Create a cart array if it doesn't exist
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    // Add the new item to the cart
    cart.push({ name, description, price });
  
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
  
    // Show alert
    alert(`${name} has been added to your bag.`);
  }
  
  // Display the cart on the shopping cart page
  function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-container");
    const cartTotal = document.getElementById("cart-total");
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      cartTotal.innerHTML = "";
      return;
    }
  
    // Render cart items
    cartContainer.innerHTML = cart
      .map(
        (item, index) => `
        <div>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>Price: ${item.price}</p>
          <button onclick="removeFromCart(${index})">Remove</button>
        </div>
        <hr>
      `
      )
      .join("");
  
    // Calculate and render total price
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.innerHTML = `<h2>Total: ${total}</h2>`;
  }
  
  // Remove an item from the cart
  function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Remove item at the given index
  
    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart));
  
    // Refresh the cart display
    displayCart();
  }
  
  // Clear the entire cart
  function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
  }
  
  // Call displayCart when the page loads
  window.onload = displayCart;
  