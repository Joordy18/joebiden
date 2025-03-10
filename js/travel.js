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

    const editAlbumModal = document.getElementById('edit-album-modal');
    const closeAlbumModal = document.getElementsByClassName('close')[1];
    const editAlbumForm = document.getElementById('edit-album-form');
    const deleteAlbumButton = document.getElementById('delete-album');
    const editAlbumTitle = document.getElementById('edit-album-title');
    const editAlbumNotes = document.getElementById('edit-album-notes');
    const editAlbumPhotos = document.getElementById('edit-album-photos');
    const editAlbumPhotosList = document.getElementById('edit-album-photos-list');

    function renderAlbums() {
        albumList.innerHTML = '';
        albums.forEach((album, index) => {
            const li = document.createElement('li');
            li.textContent = album.title;
            li.addEventListener('click', () => {
                if (editMode) {
                    openAlbumModal(index);
                } else {
                    openAlbum(index);
                }
            });
            albumList.appendChild(li);
        });
    }

    function openAlbum(index) {
        currentAlbumIndex = index;
        const album = albums[index];
        renderAlbumPage(album);
    }

    function openAlbumModal(index) {
        currentAlbumIndex = index;
        const album = albums[index];
        editAlbumTitle.value = album.title;
        editAlbumNotes.value = album.notes || '';
        editAlbumPhotosList.innerHTML = '';
        album.photos.forEach((photo, photoIndex) => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = photo.url;
            img.style.maxWidth = '100px';
            li.appendChild(img);

            const descriptionInput = document.createElement('input');
            descriptionInput.type = 'text';
            descriptionInput.value = photo.description;
            descriptionInput.placeholder = 'Description';
            descriptionInput.addEventListener('input', (event) => {
                photo.description = event.target.value;
                localStorage.setItem('albums', JSON.stringify(albums));
            });
            li.appendChild(descriptionInput);

            const upButton = document.createElement('button');
            upButton.textContent = 'Up';
            upButton.addEventListener('click', () => movePhoto(photoIndex, -1));
            li.appendChild(upButton);

            const downButton = document.createElement('button');
            downButton.textContent = 'Down';
            downButton.addEventListener('click', () => movePhoto(photoIndex, 1));
            li.appendChild(downButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deletePhoto(photoIndex));
            li.appendChild(deleteButton);

            editAlbumPhotosList.appendChild(li);
        });
        editAlbumModal.style.display = 'block';
    }

    closeAlbumModal.onclick = function() {
        editAlbumModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == editAlbumModal) {
            editAlbumModal.style.display = 'none';
        }
    }

    editAlbumForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (currentAlbumIndex !== null) {
            albums[currentAlbumIndex].title = editAlbumTitle.value;
            albums[currentAlbumIndex].notes = editAlbumNotes.value;
            const files = editAlbumPhotos.files;
            if (files.length > 0) {
                const readers = [];
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    readers.push(reader);
                    reader.onload = function(e) {
                        if (!albums[currentAlbumIndex].photos.some(photo => photo.url === e.target.result)) {
                            albums[currentAlbumIndex].photos.push({ url: e.target.result, description: '' });
                        }
                        if (readers.every(r => r.readyState === 2)) {
                            localStorage.setItem('albums', JSON.stringify(albums));
                            renderAlbums();
                            editAlbumModal.style.display = 'none';
                            showMessage('Album modifié avec succès.', 'success');
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            } else {
                localStorage.setItem('albums', JSON.stringify(albums));
                renderAlbums();
                editAlbumModal.style.display = 'none';
                showMessage('Album modifié avec succès.', 'success');
            }
        }
    });

    deleteAlbumButton.addEventListener('click', function() {
        if (currentAlbumIndex !== null) {
            albums.splice(currentAlbumIndex, 1);
            localStorage.setItem('albums', JSON.stringify(albums));
            renderAlbums();
            editAlbumModal.style.display = 'none';
            showMessage('Album supprimé avec succès.', 'success');
        }
    });

    function deletePhoto(photoIndex) {
        if (currentAlbumIndex !== null) {
            albums[currentAlbumIndex].photos.splice(photoIndex, 1);
            localStorage.setItem('albums', JSON.stringify(albums));
            openAlbumModal(currentAlbumIndex);
            showMessage('Photo supprimée avec succès.', 'success');
        } else {
            showMessage('Aucune photo à supprimer.', 'error');
        }
    }

    function movePhoto(photoIndex, direction) {
        if (currentAlbumIndex !== null) {
            const album = albums[currentAlbumIndex];
            const newIndex = photoIndex + direction;
            if (newIndex >= 0 && newIndex < album.photos.length) {
                const [movedPhoto] = album.photos.splice(photoIndex, 1);
                album.photos.splice(newIndex, 0, movedPhoto);
                localStorage.setItem('albums', JSON.stringify(albums));
                openAlbumModal(currentAlbumIndex);
                showMessage('Photo réorganisée avec succès.', 'success');
            }
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
        let formattedText = text.replace(/##\s*(.*?)(\n|$)/g, "<h3>$1</h3>");
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formattedText = formattedText.replace(/- (.*?)(\n|$)/g, "<li>$1</li>");
        formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");
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
        .photo-container { position: relative; display: inline-block; }
        .photo-description {
            display: none;
            position: absolute;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            width: 100%;
            text-align: center;
            padding: 5px;
            box-sizing: border-box;
        }
        .photo-container:hover .photo-description {
            display: block;
        }
    </style>
</head>
<body>
    <div class="album-page">
        <h1>${album.title}</h1>
        <div id="gallery">
            ${album.photos.map(photo => `
                <div class="photo-container">
                    <img src="${photo.url}" alt="Album Photo">
                    <div class="photo-description">${photo.description}</div>
                </div>
            `).join('')}
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
                if (!albums[currentAlbumIndex].photos.some(photo => photo.url === e.target.result)) {
                    albums[currentAlbumIndex].photos.push({ url: e.target.result, description: '' });
                    localStorage.setItem('albums', JSON.stringify(albums));
                    openAlbumModal(currentAlbumIndex);
                    showMessage('Photo ajoutée avec succès.', 'success');
                } else {
                    showMessage('Cette photo existe déjà dans l\'album.', 'error');
                }
            };
            reader.readAsDataURL(file);
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

    const addPhotosButton = document.getElementById('add-photos-button');

    addPhotosButton.addEventListener('click', function() {
        const files = editAlbumPhotos.files;
        if (files.length > 0 && currentAlbumIndex !== null) {
            const readers = [];
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                readers.push(reader);
                reader.onload = function(e) {
                    if (!albums[currentAlbumIndex].photos.some(photo => photo.url === e.target.result)) {
                        albums[currentAlbumIndex].photos.push({ url: e.target.result, description: '' });
                    }
                    if (readers.every(r => r.readyState === 2)) {
                        localStorage.setItem('albums', JSON.stringify(albums));
                        openAlbumModal(currentAlbumIndex);
                        showMessage('Photos ajoutées avec succès.', 'success');
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        } else {
            showMessage('Veuillez sélectionner une ou des photos.', 'error');
        }
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