document.addEventListener('DOMContentLoaded', () => {

    const addProductBtn = document.getElementById('add-product-btn');
    const productGrid = document.getElementById('product-grid');
    const productForm = document.getElementById('product-form');

    const createNewProductCard = () => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="image-placeholder"></div>
            <div class="product-details">
                <input type="text" name="nome" placeholder="NOME" required>
                <input type="text" name="descricao" placeholder="Descrição" required>
                <input type="text" name="valor" placeholder="Valores" required>
            </div>
        `;
        
        productGrid.insertBefore(card, addProductBtn);
    };

    addProductBtn.addEventListener('click', () => {
        createNewProductCard();
    });

    productForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const allProductCards = document.querySelectorAll('.product-card');
        const productsData = [];

        allProductCards.forEach(card => {
            const nome = card.querySelector('input[name="nome"]').value;
            const descricao = card.querySelector('input[name="descricao"]').value;
            const valor = card.querySelector('input[name="valor"]').value;

            if (nome) {
                productsData.push({ nome, descricao, valor });
            }
        });

        console.log('Dados dos produtos a serem enviados:');
        console.log(productsData);

        alert(`Foram coletados dados de ${productsData.length} produto(s)! Veja o console para detalhes (Pressione F12).`);
    });
});