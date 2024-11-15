const cloudName = "dvkugkqst"; 
const uploadPreset = "gallery"; 

// Array to store the image URLs
let imageUrls = [];

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
                // Get the secure URL of the uploaded image
                const imageUrl = data.secure_url;

                // Add the new image URL to the array
                imageUrls.push(imageUrl);

                // Store the image URLs in local storage (optional, for persistence on page reload)
                localStorage.setItem('imageUrls', JSON.stringify(imageUrls));

                // Display the uploaded image
                displayImage(imageUrl, data.public_id); // Pass public_id for future deletion
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
function displayImage(url, publicId) {
    const imageGallery = document.getElementById('imageGallery');
    
    const imageCard = document.createElement('div');
    imageCard.classList.add('image-card');
    imageCard.setAttribute('data-public-id', publicId);  // Store public_id for future deletion

    const imgElement = document.createElement('img');
    imgElement.src = url;
    imgElement.alt = 'Uploaded Image';
    imgElement.style.width = "500px"; // Adjust the size
    imgElement.style.margin = "0px";

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
    // Optional: Remove image from Cloudinary using DELETE API
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

    // Remove the image URL from the imageUrls array and localStorage
    imageUrls = imageUrls.filter(url => url !== imageCard.querySelector('img').src);
    localStorage.setItem('imageUrls', JSON.stringify(imageUrls));
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
    // Get stored image URLs from local storage (if any)
    const storedImages = localStorage.getItem('imageUrls');
    if (storedImages) {
        imageUrls = JSON.parse(storedImages);

        // Display all stored images on page load
        imageUrls.forEach(url => {
            // Since we don't have the public_id saved, it will be omitted for Cloudinary delete
            displayImage(url);
        });
    }
};
