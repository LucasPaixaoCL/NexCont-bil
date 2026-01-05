
// Custom Dropdown Logic with Event Delegation & Portal Strategy
export const initDropdowns = () => {
    let activeDropdown = null; // { trigger, options, originalParent, container, timeoutId }

    const closeActive = () => {
        if (activeDropdown) {
            const { options, originalParent, trigger, timeoutId } = activeDropdown;

            // Clear any pending open timeouts
            if (timeoutId) clearTimeout(timeoutId);

            // Start Exit Animation
            options.classList.remove('opacity-100', 'scale-100');
            options.classList.add('opacity-0', 'scale-95');

            // Wait for animation to finish before hiding/moving
            // Duration matches CSS (150ms)
            setTimeout(() => {
                // Check if it's still the active dropdown (user might have clicked again fast)
                // Actually, if we are closing, we are done with this instance.

                // Only clean up if strictly hidden (avoid race conditions if reopened? handled by new click)
                options.classList.add('hidden');

                // Return to DOM hierarchy
                if (options.parentElement === document.body && originalParent) {
                    originalParent.appendChild(options);
                }

                options.style.position = '';
                options.style.top = '';
                options.style.left = '';
                options.style.bottom = '';
                options.style.width = '';
                options.style.zIndex = '';

                if (trigger) trigger.classList.remove('border-blue-500');
            }, 150); // Match duration

            activeDropdown = null;
        }
    };

    // Close on any scroll or resize to prevent detachment
    window.addEventListener('resize', closeActive);
    window.addEventListener('scroll', closeActive, true);

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.select-trigger');

        // --- OPEN DROPDOWN ---
        if (trigger) {
            const container = trigger.closest('.custom-select');

            // If clicking the ALREADY ACTIVE trigger, close it
            if (activeDropdown && activeDropdown.trigger === trigger) {
                closeActive();
                return;
            }

            closeActive(); // Close any other open dropdown

            const options = container.querySelector('.select-options');
            if (!options) return;

            const originalParent = container;

            // 1. Portal: Move to body to escape overflow:hidden
            document.body.appendChild(options);

            // 2. Calculate Position
            const rect = trigger.getBoundingClientRect();

            options.style.position = 'fixed';
            options.style.left = `${rect.left}px`;
            options.style.width = `${rect.width}px`;
            options.style.zIndex = '99999';

            // Origin for animation
            let transformOrigin = 'top center';

            // Smart Vertical Positioning
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 250 && rect.top > 250) {
                // Flip Up
                options.style.bottom = `${window.innerHeight - rect.top + 4}px`;
                options.style.top = 'auto';
                transformOrigin = 'bottom center';
            } else {
                // Default Down
                options.style.top = `${rect.bottom + 4}px`;
                options.style.bottom = 'auto';
                transformOrigin = 'top center';
            }
            options.style.transformOrigin = transformOrigin;

            // 3. Setup Initial State for Animation
            options.classList.remove('hidden');
            // Ensure initial state is applied immediately before frame
            options.classList.add('opacity-0', 'scale-95');
            options.classList.remove('opacity-100', 'scale-100');

            trigger.classList.add('border-blue-500');

            // 4. Trigger Enter Animation via RAF
            requestAnimationFrame(() => {
                options.classList.remove('opacity-0', 'scale-95');
                options.classList.add('opacity-100', 'scale-100');
            });

            activeDropdown = { trigger, options, originalParent, container };
            return;
        }

        // --- CLICK OPTION ---
        const option = e.target.closest('.select-option');
        if (option && activeDropdown) {
            const { container, trigger, options } = activeDropdown;

            const hiddenInput = container.querySelector('input[type="hidden"]');
            const valueDisplay = trigger.querySelector('.select-value');
            const onChangeFn = container.dataset.onchange;

            const val = option.dataset.value;
            const label = option.textContent.trim();

            if (valueDisplay) valueDisplay.textContent = label;

            if (hiddenInput) {
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            options.querySelectorAll('.select-option').forEach(o => o.classList.remove('bg-white/5', 'text-white'));
            option.classList.add('bg-white/5', 'text-white');

            if (onChangeFn) {
                if (window) {
                    try {
                        const callStr = onChangeFn.replace(/this\.value/g, `'${val}'`);
                        window.eval(callStr);
                    } catch (err) {
                        console.error('Dropdown callback error:', err);
                    }
                }
            }

            closeActive();
            return;
        }

        // --- CLICK OUTSIDE ---
        if (activeDropdown && e.target.closest('.select-options')) {
            return;
        }
        if (activeDropdown) {
            closeActive();
        }
    });

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeDropdown) {
            closeActive();
        }
    });
};

// Helper HTML Generator
export const renderDropdownHtml = (name, value, options, onChange = '', placeholder = 'Selecione...', classes = '') => {
    const selected = options.find(o => String(o.value) === String(value));
    const currentLabel = selected ? selected.label : placeholder;

    return `
        <div class="custom-select relative ${classes}" data-onchange="${onChange}">
            <input type="hidden" name="${name}" value="${value || ''}">
            <div class="select-trigger input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 cursor-pointer flex justify-between items-center transition-colors">
                <span class="truncate select-value text-sm">${currentLabel}</span>
                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500"></i>
            </div>
            <!-- Options: Initial state hidden with transition classes -->
            <div class="select-options hidden absolute z-50 w-full mt-1 bg-slate-900 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto ring-1 ring-white/5 transform transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-top will-change-transform opacity-0 scale-95">
                ${options.map(opt => `
                    <div class="select-option px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors ${String(opt.value) === String(value) ? 'bg-slate-800 text-white' : ''}" data-value="${opt.value}">
                        ${opt.label}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};
