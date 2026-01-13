import { QuartzTransformerPlugin } from "../types"
import { Root } from "hast"
import { visit } from "unist-util-visit"

export const ClickableImages: QuartzTransformerPlugin = () => {

  return {
    name: "ClickableImages",
    htmlPlugins() {
      return [
        () => {
          return (tree: Root, _file) => {
            visit(tree, "element", (node: any, index, parent) => {
              if (node.tagName === "img" && parent && index !== undefined) {
                // Get the current img src which should already be resolved
                const originalSrc = node.properties?.src
                const originalAlt = node.properties?.alt || ""
                
                if (!originalSrc) return

                // Add lightbox classes and data attributes to the img
                node.properties.className = (node.properties.className || []).concat(["lightbox-image"])
                node.properties["data-src"] = originalSrc
                node.properties["data-alt"] = originalAlt
                node.properties.loading = "lazy"

                // Create a wrapper div
                const wrapper = {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["lightbox-wrapper"],
                    "data-lightbox": "true"
                  },
                  children: [node]
                }

                // Replace the img with the wrapper in the parent
                parent.children[index] = wrapper
              }
            })
          }
        },
      ]
    },
    externalResources() {
      return {
        css: [
          {
            inline: true,
            content: `
/* Lightbox Image Styles */
.lightbox-wrapper {
  display: inline-block;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin: 0;
}

.lightbox-wrapper:hover {
  transform: scale(1.02);
}

.lightbox-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.lightbox-image:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Modal/Lightbox Overlay */
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(5px);
}

.lightbox-modal.active {
  opacity: 1;
  visibility: visible;
}

.lightbox-modal img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.lightbox-modal.active img {
  transform: scale(1);
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.lightbox-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Prevent body scroll when modal is open */
body.lightbox-open {
  overflow: hidden;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .lightbox-modal img {
    max-width: 95%;
    max-height: 95%;
  }

  .lightbox-close {
    top: 10px;
    right: 15px;
    font-size: 1.5rem;
    width: 35px;
    height: 35px;
  }
}
            `,
          },
        ],
        js: [
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            script: `
              // Lightbox functionality
              (function() {
                let modal = null;
                let modalImg = null;
                let closeBtn = null;
                let isInitialized = false;
                let clickHandler = null;
                let keyHandler = null;

                function createModal() {
                  // Remove existing modal if it exists
                  const existingModal = document.querySelector('.lightbox-modal');
                  if (existingModal) {
                    existingModal.remove();
                  }

                  // Create modal elements
                  modal = document.createElement('div');
                  modal.className = 'lightbox-modal';
                  
                  closeBtn = document.createElement('button');
                  closeBtn.className = 'lightbox-close';
                  closeBtn.innerHTML = '×';
                  closeBtn.setAttribute('aria-label', 'Close lightbox');
                  
                  modalImg = document.createElement('img');
                  modalImg.style.display = 'none';
                  
                  modal.appendChild(closeBtn);
                  modal.appendChild(modalImg);
                  document.body.appendChild(modal);

                  return { modal, modalImg, closeBtn };
                }

                // Function to open lightbox
                function openLightbox(imageSrc, imageAlt, originalImg) {
                  if (!modal || !modalImg) return;

                  modalImg.src = imageSrc;
                  modalImg.alt = imageAlt || '';
                  modalImg.style.display = 'block';
                  modal.classList.add('active');
                  document.body.classList.add('lightbox-open');
                  
                  // Preload the image and set appropriate size
                  const preloadImg = new Image();
                  preloadImg.onload = () => {
                    // Get original image size on page
                    const originalRect = originalImg ? originalImg.getBoundingClientRect() : null;
                    const originalDisplayWidth = originalRect ? originalRect.width : 0;
                    const originalDisplayHeight = originalRect ? originalRect.height : 0;
                    
                    // Smart scaling based on image size
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const imageWidth = preloadImg.naturalWidth;
                    const imageHeight = preloadImg.naturalHeight;
                    
                    // Calculate appropriate display size
                    let targetWidth;
                    
                    // Ensure lightbox image is at least 1.5x the size it appears on page
                    const minDisplayWidth = Math.max(
                      originalDisplayWidth * 1.5,
                      Math.min(500, viewportWidth * 0.7)
                    );
                    const minDisplayHeight = Math.max(
                      originalDisplayHeight * 1.5,
                      Math.min(400, viewportHeight * 0.7)
                    );
                    
                    // Calculate scale to meet minimum size requirements
                    const scaleForWidth = minDisplayWidth / imageWidth;
                    const scaleForHeight = minDisplayHeight / imageHeight;
                    const minScale = Math.max(scaleForWidth, scaleForHeight, 1);
                    
                    // Limit maximum scale to prevent pixelation
                    const maxScale = Math.min(3, viewportWidth * 0.9 / imageWidth, viewportHeight * 0.9 / imageHeight);
                    const finalScale = Math.min(minScale, maxScale);
                    
                    targetWidth = Math.min(imageWidth * finalScale, viewportWidth * 0.9);
                    
                    modalImg.style.width = targetWidth + 'px';
                    modalImg.style.height = 'auto';
                  };
                  preloadImg.src = imageSrc;
                }

                // Function to close lightbox
                function closeLightbox() {
                  if (!modal || !modalImg) return;
                  
                  modal.classList.remove('active');
                  document.body.classList.remove('lightbox-open');
                  setTimeout(() => {
                    modalImg.style.display = 'none';
                    modalImg.src = '';
                  }, 300);
                }

                function initLightbox() {
                  // Prevent multiple initializations
                  if (isInitialized) {
                    return;
                  }

                  // Create modal
                  const elements = createModal();
                  modal = elements.modal;
                  modalImg = elements.modalImg;
                  closeBtn = elements.closeBtn;

                  // Close button event
                  closeBtn.addEventListener('click', closeLightbox);
                  
                  // Click outside to close
                  modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                      closeLightbox();
                    }
                  });

                  // Keyboard support (Escape key)
                  keyHandler = (e) => {
                    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                      closeLightbox();
                    }
                  };
                  document.addEventListener('keydown', keyHandler);

                  // Event delegation for image clicks
                  clickHandler = (e) => {
                    const wrapper = e.target.closest('.lightbox-wrapper');
                    if (wrapper) {
                      e.preventDefault();
                      const img = wrapper.querySelector('.lightbox-image');
                      if (img) {
                        const src = img.getAttribute('data-src') || img.src;
                        const alt = img.getAttribute('data-alt') || img.alt;
                        openLightbox(src, alt, img);
                      }
                    }
                  };
                  document.addEventListener('click', clickHandler);

                  isInitialized = true;

                  // Clean up function
                  if (window.addCleanup) {
                    window.addCleanup(() => {
                      if (modal && modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                      }
                      document.body.classList.remove('lightbox-open');
                      
                      // Remove event listeners
                      if (clickHandler) {
                        document.removeEventListener('click', clickHandler);
                      }
                      if (keyHandler) {
                        document.removeEventListener('keydown', keyHandler);
                      }
                      
                      isInitialized = false;
                      modal = null;
                      modalImg = null;
                      closeBtn = null;
                    });
                  }
                }

                // Initialize on page load and navigation
                document.addEventListener('nav', initLightbox);
                
                // Initialize immediately if DOM is already ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initLightbox);
                } else {
                  initLightbox();
                }
              })();
            `,
          },
        ],
      }
    },
  }
}