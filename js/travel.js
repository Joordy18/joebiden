document.addEventListener('DOMContentLoaded', function() {
    const albums = JSON.parse(localStorage.getItem('albums')) || [];
    const albumList = document.getElementById('album-list');
    const addAlbumForm = document.getElementById('add-album-form');
    const albumContent = document.getElementById('album-content');
    const albumTitle = document.getElementById('album-title');
    const addPhotoInput = document.getElementById('add-photo');
    const addPhotoButton = document.getElementById('add-photo-button');
    const albumNotes = document.getElementById('album-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const gallery = document.getElementById('gallery');
    const toggleEditModeButton = document.getElementById('toggle-edit-mode-album');
    let currentAlbumIndex = null;
    let editMode = false;

    function renderAlbums() {
        albumList.innerHTML = '';
        albums.forEach((album, index) => {
            const li = document.createElement('li');
            li.textContent = album.title;
            li.addEventListener('click', () => {
                if (editMode) {
                    openAlbum(index);
                } else {
                    renderAlbumPage(album);
                }
            });
            albumList.appendChild(li);
        });
    }

    function openAlbum(index) {
        currentAlbumIndex = index;
        const album = albums[index];
        albumTitle.textContent = album.title;
        albumNotes.value = album.notes || '';
        gallery.innerHTML = '';
        album.photos.forEach((photo, photoIndex) => {
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.display = 'inline-block';
            imgContainer.style.margin = '10px';

            const img = document.createElement('img');
            img.src = photo;
            img.style.maxWidth = '100px';
            imgContainer.appendChild(img);

            if (editMode) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.style.position = 'absolute';
                deleteButton.style.top = '5px';
                deleteButton.style.right = '5px';
                deleteButton.style.backgroundColor = 'red';
                deleteButton.style.color = 'white';
                deleteButton.style.border = 'none';
                deleteButton.style.borderRadius = '4px';
                deleteButton.style.cursor = 'pointer';
                deleteButton.addEventListener('click', () => deletePhoto(photoIndex));
                imgContainer.appendChild(deleteButton);
            }

            gallery.appendChild(imgContainer);
        });
        albumContent.style.display = 'block';
    }

    function deletePhoto(photoIndex) {
        if (currentAlbumIndex !== null) {
            albums[currentAlbumIndex].photos.splice(photoIndex, 1);
            localStorage.setItem('albums', JSON.stringify(albums));
            openAlbum(currentAlbumIndex);
            showMessage('Photo supprimée avec succès.', 'success');
        } else {
            showMessage('Aucune photo à supprimer.', 'success');
        }
    }

    function updateInterface() {
        toggleEditModeButton.textContent = editMode ? 'Mode Affichage' : 'Mode Édition';
        albumList.classList.toggle('edit-mode', editMode);
        if (!editMode) {
            albumContent.style.display = 'none';
        }
    }

    function formatText(text) {
        // Apply headings (## Text = <h3>Text</h3>)
        let formattedText = text.replace(/##\s*(.*?)(\n|$)/g, "<h3>$1</h3>");

        // Apply bold (**Text** = <strong>Text</strong>)
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Convert lists (- item = <ul><li>item</li></ul>)
        formattedText = formattedText.replace(/- (.*?)(\n|$)/g, "<li>$1</li>");
        formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

        // Replace line breaks with <br> (outside of lists and headings)
        formattedText = formattedText.replace(/\n/g, "<br>");

        return formattedText;
    }

    function renderAlbumPage(album) {
        const formattedNotes = formatText(album.notes);
        const albumPage = window.open('', '_blank');
        albumPage.document.write(`
<html>
<head>
    <title>${album.title}</title>
    <link rel="stylesheet" href="css/generic.css">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        img { max-width: 100%; }
    </style>
</head>
<body>
    <div class="album-page">
        <h1>${album.title}</h1>
        <div id="gallery">
            ${album.photos.map(photo => `<img src="${photo}" alt="Album Photo">`).join('')}
        </div>
        <p>${formattedNotes}</p>
    </div>
</body>
</html>
        `);
    }

    addAlbumForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const newAlbumTitle = document.getElementById('new-album').value.trim();
        if (newAlbumTitle) {
            albums.push({ title: newAlbumTitle, photos: [], notes: '' });
            localStorage.setItem('albums', JSON.stringify(albums));
            renderAlbums();
            document.getElementById('new-album').value = '';
            showMessage('Album ajouté avec succès.', 'success');
        } else {
            showMessage('Veuillez remplir tous les champs.', 'error');
        }
    });

    addPhotoButton.addEventListener('click', function() {
        const file = addPhotoInput.files[0];
        if (file && currentAlbumIndex !== null) {
            const reader = new FileReader();
            reader.onload = function(e) {
                albums[currentAlbumIndex].photos.push(e.target.result);
                localStorage.setItem('albums', JSON.stringify(albums));
                openAlbum(currentAlbumIndex);
            };
            reader.readAsDataURL(file);
            showMessage('Photo ajoutée avec succès.', 'success');
        } else {
            showMessage('Veuillez sélectionner une ou des photos.', 'error');
        }
    });

    saveNotesButton.addEventListener('click', function() {
        if (currentAlbumIndex !== null) {
            albums[currentAlbumIndex].notes = albumNotes.value;
            localStorage.setItem('albums', JSON.stringify(albums));
            showMessage('Notes sauvegardées avec succès.', 'success');
        }
    });

    toggleEditModeButton.addEventListener('click', function() {
        editMode = !editMode;
        updateInterface();
    });


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

    renderAlbums();
    updateInterface();
});