import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { Dashboard } from './components/Dashboard.js';
import { Clients } from './components/Clients.js';
import { Documents } from './components/Documents.js';
import { Tasks } from './components/Tasks.js';

const routes = {
    '/': { title: 'Visão Geral', component: Dashboard },
    '/clients': { title: 'Gestão de Clientes', component: Clients },
    '/documents': { title: 'Gestão Fiscal', component: Documents },
    '/tasks': { title: 'Prazos e Vencimentos', component: Tasks },
};

export const initRouter = (appElement) => {
    const render = async () => {
        const hash = window.location.hash.slice(1) || '/';
        const route = routes[hash] || routes['/'];

        // --- 1. Render Loading State (Basic Skeleton) ---
        appElement.innerHTML = `
            <div class="flex h-screen overflow-hidden bg-slate-950">
                ${Sidebar()}
                <main class="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-950">
                    ${Header(route.title)}
                    <div class="flex-1 p-10 flex items-center justify-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                </main>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        // --- 2. Fetch Data & Render Component ---
        try {
            // Check if component is async (all of ours now potentially fetch data)
            // But strict async function check might be tricky if transpiled. 
            // We just await it. If it returns a string immediately, await wraps it.
            const componentHTML = await route.component();

            appElement.innerHTML = `
                <div class="flex h-screen overflow-hidden bg-slate-950">
                    ${Sidebar()}
                    
                    <!-- Main Content -->
                    <main class="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-950">
                        ${Header(route.title)}
                        
                        <!-- Scrollable Content -->
                        <div class="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth fade-in">
                            ${componentHTML}
                        </div>
                    </main>
                    
                    <div id="sidebar-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 hidden lg:hidden" onclick="document.dispatchEvent(new Event('toggle-sidebar'))"></div>
                </div>
            `;

            // Re-Initialize Icons logic
            if (window.lucide) window.lucide.createIcons();

            // Re-attach sidebar toggle logic
            document.removeEventListener('toggle-sidebar', toggleHandler); // Cleanup old listener if any to avoid dups? 
            document.addEventListener('toggle-sidebar', toggleHandler);

        } catch (error) {
            console.error("Render error:", error);
            appElement.innerHTML += `<div class="p-10 text-red-500">Error loading page content. check console.</div>`;
        }
    };

    const toggleHandler = () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-y-0');
            sidebar.classList.toggle('left-0');
            sidebar.classList.toggle('flex');
            overlay.classList.toggle('hidden');
        }
    };

    window.addEventListener('hashchange', render);
    render();
}
