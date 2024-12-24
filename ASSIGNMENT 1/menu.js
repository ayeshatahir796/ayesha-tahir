document.addEventListener("DOMContentLoaded", function () {
    const menuHtml = `
        <div id="menu" class="menu-overlay">
            <div class="menu-grid">
                
                <a href="Embroidedclassics.html">Embroided Classics</a>
                <a href="Premiumprints.html">Premium Prints</a>
                <a href="FestiveCollection.html">Festive Collection</a>
                <a href="Shawls.html">Shawls</a>
                <a href="bottom.html">BOTTOMS</a>
                <a href="Bareeze man.html">BAREEZE MAN</a>
        
            </div>
            <span class="close-btn" onclick="toggleMenu()">×</span>
        </div>
    `;
    document.querySelector("header").insertAdjacentHTML('beforeend', menuHtml);

    // Menu toggle logic
    window.toggleMenu = function () {
        const menu = document.getElementById("menu");
        menu.classList.toggle("active");
    };
});
