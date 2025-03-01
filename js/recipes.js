document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('#content section');
    const modal = document.getElementById('edit-recipe-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const editRecipeForm = document.getElementById('edit-recipe-form');
    const deleteRecipeButton = document.getElementById('delete-recipe');
    const addRecipeForm = document.getElementById('add-recipe-form');
    const searchInput = document.getElementById('search');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const sortSelect = document.getElementById('sort-recipes');
    const filterCategorySelect = document.getElementById('filter-category');
    const newRecipeCategorySelect = document.getElementById('new-recipe-category');
    const editRecipeCategorySelect = document.getElementById('edit-recipe-category');
    const toggleEditModeButton = document.getElementById('toggle-edit-mode');
    let currentRecipeIndex = null;
    let currentPage = 1;
    const recipesPerPage = 5;
    let isEditMode = false;

    toggleEditModeButton.addEventListener('click', function() {
        isEditMode = !isEditMode;
        toggleEditModeButton.textContent = isEditMode ? 'Mode Affichage' : 'Mode Édition';
        document.getElementById('add-recipe-form').style.display = isEditMode ? 'block' : 'none';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

    const recipeList = document.getElementById('recipe-list');
    function renderRecipes(filter = '', category = '') {
        recipeList.innerHTML = '';
        const filteredRecipes = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(filter.toLowerCase()) &&
            (category === '' || recipe.category === category)
        );
        const sortedRecipes = sortRecipes(filteredRecipes);
        const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage);
        const start = (currentPage - 1) * recipesPerPage;
        const end = start + recipesPerPage;
        const paginatedRecipes = sortedRecipes.slice(start, end);

        paginatedRecipes.forEach((recipe, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${recipe.image}" alt="Recipe Image" style="max-width: 100px; display: ${recipe.image ? 'block' : 'none'};">
                <span>${recipe.title} (${recipe.category})</span>
            `;
            li.addEventListener('click', function() {
                if (isEditMode) {
                    document.getElementById('edit-recipe-title').value = recipe.title;
                    document.getElementById('edit-recipe-content').value = recipe.content;
                    editRecipeCategorySelect.value = recipe.category;
                    document.getElementById('edit-recipe-image-preview').src = recipe.image;
                    document.getElementById('edit-recipe-image-preview').style.display = recipe.image ? 'block' : 'none';
                    modal.style.display = 'block';
                    currentRecipeIndex = recipes.indexOf(recipe);
                } else {
                    openRecipePage(recipe);
                }
            });
            recipeList.appendChild(li);
        });

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function sortRecipes(recipes) {
        const sortValue = sortSelect.value;
        return recipes.sort((a, b) => {
            if (sortValue === 'title-asc') {
                return a.title.localeCompare(b.title);
            } else if (sortValue === 'title-desc') {
                return b.title.localeCompare(a.title);
            }
            return 0;
        });
    }

    function openRecipePage(recipe) {
        const formattedContent = formatText(recipe.content);
        const recipePage = window.open('', '_blank');
        recipePage.document.write(`
    <html>
    <head>
        <title>${recipe.title}</title>
        <link rel="stylesheet" href="css/generic.css">
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            img { max-width: 100%; }
        </style>
    </head>
    <body>
        <div class="recipe-page">
            <h1>${recipe.title}</h1>
            <p><strong id="category">Catégorie:</strong> ${recipe.category}</p>
            <img src="${recipe.image}" alt="Recipe Image">
            <p>${formattedContent}</p>
        </div>
    </body>
    </html>
    `);
    }

    renderRecipes();

    closeModal.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    addRecipeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newRecipeInput = document.getElementById('new-recipe');
        const newRecipeCategory = newRecipeCategorySelect.value;
        const newRecipeImage = document.getElementById('new-recipe-image').files[0];
        const newRecipe = newRecipeInput.value.trim();
        if (newRecipe) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const recipe = { title: newRecipe, content: '', category: newRecipeCategory, image: e.target.result };
                recipes.push(recipe);
                localStorage.setItem('recipes', JSON.stringify(recipes));
                renderRecipes();
                newRecipeInput.value = '';
            };
            if (newRecipeImage) {
                reader.readAsDataURL(newRecipeImage);
            } else {
                const recipe = { title: newRecipe, content: '', category: newRecipeCategory, image: '' };
                recipes.push(recipe);
                localStorage.setItem('recipes', JSON.stringify(recipes));
                renderRecipes();
                newRecipeInput.value = '';
                showMessage('Recette ajoutée avec succès.', 'success');
            }
        } else {
            showMessage('Veuillez remplir tous les champs.', 'error');
        }
    });

    editRecipeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const editedTitle = document.getElementById('edit-recipe-title').value.trim();
        const editedContent = document.getElementById('edit-recipe-content').value.trim();
        const editedCategory = editRecipeCategorySelect.value;
        const editedImage = document.getElementById('edit-recipe-image').files[0];
        if (editedTitle && editedContent) {
            const reader = new FileReader();
            reader.onload = function(e) {
                recipes[currentRecipeIndex].title = editedTitle;
                recipes[currentRecipeIndex].content = editedContent;
                recipes[currentRecipeIndex].category = editedCategory;
                recipes[currentRecipeIndex].image = e.target.result;
                localStorage.setItem('recipes', JSON.stringify(recipes));
                renderRecipes();
                modal.style.display = 'none';
            };
            if (editedImage) {
                reader.readAsDataURL(editedImage);
            } else {
                recipes[currentRecipeIndex].title = editedTitle;
                recipes[currentRecipeIndex].content = editedContent;
                recipes[currentRecipeIndex].category = editedCategory;
                localStorage.setItem('recipes', JSON.stringify(recipes));
                renderRecipes();
                modal.style.display = 'none';
                showMessage('Recette modifiée avec succès.', 'success');
            }
        } else {
            showMessage('Veuillez remplir tous les champs.', 'error');
        }
    });

    deleteRecipeButton.addEventListener('click', function() {
        recipes.splice(currentRecipeIndex, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        renderRecipes();
        modal.style.display = 'none';
        showMessage('Recette supprimée avec succès.', 'success');
    });

    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.trim();
        currentPage = 1;
        renderRecipes(filter);
    });

    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderRecipes(searchInput.value.trim());
        }
    });

    nextPageButton.addEventListener('click', function() {
        const filter = searchInput.value.trim();
        const filteredRecipes = recipes.filter(recipe => recipe.title.toLowerCase().includes(filter.toLowerCase()));
        const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderRecipes(filter);
        }
    });

    sortSelect.addEventListener('change', function() {
        renderRecipes(searchInput.value.trim());
    });

    filterCategorySelect.addEventListener('change', function() {
        renderRecipes(searchInput.value.trim(), filterCategorySelect.value);
    });

    function formatText(text) {
        // Appliquer les titres (## Texte = <h3>Texte</h3>)
        let formattedText = text.replace(/##\s*(.*?)(\n|$)/g, "<h3>$1</h3>");

        // Appliquer le gras (**Texte** = <strong>Texte</strong>)
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convertir les listes (- élément = <ul><li>élément</li></ul>)
        formattedText = formattedText.replace(/- (.*?)(\n|$)/g, "<li>$1</li>");
        formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

        // Remplacer les sauts de ligne par des <br> (hors des listes et titres)
        formattedText = formattedText.replace(/\n/g, "<br>");

        return formattedText;
    }

    function showMessage(message, type) {
        const messageContainer = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.style.backgroundColor = type === 'success' ? 'green' : 'red';
        messageElement.style.color = 'white';
        messageElement.style.padding = '10px';
        messageElement.style.marginTop = '5px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        messageContainer.appendChild(messageElement);
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
        }, 3000);
    }
});