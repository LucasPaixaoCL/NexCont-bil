import { openModal, NewEntryModalContent, UploadModalContent, NewReminderModalContent, EditTransactionModalContent } from './Modals.js';

export const Dashboard = async () => {
    window.openNewEntryModal = () => openModal('Novo Lançamento', NewEntryModalContent);
    window.openUploadModal = () => openModal('Enviar Documento', UploadModalContent);

    window.handleEntrySubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await fetch('http://localhost:3000/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            window.showToast('Lançamento salvo!', 'success');
            window.closeModal();
            window.location.reload();
        } catch (e) {
            console.error(e);
            window.showToast('Erro ao salvar lançamento', 'error');
        }
    };

    // Reminders
    window.openNewReminderModal = () => openModal('Novo Vencimento', NewReminderModalContent);
    window.handleReminderSubmit = async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        try {
            await fetch('http://localhost:3000/api/reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            window.location.reload();
        } catch (e) { window.showToast('Erro ao salvar', 'error'); }
    };
    window.deleteReminder = async (id) => {
        if (!confirm('Excluir?')) return;
        try { await fetch(`http://localhost:3000/api/reminders/${id}`, { method: 'DELETE' }); window.location.reload(); } catch (e) { }
    };

    // Edit Transaction
    window.openEditTransactionModal = (tJson) => {
        const t = JSON.parse(decodeURIComponent(tJson));
        openModal('Editar Lançamento', EditTransactionModalContent(t));
    };
    window.handleEditTransactionSubmit = async (e, id) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        try {
            await fetch(`http://localhost:3000/api/transactions/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            window.location.reload();
        } catch (e) { window.showToast('Erro ao editar', 'error'); }
    };

    let stats = { activeClients: 0, pendingTasks: 0, revenue: 0 };
    let transactions = [];
    let reminders = [];

    try {
        const [statsRes, transRes, remRes] = await Promise.all([
            fetch('http://localhost:3000/api/dashboard/stats'),
            fetch('http://localhost:3000/api/transactions'),
            fetch('http://localhost:3000/api/reminders')
        ]);

        if (statsRes.ok) stats = await statsRes.json();
        if (transRes.ok) transactions = await transRes.json();
        if (remRes.ok) reminders = await remRes.json();
    } catch (e) { console.error(e); }

    // Delete Transaction Logic
    window.deleteTransaction = async (id) => {
        if (!confirm('Excluir lançamento?')) return;
        try {
            await fetch(`http://localhost:3000/api/transactions/${id}`, { method: 'DELETE' });
            window.location.reload();
        } catch (e) { window.showToast('Erro ao excluir', 'error'); }
    };

    return `
        <!-- Welcome Section -->
        <div class="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
                <h2 class="text-2xl font-light text-white tracking-tight">Olá, <span class="font-medium">Carlos</span></h2>
                <p class="text-slate-500 text-sm mt-1 font-light">Resumo financeiro de segunda-feira.</p>
            </div>
            <!-- Botão Monocromático -->
            <button onclick="openNewEntryModal()" class="flex items-center gap-2 bg-white text-slate-900 px-5 py-2 rounded-lg hover:bg-slate-200 transition-all text-sm font-medium shadow-sm">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Novo Lançamento</span>
            </button>
        </div>

        <!-- Stats Grid (Clean) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <!-- Card 1 -->
            <div class="glass-card rounded-xl p-5">
                <div class="flex justify-between items-start mb-6">
                    <div class="p-2 bg-white/5 rounded-lg text-slate-300 border border-white/5">
                        <i data-lucide="users" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xs font-mono text-slate-400">+12%</span>
                </div>
                <h3 class="text-slate-500 text-xs font-medium uppercase tracking-wider">Clientes Ativos</h3>
                <p class="text-2xl font-light text-white mt-1">${stats.activeClients}</p>
            </div>

            <!-- Card 2 -->
            <div class="glass-card rounded-xl p-5">
                <div class="flex justify-between items-start mb-6">
                    <div class="p-2 bg-white/5 rounded-lg text-slate-300 border border-white/5">
                        <i data-lucide="alert-circle" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xs font-mono text-slate-400">Atenção</span>
                </div>
                <h3 class="text-slate-500 text-xs font-medium uppercase tracking-wider">Pendências</h3>
                <p class="text-2xl font-light text-white mt-1">${stats.pendingTasks}</p>
            </div>

            <!-- Card 3 -->
            <div class="glass-card rounded-xl p-5">
                <div class="flex justify-between items-start mb-6">
                    <div class="p-2 bg-white/5 rounded-lg text-slate-300 border border-white/5">
                        <i data-lucide="bar-chart-2" class="w-5 h-5"></i>
                    </div>
                    <span class="text-xs font-mono text-slate-400">+5.4%</span>
                </div>
                <h3 class="text-slate-500 text-xs font-medium uppercase tracking-wider">Faturamento</h3>
                <p class="text-2xl font-light text-white mt-1">R$ ${parseFloat(stats.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
        </div>

        <!-- Main Grid Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Table Section (Full & Editable) -->
            <div class="lg:col-span-2 rounded-xl border border-white/5 p-6 bg-slate-900/30 flex flex-col h-[500px]">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-medium text-white uppercase tracking-wider">Todas as Movimentações</h3>
                    <div class="text-xs text-slate-500 font-mono">Total: ${transactions.length}</div>
                </div>

                <div class="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="sticky top-0 bg-slate-900 z-10">
                            <tr class="text-slate-600 text-xs uppercase tracking-wider border-b border-white/5">
                                <th class="pb-3 pl-2 font-medium">Descrição</th>
                                <th class="pb-3 font-medium">Valor</th>
                                <th class="pb-3 text-right font-medium">Data</th>
                                <th class="pb-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-400">
                            ${transactions.map(t => `
                                <tr class="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                                    <td class="py-3 pl-2 text-slate-300 font-medium">${t.description}</td>
                                    <td class="py-3 font-light text-${t.type === 'Receita' ? 'emerald' : 'rose'}-400">
                                        R$ ${parseFloat(t.amount).toLocaleString('pt-BR')}
                                    </td>
                                    <td class="py-3 text-right font-mono text-xs opacity-70">${new Date(t.date).toLocaleDateString()}</td>
                                    <td class="py-3 text-right flex justify-end gap-2">
                                        <button onclick="openEditTransactionModal('${encodeURIComponent(JSON.stringify(t))}')" class="text-slate-600 hover:text-blue-400 transition p-1"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                        <button onclick="deleteTransaction(${t.id})" class="text-slate-600 hover:text-red-400 transition p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Side Panel: Reminders (Vencimentos) -->
            <div class="flex flex-col gap-6">
                
                <div class="rounded-xl border border-white/5 p-6 bg-slate-900/30 flex-1 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                         <h3 class="text-sm font-medium text-white uppercase tracking-wider">Vencimentos</h3>
                         <button onclick="openNewReminderModal()" class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium shadow-sm flex items-center gap-1">
                            <i data-lucide="plus" class="w-3 h-3"></i> Novo
                         </button>
                    </div>
                   
                    <div class="space-y-4 overflow-y-auto flex-1 custom-scrollbar max-h-[300px]">
                        ${reminders.length === 0 ? '<p class="text-xs text-slate-600 text-center py-4">Nenhum vencimento cadastrado.</p>' : ''}
                        ${reminders.map(r => `
                            <div class="flex items-start group relative">
                                <div class="w-10 text-center">
                                    <span class="block text-xs text-slate-500 uppercase font-mono">${new Date(r.due_date).toLocaleString('default', { month: 'short' })}</span>
                                    <span class="block text-lg font-light text-white">${new Date(r.due_date).getDate()}</span>
                                </div>
                                <div class="ml-4 pt-1 border-l border-white/5 pl-4 flex-1">
                                    <p class="text-sm text-slate-300 group-hover:text-white transition-colors">${r.title}</p>
                                    <p class="text-xs text-slate-600 mt-0.5">${r.description || ''}</p>
                                </div>
                                <button onclick="deleteReminder(${r.id})" class="absolute right-0 top-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i data-lucide="x" class="w-3 h-3"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Action Box -->
                <div class="rounded-xl border border-white/10 p-6 bg-white/[0.02]">
                    <div class="flex items-center gap-3 mb-3 text-slate-300">
                        <i data-lucide="send" class="w-4 h-4"></i>
                        <span class="text-sm font-medium">Envio Rápido</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-4 font-light">Envie documentos fiscais diretamente para o painel do cliente.</p>
                    <button onclick="openUploadModal()" class="w-full py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/30 text-xs uppercase tracking-widest transition-all">
                        Selecionar Arquivo
                    </button>
                </div>
            </div>
        </div>
    `;
}
