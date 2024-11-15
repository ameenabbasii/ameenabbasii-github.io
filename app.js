const cloudName = "dvkugkqst"; 
const uploadPreset = "gallery"; 

// Array to store the public_ids of images
let imagePublicIds = [];

// Function to handle the image upload
function uploadImage() {
    const fileInput = document.getElementById('imageInput');
    const files = fileInput.files; // Get selected files

    if (files.length > 0) {
        // Loop through each selected file
        Array.from(files).forEach(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            // Cloudinary upload URL
            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            // Upload the image to Cloudinary
            fetch(url, {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // Get the public_id of the uploaded image
                const publicId = data.public_id;

                // Add the new image public_id to the array
                imagePublicIds.push(publicId);

                // Store the image public_ids in localStorage (for persistence on page reload)
                localStorage.setItem('imagePublicIds', JSON.stringify(imagePublicIds));

                // Display the uploaded image
                displayImage(publicId);
            })
            .catch(error => {
                console.error("Error uploading image:", error);
            });
        });
    } else {
        alert("Please select an image.");
    }
}

// Function to display the uploaded image in the gallery
function displayImage(publicId) {
    const imageGallery = document.getElementById('imageGallery');
    
    // Create the image URL using Cloudinary's URL format
    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;

    const imageCard = document.createElement('div');
    imageCard.classList.add('image-card');
    imageCard.setAttribute('data-public-id', publicId);  // Store public_id for future deletion

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Uploaded Image';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'Delete';

    // Delete button functionality
    deleteButton.addEventListener('click', function() {
        deleteImage(imageCard, publicId);
    });

    // Append the image and delete button to the image card
    imageCard.appendChild(imgElement);
    imageCard.appendChild(deleteButton);

    // Append image card to the gallery
    imageGallery.appendChild(imageCard);
}

// Delete image functionality
function deleteImage(imageCard, publicId) {
    // Remove image from Cloudinary using DELETE API
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    // FormData for DELETE request
    const formData = new FormData();
    formData.append('public_id', publicId);

    // Send the DELETE request to Cloudinary
    fetch(url, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Image deleted from Cloudinary:', data);
    })
    .catch(error => {
        console.error('Error deleting image from Cloudinary:', error);
    });

    // Remove the image card from the DOM
    imageCard.remove();

    // Remove the image public_id from the array and localStorage
    imagePublicIds = imagePublicIds.filter(id => id !== publicId);
    localStorage.setItem('imagePublicIds', JSON.stringify(imagePublicIds));
}

// Enable/Disable upload button based on file selection
document.getElementById('imageInput').addEventListener('change', function () {
    const uploadButton = document.getElementById('uploadButton');
    if (this.files.length > 0) {
        uploadButton.disabled = false;
    } else {
        uploadButton.disabled = true;
    }
});

// Event listener for the upload button
document.getElementById('uploadButton').addEventListener('click', uploadImage);

// Load images on page load (fetch from localStorage or use default array)
window.onload = function () {
    // Get stored image public_ids from local storage (if any)
    const storedPublicIds = localStorage.getItem('imagePublicIds');
    if (storedPublicIds) {
        imagePublicIds = JSON.parse(storedPublicIds);

        // Display all stored images on page load by fetching URLs using the public_id
        imagePublicIds.forEach(publicId => {
            displayImage(publicId);
        });
    }
};
