class CookieConsent {
    constructor() {
        this.cookieName = 'npdv_cookie_consent';
        this.cookieExpiryDays = 365;
        this.banner = null;
        this.init();
    }

    init() {
        if (!this.getCookie(this.cookieName)) {
            this.createBanner();
        }
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies to enhance your browsing experience and analyze our traffic. 
                   By clicking "Accept All", you consent to our use of cookies.</p>
                <div class="cookie-buttons">
                    <button class="accept-all">Accept All</button>
                    <button class="customize">Customize</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        this.banner = banner;

        // Add event listeners
        banner.querySelector('.accept-all').addEventListener('click', () => this.acceptAll());
        banner.querySelector('.customize').addEventListener('click', () => this.showCustomize());
    }

    acceptAll() {
        this.setCookie(this.cookieName, 'all', this.cookieExpiryDays);
        this.hideBanner();
    }

    showCustomize() {
        // Implement cookie customization modal
        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.innerHTML = `
            <div class="cookie-modal-content">
                <h3>Cookie Preferences</h3>
                <div class="cookie-options">
                    <label>
                        <input type="checkbox" checked disabled> Essential Cookies
                    </label>
                    <label>
                        <input type="checkbox" name="analytics"> Analytics Cookies
                    </label>
                    <label>
                        <input type="checkbox" name="marketing"> Marketing Cookies
                    </label>
                </div>
                <div class="cookie-modal-buttons">
                    <button class="save-preferences">Save Preferences</button>
                    <button class="close-modal">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.save-preferences').addEventListener('click', () => {
            const preferences = {
                analytics: modal.querySelector('input[name="analytics"]').checked,
                marketing: modal.querySelector('input[name="marketing"]').checked
            };
            this.setCookie(this.cookieName, JSON.stringify(preferences), this.cookieExpiryDays);
            this.hideBanner();
            modal.remove();
        });

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }

    hideBanner() {
        if (this.banner) {
            this.banner.remove();
            this.banner = null;
        }
    }

    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
}

// Initialize cookie consent when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CookieConsent();
}); 