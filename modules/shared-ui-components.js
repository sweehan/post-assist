// shared-ui-components.js
// Shared UI Components Module (ES6)

export class UIComponents {
    constructor(config = {}) {
        this.theme = config.theme || 'default';
        this.logContainer = config.logContainer || 'activity-logs';
        this.statusContainer = config.statusContainer || 'status';
        this.maxLogs = config.maxLogs || 100;
        this.statusTimeout = config.statusTimeout || 5000;
    }
    
    // Tab Management
    initializeTabs(tabClass = 'tab', contentClass = 'tab-content') {
        const tabs = document.querySelectorAll(`.${tabClass}`);
        const contents = document.querySelectorAll(`.${contentClass}`);
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab') || 
                               e.target.textContent.toLowerCase().replace(/\s+/g, '-');
                
                this.switchTab(tabName, tabClass, contentClass);
            });
        });
    }
    
    switchTab(tabName, tabClass = 'tab', contentClass = 'tab-content') {
        // Remove active from all tabs
        document.querySelectorAll(`.${tabClass}`).forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Hide all content
        document.querySelectorAll(`.${contentClass}`).forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Activate selected tab
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`) ||
                          Array.from(document.querySelectorAll(`.${tabClass}`))
                               .find(tab => tab.textContent.toLowerCase().replace(/\s+/g, '-') === tabName);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show selected content
        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedContent) {
            selectedContent.style.display = 'block';
            selectedContent.classList.add('active');
        }
    }
    
    // Status Messages
    showStatus(message, type = 'info', duration = null) {
        const statusEl = document.getElementById(this.statusContainer);
        if (!statusEl) {
            console.error(`Status container #${this.statusContainer} not found`);
            return;
        }
        
        // Clear any existing timeout
        if (this.statusTimeoutId) {
            clearTimeout(this.statusTimeoutId);
        }
        
        // Set status
        statusEl.className = `status ${type}`;
        statusEl.textContent = message;
        statusEl.style.display = 'block';
        
        // Auto-hide after timeout
        const timeout = duration || this.statusTimeout;
        if (timeout > 0) {
            this.statusTimeoutId = setTimeout(() => {
                statusEl.style.display = 'none';
            }, timeout);
        }
    }
    
    hideStatus() {
        const statusEl = document.getElementById(this.statusContainer);
        if (statusEl) {
            statusEl.style.display = 'none';
        }
        if (this.statusTimeoutId) {
            clearTimeout(this.statusTimeoutId);
        }
    }
    
    // Logging System
    addLog(message, type = 'info') {
        const logsContainer = document.getElementById(this.logContainer);
        if (!logsContainer) {
            console.error(`Log container #${this.logContainer} not found`);
            return;
        }
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        // Add to beginning
        logsContainer.insertBefore(entry, logsContainer.firstChild);
        
        // Limit number of logs
        while (logsContainer.children.length > this.maxLogs) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }
    
    clearLogs() {
        const logsContainer = document.getElementById(this.logContainer);
        if (logsContainer) {
            logsContainer.innerHTML = '';
            this.addLog('Logs cleared');
        }
    }
    
    // Credential Status Display
    updateCredentialStatus(statusId, isConfigured, configuredText = 'Configured', notConfiguredText = 'Not Configured') {
        const statusEl = document.getElementById(statusId);
        if (!statusEl) return;
        
        if (isConfigured) {
            statusEl.textContent = configuredText;
            statusEl.className = 'status-badge saved';
        } else {
            statusEl.textContent = notConfiguredText;
            statusEl.className = 'status-badge missing';
        }
    }
    
    // Token Expiry Display
    updateTokenExpiryDisplay(elementId, timeLeftMs) {
        const expiryEl = document.getElementById(elementId);
        if (!expiryEl) return;
        
        if (timeLeftMs > 0) {
            const minutes = Math.floor(timeLeftMs / 60000);
            expiryEl.textContent = `${minutes} min`;
            expiryEl.className = minutes > 10 ? 'status-badge saved' : 'status-badge missing';
        } else {
            expiryEl.textContent = 'Expired';
            expiryEl.className = 'status-badge missing';
        }
    }
    
    // Loading Spinner
    showLoading(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-spinner';
        loadingDiv.innerHTML = `
            <div class="spinner"></div>
            <p>${message}</p>
        `;
        loadingDiv.id = `${containerId}-loading`;
        
        container.appendChild(loadingDiv);
    }
    
    hideLoading(containerId) {
        const loadingEl = document.getElementById(`${containerId}-loading`);
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    // Modal/Dialog
    showModal(title, content, buttons = []) {
        // Remove any existing modal
        this.hideModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'shared-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `<h3>${title}</h3>`;
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = content;
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        // Add buttons
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = btn.class || '';
            button.onclick = () => {
                if (btn.onClick) btn.onClick();
                if (btn.closeModal !== false) this.hideModal();
            };
            modalFooter.appendChild(button);
        });
        
        // Default close button if no buttons provided
        if (buttons.length === 0) {
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.onclick = () => this.hideModal();
            modalFooter.appendChild(closeBtn);
        }
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }
    
    hideModal() {
        const modal = document.getElementById('shared-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    // Form Field Toggle
    toggleFormField(fieldId, show) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.display = show ? 'block' : 'none';
        }
    }
    
    // Copy to Clipboard
    async copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        try {
            await navigator.clipboard.writeText(text);
            this.showStatus(successMessage, 'success');
            return true;
        } catch (err) {
            this.showStatus('Failed to copy: ' + err.message, 'error');
            return false;
        }
    }
    
    // Download Data
    downloadData(data, filename, type = 'application/json') {
        const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], 
                            { type: type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Progress Bar
    createProgressBar(containerId, max = 100) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'progress-wrapper';
        progressWrapper.id = `${containerId}-progress`;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = '0%';
        
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';
        
        progressBar.appendChild(progressFill);
        progressWrapper.appendChild(progressBar);
        progressWrapper.appendChild(progressText);
        container.appendChild(progressWrapper);
        
        return {
            update: (value) => {
                const percentage = Math.min(100, Math.round((value / max) * 100));
                progressFill.style.width = percentage + '%';
                progressText.textContent = percentage + '%';
            },
            remove: () => {
                progressWrapper.remove();
            }
        };
    }
    
    // Confirmation Dialog
    async confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.showModal(title, message, [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onClick: () => resolve(false)
                },
                {
                    text: 'Confirm',
                    class: 'btn-primary',
                    onClick: () => resolve(true)
                }
            ]);
        });
    }
    
    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to toast container or create one
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    // Form Validation Helper
    validateForm(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return { valid: false, errors: ['Form not found'] };
        
        const errors = [];
        let valid = true;
        
        for (const [fieldName, fieldRules] of Object.entries(rules)) {
            const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (!field) {
                errors.push(`Field ${fieldName} not found`);
                continue;
            }
            
            const value = field.value.trim();
            
            // Required check
            if (fieldRules.required && !value) {
                errors.push(`${fieldRules.label || fieldName} is required`);
                valid = false;
                this.highlightField(field, false);
                continue;
            }
            
            // Pattern check
            if (fieldRules.pattern && value && !new RegExp(fieldRules.pattern).test(value)) {
                errors.push(`${fieldRules.label || fieldName} is invalid`);
                valid = false;
                this.highlightField(field, false);
                continue;
            }
            
            // Custom validation
            if (fieldRules.validate && !fieldRules.validate(value)) {
                errors.push(fieldRules.error || `${fieldRules.label || fieldName} is invalid`);
                valid = false;
                this.highlightField(field, false);
                continue;
            }
            
            this.highlightField(field, true);
        }
        
        return { valid, errors };
    }
    
    highlightField(field, valid) {
        if (valid) {
            field.classList.remove('field-error');
            field.classList.add('field-valid');
        } else {
            field.classList.remove('field-valid');
            field.classList.add('field-error');
        }
    }
    
    // Debounce Helper
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// CSS Styles for UI Components (inject into page)
export const injectUIStyles = () => {
    if (document.getElementById('shared-ui-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'shared-ui-styles';
    styles.textContent = `
        /* Loading Spinner */
        .loading-spinner {
            text-align: center;
            padding: 20px;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        .modal-header h3 {
            margin: 0;
        }
        .modal-body {
            padding: 20px;
        }
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        /* Progress Bar */
        .progress-wrapper {
            margin: 20px 0;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #4CAF50;
            transition: width 0.3s ease;
        }
        .progress-text {
            text-align: center;
            margin-top: 5px;
            font-size: 14px;
        }
        
        /* Toast Notifications */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 2000;
        }
        .toast {
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(0);
        }
        .toast-success { background: #4CAF50; }
        .toast-error { background: #f44336; }
        .toast-warning { background: #ff9800; }
        .toast-info { background: #2196F3; }
        
        /* Form Validation */
        .field-error {
            border-color: #f44336 !important;
        }
        .field-valid {
            border-color: #4CAF50 !important;
        }
    `;
    document.head.appendChild(styles);
};

// Auto-inject styles when module is loaded
if (typeof document !== 'undefined') {
    injectUIStyles();
}