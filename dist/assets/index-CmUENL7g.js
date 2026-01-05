(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const l of t.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}})();const r=document.querySelector("#app"),d=()=>{r.innerHTML=`
        <div class="flex h-full w-full">
            <!-- Sidebar -->
            <aside class="w-64 h-full glass z-20 hidden md:flex flex-col p-6">
                <div class="mb-10 flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></div>
                   <h1 class="font-bold text-xl text-slate-700">Contador</h1>
                </div>
                
                <nav class="flex-1 flex flex-col gap-4">
                    <a href="#" class="neumorphic-btn text-center">Dashboard</a>
                    <a href="#" class="neumorphic-btn text-center text-slate-500 shadow-none hover:shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] bg-transparent">Clientes</a>
                    <a href="#" class="neumorphic-btn text-center text-slate-500 shadow-none hover:shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] bg-transparent">Documentos</a>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="flex-1 h-full overflow-y-auto p-8 relative">
                <!-- Background blobs for glassmorphism effect -->
                <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300/30 rounded-full blur-3xl -z-10"></div>
                <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl -z-10"></div>

                <header class="flex justify-between items-center mb-10">
                    <h2 class="text-2xl font-bold text-slate-700">Dashboard</h2>
                    <div class="flex items-center gap-4">
                        <button class="neumorphic-btn !p-3 rounded-full">🔔</button>
                        <div class="w-10 h-10 rounded-full neumorphic flex items-center justify-center font-bold text-slate-600">JD</div>
                    </div>
                </header>

                <!-- Cards Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div class="glass-card p-6">
                        <h3 class="text-slate-500 text-sm font-medium mb-2">Clientes Ativos</h3>
                        <p class="text-3xl font-bold text-slate-700">124</p>
                    </div>
                    <div class="glass-card p-6">
                        <h3 class="text-slate-500 text-sm font-medium mb-2">Tarefas Pendentes</h3>
                        <p class="text-3xl font-bold text-slate-700 text-orange-500">12</p>
                    </div>
                     <div class="glass-card p-6">
                        <h3 class="text-slate-500 text-sm font-medium mb-2">Receita Mensal</h3>
                        <p class="text-3xl font-bold text-slate-700 text-green-500">R$ 45.2k</p>
                    </div>
                </div>

                <!-- Recent Activity / Content -->
                <div class="glass-card p-6 w-full">
                    <h3 class="text-lg font-bold text-slate-700 mb-4">Atividade Recente</h3>
                    <div class="space-y-3">
                         <div class="p-3 rounded-lg hover:bg-white/40 transition flex items-center justify-between border-b border-slate-100">
                            <div>
                                <p class="font-medium text-slate-700">Empresa XYZ enviou documentos</p>
                                <p class="text-xs text-slate-500">Há 2 horas</p>
                            </div>
                            <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">Novo</span>
                         </div>
                         <div class="p-3 rounded-lg hover:bg-white/40 transition flex items-center justify-between border-b border-slate-100">
                            <div>
                                <p class="font-medium text-slate-700">Imposto de Renda - João Silva</p>
                                <p class="text-xs text-slate-500">Há 5 horas</p>
                            </div>
                            <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">Concluído</span>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    `};d();
