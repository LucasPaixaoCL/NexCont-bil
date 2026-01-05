import { openModal, NewClientModalContent, EditClientModalContent } from './Modals.js';

export const Clients = async () => {
    window.openNewClientModal = () => openModal('Adicionar Novo Cliente', NewClientModalContent);

    let clients = [];

    // Handler for New Client Submission
    window.handleClientSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3000/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.showToast('Cliente cadastrado com sucesso!', 'success');
                window.closeModal();
                // Simple reload to refresh list for now ( SPA router would be better but this works for this setup)
                window.location.reload();
            } else {
                window.showToast('Erro ao cadastrar cliente.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            window.showToast('Erro de conexão.', 'error');
        }
    };

    try {
        const response = await fetch('http://localhost:3000/api/clients');
        if (response.ok) {
            clients = await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch clients:', error);
    }

    // Delete Handler
    window.deleteClient = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
            await fetch(`http://localhost:3000/api/clients/${id}`, { method: 'DELETE' });
            window.location.reload();
        } catch (e) { window.showToast('Erro ao excluir', 'error'); }
    }

    // Edit Handler
    window.openEditClientModal = (clientJson) => {
        const client = JSON.parse(decodeURIComponent(clientJson));
        openModal('Editar Cliente', EditClientModalContent(client));
    }

    window.handleEditClientSubmit = async (event, id) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                window.showToast('Cliente atualizado!', 'success');
                window.location.reload();
            } else window.showToast('Erro ao atualizar.', 'error');
        } catch (e) { window.showToast('Erro de conexão', 'error'); }
    }

    const rows = clients.map(client => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition group">
            <td class="py-4 pl-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        ${client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-200">${client.name}</p>
                        <p class="text-xs text-slate-500">${client.email}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 text-slate-400 font-mono text-xs">${client.cnpj}</td>
            <td class="py-4">
                <span class="px-2 py-1 rounded text-xs font-medium ${client.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'}">
                    ${client.status}
                </span>
            </td>
            <td class="py-4 text-slate-400">${client.regime}</td>
            <td class="py-4 text-right pr-4">
                <button onclick="openEditClientModal('${encodeURIComponent(JSON.stringify(client))}')" class="text-slate-500 hover:text-blue-400 mr-2 transition"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button onclick="deleteClient(${client.id})" class="text-slate-500 hover:text-red-400 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');

    return `
        <div class="glass-panel rounded-xl p-6 mb-6 border border-white/5">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div class="relative w-full sm:w-64">
                    <input type="text" placeholder="Buscar clientes..." class="input-minimal w-full pl-10 pr-4 py-2 bg-slate-900/50 text-slate-300 rounded-lg border border-white/5 placeholder-slate-600" />
                    <i data-lucide="search" class="w-4 h-4 text-slate-600 absolute left-3 top-3"></i>
                </div>
                <!-- Botão Primário Monocromático -->
                <button onclick="openNewClientModal()" class="bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all text-sm font-medium flex items-center gap-2">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Adicionar Cliente</span>
                </button>
            </div>

            <div class="overflow-x-auto rounded-lg border border-white/5">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th class="p-4 font-medium border-b border-white/5">Cliente</th>
                            <th class="p-4 font-medium border-b border-white/5">CNPJ/CPF</th>
                            <th class="p-4 font-medium border-b border-white/5">Status</th>
                            <th class="p-4 font-medium border-b border-white/5">Regime</th>
                            <th class="p-4 font-medium border-b border-white/5 max-w-[50px]"></th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-300 text-sm">
                        ${rows}
                    </tbody>
                </table>
            </div>
            
             <div class="flex justify-between items-center mt-6 text-sm text-slate-500">
                <p>Mostrando ${clients.length} clientes</p>
                <div class="flex gap-2">
                    <button class="px-3 py-1 hover:text-white transition hover:bg-white/5 rounded">Anterior</button>
                    <button class="px-3 py-1 hover:text-white transition hover:bg-white/5 rounded">Próximo</button>
                </div>
            </div>
        </div>
    `;
}
