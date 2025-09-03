const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDirectory = './images';
const outputDirectory = './images/optimized';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

// Image optimization settings
const settings = {
    jpeg: {
        quality: 80,
        progressive: true
    },
    png: {
        quality: 80,
        compressionLevel: 9
    },
    webp: {
        quality: 80
    }
};

// Process each image
async function optimizeImage(file) {
    const inputPath = path.join(imageDirectory, file);
    const outputPath = path.join(outputDirectory, file.replace(/\.[^/.]+$/, '.webp'));
    
    try {
        await sharp(inputPath)
            .webp(settings.webp)
            .toFile(outputPath);
        console.log(`Optimized: ${file}`);
    } catch (error) {
        console.error(`Error optimizing ${file}:`, error);
    }
}

// Process all images in the directory
fs.readdir(imageDirectory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif)$/i.test(file)
    );

    imageFiles.forEach(optimizeImage);
}); 