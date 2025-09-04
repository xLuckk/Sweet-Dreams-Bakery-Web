
// Sweet Dreams Bakery JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize shopping cart
    let cart = [];
    let cartTotal = 0;

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(244, 114, 182, 0.2)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(244, 114, 182, 0.1)';
        }
    });

    // Animated counters
    const animateCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (target === 50000) {
                        counter.textContent = Math.ceil(current).toLocaleString() + '+';
                    } else if (target === 100) {
                        counter.textContent = Math.ceil(current) + '+';
                    } else {
                        counter.textContent = Math.ceil(current);
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    if (target === 50000) {
                        counter.textContent = target.toLocaleString() + '+';
                    } else if (target === 100) {
                        counter.textContent = target + '+';
                    } else {
                        counter.textContent = target;
                    }
                }
            };
            
            updateCounter();
        });
    };

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger counter animation for stats section
                if (entry.target.querySelector('[data-count]')) {
                    setTimeout(animateCounters, 500);
                }
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const elementsToAnimate = document.querySelectorAll('.product-card, .gallery-item, .stat-card');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Product filtering
    const filterButtons = document.querySelectorAll('.btn-filter');
    const productItems = document.querySelectorAll('.product-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            productItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.display = 'block';
                    }, 50);
                } else {
                    item.classList.add('hide');
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Shopping cart functionality
    const addToCartButtons = document.querySelectorAll('[data-product]');
    const cartSummary = document.getElementById('cartSummary');
    const cartItems = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            const price = parseFloat(this.getAttribute('data-price'));
            const name = this.closest('.card').querySelector('.card-title').textContent;
            
            // Add loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
            this.disabled = true;
            
            setTimeout(() => {
                addToCart(product, name, price);
                this.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 1000);
                
                showToast(`${name} added to cart!`, 'success');
            }, 500);
        });
    });

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        updateCartDisplay();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    }

    function updateCartDisplay() {
        if (cart.length === 0) {
            cartSummary.style.display = 'none';
            return;
        }
        
        cartSummary.style.display = 'block';
        
        cartItems.innerHTML = '';
        cartTotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            cartTotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>$${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
                <div>
                    <span class="me-3">$${itemTotal.toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        cartTotalElement.textContent = cartTotal.toFixed(2);
        
        // Scroll cart into view
        cartSummary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Make removeFromCart globally available
    window.removeFromCart = removeFromCart;

    // Order form handling
    const orderTypeSelect = document.getElementById('orderType');
    const deliveryAddressGroup = document.getElementById('deliveryAddressGroup');
    const deliveryAddress = document.getElementById('deliveryAddress');

    if (orderTypeSelect) {
        orderTypeSelect.addEventListener('change', function() {
            if (this.value === 'delivery') {
                deliveryAddressGroup.style.display = 'block';
                deliveryAddress.required = true;
            } else {
                deliveryAddressGroup.style.display = 'none';
                deliveryAddress.required = false;
            }
        });
    }

    // Set minimum date for order form
    const orderDateInput = document.getElementById('orderDate');
    if (orderDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        orderDateInput.min = tomorrow.toISOString().split('T')[0];
    }

    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                showToast('Please add items to your cart first!', 'error');
                return;
            }
            
            const data = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value,
                orderType: document.getElementById('orderType').value,
                date: document.getElementById('orderDate').value,
                time: document.getElementById('orderTime').value,
                address: document.getElementById('deliveryAddress').value,
                instructions: document.getElementById('specialInstructions').value,
                items: cart,
                total: cartTotal
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing Order...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                const deliveryFee = data.orderType === 'delivery' ? 5.00 : 0;
                const finalTotal = cartTotal + deliveryFee;
                
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success mt-3';
                successAlert.innerHTML = `
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Order Placed Successfully! 🎉</strong><br>
                    Thank you ${data.name}! Your sweet order has been placed.<br>
                    <small class="mt-2 d-block">
                        <strong>Order Details:</strong><br>
                        • ${data.orderType === 'pickup' ? 'Pickup' : 'Delivery'} on ${formatDate(data.date)} at ${data.time}<br>
                        ${data.orderType === 'delivery' ? `• Delivery to: ${data.address}<br>• Delivery fee: $5.00<br>` : ''}
                        • Items: ${cart.length} item(s)<br>
                        • Total: $${finalTotal.toFixed(2)}<br>
                        We'll contact you at ${data.phone} to confirm your order within 30 minutes.
                    </small>
                `;
                
                this.parentNode.insertBefore(successAlert, this.nextSibling);
                
                // Clear cart and reset form
                cart = [];
                updateCartDisplay();
                this.reset();
                deliveryAddressGroup.style.display = 'none';
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    successAlert.remove();
                }, 15000);
                
                successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            }, 2000);
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                inquiryType: document.getElementById('inquiryType').value,
                eventDate: document.getElementById('eventDate').value,
                message: document.getElementById('contactMessage').value
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success mt-3';
                successAlert.innerHTML = `
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Sweet Message Sent! 💕</strong><br>
                    Thank you ${data.name}! We've received your ${getInquiryTypeName(data.inquiryType).toLowerCase()} inquiry.
                    ${data.eventDate ? `<br>Event date noted: ${formatDate(data.eventDate)}` : ''}
                    <br><small class="mt-2 d-block">Our team will respond to you at ${data.email} within 24 hours with all the sweet details!</small>
                `;
                
                this.parentNode.insertBefore(successAlert, this.nextSibling);
                
                this.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                setTimeout(() => {
                    successAlert.remove();
                }, 12000);
                
                successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            }, 1500);
        });
    }

    // Gallery lightbox effect
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const content = this.querySelector('.gallery-content');
            const title = content.querySelector('h5').textContent;
            const description = content.querySelector('p').textContent;
            
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0">
                            <img src="${img.src}" alt="${img.alt}" class="img-fluid w-100">
                            <div class="p-3">
                                <p class="mb-0 text-muted">${description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            modal.addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modal);
            });
        });
    });

    // Toast notification system
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast custom-toast align-items-center border-0 show`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        // Create container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Utility functions
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function getInquiryTypeName(inquiryType) {
        const inquiryNames = {
            'custom-cake': 'Custom Cake Order',
            'catering': 'Event Catering',
            'wholesale': 'Wholesale Order',
            'general': 'General Question',
            'feedback': 'Feedback'
        };
        return inquiryNames[inquiryType] || inquiryType;
    }

    // Checkout button functionality
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showToast('Your cart is empty!', 'error');
                return;
            }
            
            document.querySelector('#order').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Add sparkle effect to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.classList.add('sparkle');
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.03)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Parallax effect for floating elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const floatingElements = document.querySelectorAll('.floating-donut, .floating-croissant, .floating-cupcake');
        
        floatingElements.forEach((element, index) => {
            const speed = 0.1 + (index * 0.05);
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

    // Mobile menu enhancement
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        const mobileLinks = navbarCollapse.querySelectorAll('.nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navbarCollapse.classList.contains('show')) {
                    bootstrap.Collapse.getInstance(navbarCollapse).hide();
                }
            });
        });
    }

    // Loading animation
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // Add scroll progress indicator
    const createScrollIndicator = () => {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, var(--pink), var(--yellow), var(--lavender));
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        document.body.appendChild(indicator);
        
        window.addEventListener('scroll', () => {
            const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            indicator.style.width = scrolled + '%';
        });
    };
    
    createScrollIndicator();

    // Initialize tooltips for badges
    const badges = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    badges.forEach(badge => {
        new bootstrap.Tooltip(badge);
    });

    console.log('Sweet Dreams Bakery website loaded successfully! 🎂✨');
});
