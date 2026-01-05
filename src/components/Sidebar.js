export const Sidebar = () => {
    const currentHash = window.location.hash || '#/';

    const isActive = (hash) => currentHash === hash ?
        'bg-white/5 text-white border-white/5' :
        'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent';

    const iconActive = (hash) => currentHash === hash ? 'text-white' : 'group-hover:scale-105 transition-transform';

    return `
    <aside id="sidebar" class="glass-panel w-20 lg:w-64 flex flex-col justify-between fixed lg:relative z-20 h-full hidden lg:flex transition-all duration-300">
        <div>
            <!-- Logo Minimalista -->
            <div class="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-white/5">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <i data-lucide="activity" class="text-slate-900 w-5 h-5"></i>
                </div>
                <span class="ml-3 text-lg font-medium tracking-wide hidden lg:block text-slate-100">NexContabil</span>
            </div>

            <!-- Menu Items -->
            <nav class="mt-8 px-4 space-y-1">
                <a href="#/" class="flex items-center px-4 py-3 rounded-lg border ${isActive('#/')} group transition-all">
                    <i data-lucide="layout-dashboard" class="w-4 h-4 ${iconActive('#/')}"></i>
                    <span class="ml-3 text-sm font-medium hidden lg:block">Visão Geral</span>
                </a>

                <a href="#/clients" class="flex items-center px-4 py-3 rounded-lg border ${isActive('#/clients')} group transition-all">
                    <i data-lucide="users" class="w-4 h-4 ${iconActive('#/clients')}"></i>
                    <span class="ml-3 text-sm font-medium hidden lg:block">Clientes</span>
                </a>

                <a href="#/documents" class="flex items-center px-4 py-3 rounded-lg border ${isActive('#/documents')} group transition-all">
                    <i data-lucide="file-text" class="w-4 h-4 ${iconActive('#/documents')}"></i>
                    <span class="ml-3 text-sm font-medium hidden lg:block">Fiscal</span>
                    <span class="ml-auto w-1.5 h-1.5 rounded-full bg-slate-400 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </a>

                <a href="#/tasks" class="flex items-center px-4 py-3 rounded-lg border ${isActive('#/tasks')} group transition-all">
                    <i data-lucide="calendar-clock" class="w-4 h-4 ${iconActive('#/tasks')}"></i>
                    <span class="ml-3 text-sm font-medium hidden lg:block">Prazos</span>
                </a>
            </nav>
        </div>

        <!-- User Profile (Minimal) -->
        <div class="p-4 mb-2">
            <div class="rounded-lg p-2 flex items-center justify-center lg:justify-start cursor-pointer hover:bg-white/5 transition border border-transparent hover:border-white/5">
                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">CM</div>
                <div class="ml-3 hidden lg:block">
                    <p class="text-sm font-medium text-slate-200">Carlos Mendes</p>
                    <p class="text-xs text-slate-500">Contador</p>
                </div>
            </div>
        </div>
    </aside>
  `;
}
