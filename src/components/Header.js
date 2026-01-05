export const Header = (title) => {
    return `
    <header class="glass-panel h-20 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 border-b border-white/5 lg:border-none bg-transparent lg:bg-transparent backdrop-blur-md">
        
        <div class="flex items-center">
            <button id="mobile-menu-btn" class="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-white/5 mr-4" onclick="document.dispatchEvent(new Event('toggle-sidebar'))">
                <i data-lucide="menu" class="w-5 h-5"></i>
            </button>
            <!-- Breadcrumb Minimalista -->
            <div class="hidden md:flex items-center text-sm text-slate-500">
                <span>Dashboard</span>
                <i data-lucide="chevron-right" class="w-4 h-4 mx-2 text-slate-700"></i>
                <span class="text-slate-200">${title}</span>
            </div>
            <span class="md:hidden text-lg font-medium text-white">${title}</span>
        </div>

        <div class="flex items-center gap-4">
            <!-- Search and Notify removed as per request -->
        </div>
    </header>
  `;
}
