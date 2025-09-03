// Paystack payment handler
const PaymentHandler = {
    // Debug mode
    debug: true,

    // Log debug messages
    log(message, data = null) {
        if (this.debug) {
            console.log(`[NPDV Payment] ${message}`, data || '');
        }
    },

    // Initialize payment
    init() {
        this.log('Initializing payment handler');
        
        try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        const plan = urlParams.get('plan');
        const price = parseFloat(urlParams.get('price')) || 0;
        const name = urlParams.get('name') || '';

            this.log('URL Parameters:', { service, plan, price, name });

        // Update order summary
        this.updateOrderSummary(service, plan, price, name);

        // Initialize form validation
        this.initializeFormValidation();

        // Initialize payment form
        this.initializePaymentForm(price);

        // Initialize help button
        this.initializeHelpButton();

        // Check if payment was successful
        this.checkPaymentStatus();

            // Add event listeners
            this.initializeEventListeners();

            // Initialize progress indicator
            this.initializeProgressIndicator();

            this.log('Payment handler initialized successfully');
        } catch (error) {
            this.log('Error during initialization:', error);
            this.showErrorModal('Initialization Error', 'Failed to initialize payment system. Please refresh the page.');
        }
    },

    // Initialize progress indicator
    initializeProgressIndicator() {
        // Set initial state
        this.updateProgress(0);
        
        // Add event listeners for form interactions
        const form = document.getElementById('payment-form');
        if (form) {
            form.addEventListener('input', () => {
                this.updateProgress(25);
            });

            form.addEventListener('submit', () => {
                this.updateProgress(50);
            });
        }
    },

    // Update progress indicator
    updateProgress(percentage) {
        const progressBar = document.getElementById('payment-progress');
        const progressPercentage = document.getElementById('progress-percentage');
        const paymentStatus = document.getElementById('payment-status');
        const progressLine1 = document.getElementById('progress-line-1');
        const progressLine2 = document.getElementById('progress-line-2');

        if (progressBar && progressPercentage) {
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;

            // Show/hide payment status
            if (percentage > 0) {
                paymentStatus.classList.remove('hidden');
            } else {
                paymentStatus.classList.add('hidden');
            }

            // Update progress lines
            if (percentage >= 33) {
                progressLine1.style.transform = 'scaleX(1)';
            }
            if (percentage >= 66) {
                progressLine2.style.transform = 'scaleX(1)';
            }

            // Update status text
            const statusText = document.querySelector('#payment-status p');
            if (statusText) {
                if (percentage < 25) {
                    statusText.textContent = 'Initializing payment...';
                } else if (percentage < 50) {
                    statusText.textContent = 'Processing your details...';
                } else if (percentage < 75) {
                    statusText.textContent = 'Connecting to payment gateway...';
                } else {
                    statusText.textContent = 'Completing transaction...';
                }
            }
        }
    },

    // Initialize event listeners
    initializeEventListeners() {
        // Retry button
        const retryButton = document.getElementById('retry-payment');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.log('Retry button clicked');
                const errorModal = document.getElementById('error-message');
                if (errorModal) {
                    errorModal.classList.add('hidden');
                }
                // Clear any stored error state
                localStorage.removeItem('paymentError');
            });
        }

        // Support button
        const supportButton = document.getElementById('contact-support');
        if (supportButton) {
            supportButton.addEventListener('click', () => {
                this.log('Support button clicked');
                this.showSupportModal();
            });
        }

        // Close support modal
        const closeSupport = document.getElementById('close-support');
        if (closeSupport) {
            closeSupport.addEventListener('click', () => {
                this.log('Closing support modal');
                this.hideSupportModal();
            });
        }
    },

    // Check payment status
    checkPaymentStatus() {
        this.log('Checking payment status');
        
        try {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const ref = urlParams.get('ref');
        const transactionId = urlParams.get('transaction');
            const error = urlParams.get('error');

            this.log('Payment parameters:', { status, ref, transactionId, error });

            // Check for stored error state
            const storedError = localStorage.getItem('paymentError');
            if (storedError) {
                this.log('Found stored error:', storedError);
                this.showErrorModal('Payment Error', storedError);
                localStorage.removeItem('paymentError');
                return;
            }

        if (status === 'success' && ref && transactionId) {
                this.log('Payment successful');
                this.handleSuccessfulPayment(ref, transactionId);
            } else if (status === 'failed' || error) {
                this.log('Payment failed');
                this.handleFailedPayment(error);
            } else {
                this.log('No payment status found');
            }
        } catch (error) {
            this.log('Error checking payment status:', error);
            this.showErrorModal('Status Check Error', 'Failed to check payment status. Please try again.');
        }
    },

    // Handle successful payment
    handleSuccessfulPayment(ref, transactionId) {
        try {
            // Update progress to 100%
            this.updateProgress(100);

            const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails') || '{}');
            
            this.log('Payment details:', paymentDetails);

            if (!paymentDetails.firstName || !paymentDetails.lastName) {
                throw new Error('Missing payment details');
            }

            // Generate receipt
            this.generateReceipt({
                reference: ref,
                transactionId: transactionId,
                firstName: paymentDetails.firstName,
                lastName: paymentDetails.lastName,
                serviceName: paymentDetails.serviceName,
                amount: paymentDetails.amount,
                date: new Date(paymentDetails.date).toLocaleString(),
                status: 'Successful'
            });

            // Clear stored data
            localStorage.removeItem('paymentDetails');

            // Show success message
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.classList.remove('hidden');
                this.log('Success modal shown');
            } else {
                throw new Error('Success modal element not found');
            }
        } catch (error) {
            this.log('Error handling successful payment:', error);
            this.showErrorModal('Receipt Error', 'Payment successful but failed to generate receipt. Please contact support.');
        }
    },

    // Handle failed payment
    handleFailedPayment(error) {
        const errorMessage = document.getElementById('error-message');
        const errorDetails = document.getElementById('error-details');
        const errorTitle = document.getElementById('error-title');
        
        if (!errorMessage || !errorDetails || !errorTitle) {
            this.log('Error modal elements not found');
            return;
        }

        const errorMessages = {
            'insufficient_funds': 'Insufficient funds in your account. Please try another payment method.',
            'card_declined': 'Your card was declined. Please check your card details or try another card.',
            'expired_card': 'Your card has expired. Please use a different card.',
            'invalid_card': 'The card details provided are invalid. Please check and try again.',
            'processing_error': 'There was an error processing your payment. Please try again.',
            'network_error': 'Network error occurred. Please check your internet connection and try again.',
            'timeout': 'Payment timed out. Please try again.',
            'default': 'Payment failed. Please try again or contact support.'
        };

        const errorCode = error || 'default';
        const message = errorMessages[errorCode] || errorMessages.default;
        
        this.log('Payment failed with error:', { errorCode, message });
        
        errorTitle.textContent = 'Payment Failed';
        errorDetails.textContent = message;
        errorMessage.classList.remove('hidden');
    },

    // Show error modal
    showErrorModal(title, message) {
        this.log('Showing error modal:', { title, message });
        
        const errorMessage = document.getElementById('error-message');
        const errorTitle = document.getElementById('error-title');
        const errorDetails = document.getElementById('error-details');
        
        if (!errorMessage || !errorTitle || !errorDetails) {
            this.log('Error modal elements not found');
            return;
        }

        errorTitle.textContent = title;
        errorDetails.textContent = message;
        errorMessage.classList.remove('hidden');
    },

    // Show support modal
    showSupportModal() {
        this.log('Showing support modal');
        const supportModal = document.getElementById('support-modal');
        if (supportModal) {
            supportModal.classList.remove('hidden');
        }
    },

    // Hide support modal
    hideSupportModal() {
        this.log('Hiding support modal');
        const supportModal = document.getElementById('support-modal');
        if (supportModal) {
            supportModal.classList.add('hidden');
        }
    },

    // Update order summary
    updateOrderSummary(service, plan, price, name) {
        // Format service name
        const formattedService = name || this.formatServiceName(service);
        document.getElementById('service-name').textContent = formattedService || 'Not specified';
        
        // Format plan name
        const formattedPlan = this.formatPlanName(plan);
        document.getElementById('plan-name').textContent = formattedPlan || 'Not specified';
        
        // Format price
        document.getElementById('price-amount').textContent = `₦${price.toLocaleString()}`;
        
        // Calculate and format tax
        const tax = price * 0.075;
        document.getElementById('tax-amount').textContent = `₦${tax.toLocaleString()}`;
        
        // Calculate and format total
        const total = price + tax;
        document.getElementById('total-amount').textContent = `₦${total.toLocaleString()}`;
    },

    // Format service name
    formatServiceName(service) {
        if (!service) return '';
        return service
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },

    // Format plan name
    formatPlanName(plan) {
        if (!plan) return '';
        return plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan';
    },

    // Initialize form validation
    initializeFormValidation() {
        const inputs = {
            'first-name': {
                validate: (value) => {
                    if (!value) return 'First name is required';
                    if (value.length < 2) return 'First name must be at least 2 characters';
                    if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces';
                    return '';
                }
            },
            'last-name': {
                validate: (value) => {
                    if (!value) return 'Last name is required';
                    if (value.length < 2) return 'Last name must be at least 2 characters';
                    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces';
                    return '';
                }
            }
        };

        // Add real-time validation
        Object.entries(inputs).forEach(([id, { validate }]) => {
            const input = document.getElementById(id);
            const errorElement = document.getElementById(`${id}-error`);

            input.addEventListener('input', () => {
                const error = validate(input.value);
                this.showError(input, errorElement, error);
            });

            input.addEventListener('blur', () => {
                const error = validate(input.value);
                this.showError(input, errorElement, error);
            });
        });

        // Terms checkbox validation
        const terms = document.getElementById('terms');
        const termsError = document.getElementById('terms-error');

        terms.addEventListener('change', () => {
            const error = terms.checked ? '' : 'You must agree to the terms and conditions';
            this.showError(terms, termsError, error);
        });
    },

    // Show error message
    showError(input, errorElement, error) {
        errorElement.textContent = error;
        errorElement.classList.toggle('hidden', !error);
        input.classList.toggle('border-red-500', !!error);
        input.classList.toggle('focus:ring-red-500', !!error);
        input.classList.toggle('focus:ring-primary-orange', !error);
    },

    // Initialize payment form
    initializePaymentForm(amount) {
        const form = document.getElementById('payment-form');
        const loadingOverlay = document.getElementById('loading-overlay');

        if (!form) {
            console.error('Payment form not found');
            return;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate all fields
            const errors = this.validateForm();
            if (errors.length > 0) {
                // Show error modal with validation errors
                this.showErrorModal('Form Validation Error', errors.join('\n'));
                // Scroll to first error
                const firstError = document.querySelector('.border-red-500');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Show loading overlay
            if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            }

            try {
                // Get customer details
                const firstName = document.getElementById('first-name').value;
                const lastName = document.getElementById('last-name').value;
                const totalAmount = amount + (amount * 0.075); // Price + VAT

                // Store payment details for receipt generation
                localStorage.setItem('paymentDetails', JSON.stringify({
                    firstName,
                    lastName,
                    serviceName: document.getElementById('service-name').textContent,
                    amount: totalAmount,
                    date: new Date().toISOString()
                }));

                // Create Paystack payment link with demo checkout
                const paystackLink = `https://paystack.com/demo/checkout?amount=${Math.round(totalAmount * 100)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&ref=NPDV-${Math.floor((Math.random() * 1000000000) + 1)}&service=${encodeURIComponent(document.getElementById('service-name').textContent)}`;

                console.log('Redirecting to Paystack:', paystackLink); // Debug log

                // Redirect to Paystack demo checkout
                window.location.href = paystackLink;
            } catch (error) {
                // Show error message
                if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
                }
                this.showErrorModal('Payment Error', error.message);
                console.error('Payment error:', error); // Debug log
            }
        });
    },

    // Validate entire form
    validateForm() {
        const errors = [];
        const inputs = ['first-name', 'last-name'];
        const terms = document.getElementById('terms');

        inputs.forEach(id => {
            const input = document.getElementById(id);
            const errorElement = document.getElementById(`${id}-error`);
            const error = this.validateField(input);
            this.showError(input, errorElement, error);
            if (error) errors.push(error);
        });

        if (!terms.checked) {
            const termsError = document.getElementById('terms-error');
            this.showError(terms, termsError, 'You must agree to the terms and conditions');
            errors.push('Terms and conditions must be accepted');
        }

        return errors;
    },

    // Validate single field
    validateField(input) {
        const validations = {
            'first-name': (value) => {
                if (!value) return 'First name is required';
                if (value.length < 2) return 'First name must be at least 2 characters';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'First name can only contain letters and spaces';
                return '';
            },
            'last-name': (value) => {
                if (!value) return 'Last name is required';
                if (value.length < 2) return 'Last name must be at least 2 characters';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last name can only contain letters and spaces';
                return '';
            }
        };

        return validations[input.id] ? validations[input.id](input.value) : '';
    },

    // Generate receipt
    generateReceipt(data) {
        const receiptContent = `
            NPDV - Payment Receipt
            =====================
            
            Transaction Details:
            -------------------
            Reference: ${data.reference}
            Transaction ID: ${data.transactionId}
            Date: ${data.date}
            Status: ${data.status}
            
            Customer Details:
            ----------------
            Name: ${data.firstName} ${data.lastName}
            
            Service Details:
            ---------------
            Service: ${data.serviceName}
            Amount: ₦${parseFloat(data.amount).toLocaleString()}
            
            Thank you for your payment!
            ===========================
            
            For any inquiries, please contact:
            Email: support@npdv.com
            Phone: +234 123 456 7890
        `;

        // Create and download receipt file
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NPDV_Receipt_${data.reference}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    // Initialize help button
    initializeHelpButton() {
        const helpButton = document.getElementById('help-button');
        const helpModal = document.getElementById('help-modal');
        const closeHelp = document.getElementById('close-help');

        if (!helpButton || !helpModal || !closeHelp) {
            console.error('Help button elements not found');
            return;
        }

        // Function to show modal
        const showModal = () => {
            helpModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            helpButton.classList.add('scale-95');
            setTimeout(() => helpButton.classList.remove('scale-95'), 200);
        };

        // Function to hide modal
        const hideModal = () => {
            helpModal.style.display = 'none';
            document.body.style.overflow = '';
        };

        // Show modal when help button is clicked
        helpButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showModal();
        });

        // Hide modal when close button is clicked
        closeHelp.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideModal();
        });

        // Hide modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                hideModal();
            }
        });

        // Hide modal when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && helpModal.style.display === 'block') {
                hideModal();
            }
        });

        // Prevent modal from closing when clicking inside the modal content
        const modalContent = helpModal.querySelector('.bg-white');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
};

// Initialize payment handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PaymentHandler.init();
}); 