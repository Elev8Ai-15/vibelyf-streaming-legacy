/**
 * VIBELYF IMAGE EDITOR
 * Real-time image editing with CSS filters and canvas export
 * Extracted from V20 Forge Edition
 */

window.VibeLyfImageEditor = {
    
    originalImage: null,
    currentImage: null,
    
    /**
     * Initialize the image editor
     */
    init() {
        console.log('🎨 Image Editor initialized');
        
        // We don't bind events here - the UI will call our methods directly
        return true;
    },
    
    /**
     * Load an image from a File object
     */
    async loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.originalImage = e.target.result;
                this.currentImage = e.target.result;
                console.log('✅ Image loaded:', file.name);
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                console.error('❌ Failed to load image:', e);
                reject(new Error('Failed to load image'));
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Load an image from a URL
     */
    async loadImageFromUrl(url) {
        this.originalImage = url;
        this.currentImage = url;
        console.log('✅ Image loaded from URL');
        return url;
    },
    
    /**
     * Apply filters to an image element
     */
    applyFilters(imageElement, filters) {
        const {
            brightness = 100,
            contrast = 100,
            saturate = 100,
            hue = 0,
            blur = 0,
            sepia = 0
        } = filters;
        
        imageElement.style.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturate}%)
            hue-rotate(${hue}deg)
            blur(${blur}px)
            sepia(${sepia}%)
        `;
        
        return imageElement.style.filter;
    },
    
    /**
     * Get preset filter configurations
     */
    getPresets() {
        return {
            enhance: {
                name: 'Enhance',
                description: 'Brighter, more vivid',
                icon: '✨',
                brightness: 110,
                contrast: 115,
                saturate: 120,
                hue: 0,
                blur: 0,
                sepia: 0
            },
            sharpen: {
                name: 'Sharpen',
                description: 'High contrast, crisp',
                icon: '🔪',
                brightness: 100,
                contrast: 130,
                saturate: 110,
                hue: 0,
                blur: 0,
                sepia: 0
            },
            warm: {
                name: 'Warm',
                description: 'Cozy, orange tones',
                icon: '🔥',
                brightness: 105,
                contrast: 105,
                saturate: 110,
                hue: 15,
                blur: 0,
                sepia: 20
            },
            cool: {
                name: 'Cool',
                description: 'Blue, professional',
                icon: '❄️',
                brightness: 100,
                contrast: 110,
                saturate: 90,
                hue: 200,
                blur: 0,
                sepia: 0
            },
            vintage: {
                name: 'Vintage',
                description: 'Retro, faded',
                icon: '📷',
                brightness: 110,
                contrast: 85,
                saturate: 70,
                hue: 0,
                blur: 0,
                sepia: 40
            },
            bw: {
                name: 'Black & White',
                description: 'Classic monochrome',
                icon: '⚫',
                brightness: 100,
                contrast: 120,
                saturate: 0,
                hue: 0,
                blur: 0,
                sepia: 0
            },
            blur: {
                name: 'Soft Blur',
                description: 'Dreamy, soft focus',
                icon: '💭',
                brightness: 105,
                contrast: 95,
                saturate: 105,
                hue: 0,
                blur: 3,
                sepia: 0
            },
            dramatic: {
                name: 'Dramatic',
                description: 'High contrast, bold',
                icon: '⚡',
                brightness: 95,
                contrast: 140,
                saturate: 85,
                hue: 0,
                blur: 0,
                sepia: 0
            }
        };
    },
    
    /**
     * Apply a preset to an image element
     */
    applyPreset(imageElement, presetName) {
        const presets = this.getPresets();
        const preset = presets[presetName];
        
        if (!preset) {
            console.error(`❌ Preset not found: ${presetName}`);
            return false;
        }
        
        return this.applyFilters(imageElement, preset);
    },
    
    /**
     * Reset all filters
     */
    reset(imageElement) {
        const defaultFilters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hue: 0,
            blur: 0,
            sepia: 0
        };
        
        return this.applyFilters(imageElement, defaultFilters);
    },
    
    /**
     * Export edited image to canvas and download
     */
    async downloadImage(imageElement, filename = 'vibelyf-edited.png') {
        if (!this.originalImage) {
            throw new Error('No image loaded');
        }
        
        return new Promise((resolve, reject) => {
            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Create temp image
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = () => {
                // Set canvas size to match image
                canvas.width = tempImg.naturalWidth;
                canvas.height = tempImg.naturalHeight;
                
                // Apply filters to canvas context
                ctx.filter = imageElement.style.filter || 'none';
                
                // Draw image
                ctx.drawImage(tempImg, 0, 0);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create blob'));
                        return;
                    }
                    
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    
                    // Cleanup
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    
                    console.log('✅ Image downloaded:', filename);
                    resolve(blob);
                }, 'image/png');
            };
            
            tempImg.onerror = (e) => {
                console.error('❌ Failed to load image for export:', e);
                reject(new Error('Failed to load image for export'));
            };
            
            tempImg.src = this.originalImage;
        });
    },
    
    /**
     * Get image as base64 data URL
     */
    async getImageAsDataUrl(imageElement, format = 'image/png') {
        if (!this.originalImage) {
            throw new Error('No image loaded');
        }
        
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            
            tempImg.onload = () => {
                canvas.width = tempImg.naturalWidth;
                canvas.height = tempImg.naturalHeight;
                ctx.filter = imageElement.style.filter || 'none';
                ctx.drawImage(tempImg, 0, 0);
                
                const dataUrl = canvas.toDataURL(format);
                resolve(dataUrl);
            };
            
            tempImg.onerror = reject;
            tempImg.src = this.originalImage;
        });
    },
    
    /**
     * Get current filter values from an image element
     */
    getCurrentFilters(imageElement) {
        const filterString = imageElement.style.filter || '';
        
        // Parse filter string (basic parsing)
        const filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            hue: 0,
            blur: 0,
            sepia: 0
        };
        
        // Extract values using regex
        const brightnessMatch = filterString.match(/brightness\((\d+)%?\)/);
        const contrastMatch = filterString.match(/contrast\((\d+)%?\)/);
        const saturateMatch = filterString.match(/saturate\((\d+)%?\)/);
        const hueMatch = filterString.match(/hue-rotate\((-?\d+)deg\)/);
        const blurMatch = filterString.match(/blur\((\d+)px\)/);
        const sepiaMatch = filterString.match(/sepia\((\d+)%?\)/);
        
        if (brightnessMatch) filters.brightness = parseInt(brightnessMatch[1]);
        if (contrastMatch) filters.contrast = parseInt(contrastMatch[1]);
        if (saturateMatch) filters.saturate = parseInt(saturateMatch[1]);
        if (hueMatch) filters.hue = parseInt(hueMatch[1]);
        if (blurMatch) filters.blur = parseInt(blurMatch[1]);
        if (sepiaMatch) filters.sepia = parseInt(sepiaMatch[1]);
        
        return filters;
    }
};

// Export for debugging
console.log('✅ VibeLyfImageEditor loaded');
