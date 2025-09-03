// Help button handler
const HelpHandler = {
    // Initialize help button
    init() {
        const helpButton = document.getElementById('help-button');
        const helpModal = document.getElementById('help-modal');
        const closeHelp = document.getElementById('close-help');
        const helpSearch = document.getElementById('help-search');
        const faqQuestions = document.querySelectorAll('.faq-question');

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
            // Focus search input when modal opens
            helpSearch?.focus();
        };

        // Function to hide modal
        const hideModal = () => {
            helpModal.style.display = 'none';
            document.body.style.overflow = '';
            // Reset search input
            if (helpSearch) {
                helpSearch.value = '';
                this.handleSearch('');
            }
            // Close all FAQ answers
            document.querySelectorAll('.faq-answer').forEach(answer => {
                answer.classList.add('hidden');
            });
            document.querySelectorAll('.faq-question i').forEach(icon => {
                icon.classList.remove('rotate-180');
            });
        };

        // Handle search functionality
        this.handleSearch = (query) => {
            const searchQuery = query.toLowerCase();
            const topics = document.querySelectorAll('.help-topic');
            const faqItems = document.querySelectorAll('.faq-item');
            const quickLinks = document.querySelectorAll('.help-quick-link');

            // Search in topics
            topics.forEach(topic => {
                const title = topic.querySelector('h5').textContent.toLowerCase();
                const description = topic.querySelector('p').textContent.toLowerCase();
                const isVisible = title.includes(searchQuery) || description.includes(searchQuery);
                topic.style.display = isVisible ? 'block' : 'none';
            });

            // Search in FAQ items
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                const isVisible = question.includes(searchQuery) || answer.includes(searchQuery);
                item.style.display = isVisible ? 'block' : 'none';
            });

            // Search in quick links
            quickLinks.forEach(link => {
                const text = link.textContent.toLowerCase();
                link.style.display = text.includes(searchQuery) ? 'flex' : 'none';
            });
        };

        // Handle FAQ toggle
        const handleFAQToggle = (question) => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            // Close other answers
            document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.add('hidden');
                }
            });
            
            // Toggle current answer
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
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

        // Handle search input
        if (helpSearch) {
            helpSearch.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Handle FAQ questions
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                handleFAQToggle(question);
            });
        });

        // Handle quick links
        document.querySelectorAll('.help-quick-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    hideModal();
                    setTimeout(() => {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            });
        });
    }
};

// Initialize help handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    HelpHandler.init();
}); 