import { openModal, NewTaskModalContent } from './Modals.js';
import { renderDropdownHtml } from '../utils/Dropdowns.js';

export const Tasks = async () => {
    window.openNewTaskModal = () => openModal('Nova Tarefa', NewTaskModalContent);

    let tasks = [];
    let currentFilter = 'Todos';

    // Helper to render the table body
    window.renderTasks = () => {
        const tbody = document.getElementById('tasks-tbody');
        if (!tbody) return;

        const filteredTasks = tasks.filter(t => {
            if (currentFilter === 'Todos') return true;
            return t.status === currentFilter;
        });

        tbody.innerHTML = filteredTasks.map(task => `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition group">
                <td class="py-4 pl-4">
                    <p class="text-sm font-medium text-slate-200">${task.title}</p>
                    <p class="text-xs text-slate-500">ID Cliente: ${task.client_id}</p>
                </td>
                <td class="py-4">
                    <span class="px-2 py-1 rounded text-xs font-medium border ${task.status === 'Concluída' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                task.status === 'Em Andamento' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }">
                        ${task.status}
                    </span>
                </td>
                <td class="py-4 text-slate-400 text-xs">${new Date(task.due_date).toLocaleDateString()}</td>
                <td class="py-4 text-slate-400 text-xs">${task.sector}</td>
                <td class="py-4 text-right pr-4 flex justify-end gap-2 items-center">
                    <div class="w-32">
                         ${renderDropdownHtml(
                `status-${task.id}`,
                task.status,
                [
                    { label: 'Pendente', value: 'Pendente' },
                    { label: 'Em Andamento', value: 'Em Andamento' },
                    { label: 'Concluída', value: 'Concluída' }
                ],
                `updateTaskStatus(${task.id}, this.value)`
            )}
                    </div>
                    <button onclick="deleteTask(${task.id})" class="text-slate-500 hover:text-red-400 transition p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');

        // Re-init icons
        if (window.lucide) window.lucide.createIcons();
    };

    // Handlers
    window.setFilter = (filter) => {
        currentFilter = filter;
        window.renderTasks();
    };

    window.updateTaskStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                const task = tasks.find(t => t.id === id);
                if (task) task.status = newStatus;
                window.renderTasks();
                window.showToast('Status atualizado', 'success');
            } else {
                window.showToast('Erro ao atualizar status', 'error');
            }
        } catch (e) { console.error(e); window.showToast('Erro de conexão', 'error'); }
    };

    window.deleteTask = async (id) => {
        if (!confirm('Excluir tarefa?')) return;
        try {
            const res = await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                tasks = tasks.filter(task => task.id !== id);
                window.renderTasks();
                window.showToast('Tarefa excluída', 'success');
            } else window.showToast('Erro ao excluir', 'error');
        } catch (e) { window.showToast('Erro ao excluir', 'error'); }
    }

    window.handleTaskSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.showToast('Tarefa criada com sucesso!', 'success');
                window.closeModal();
                // Reload data instead of page to keep SPA feel, but for now simple reload or re-fetch
                const newTask = await response.json();
                tasks.push(newTask);
                window.renderTasks();
            } else {
                window.showToast('Erro ao criar tarefa.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            window.showToast('Erro de conexão.', 'error');
        }
    };

    // Initial Fetch
    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        if (response.ok) {
            tasks = await response.json();
        }
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        window.showToast('Erro ao carregar tarefas', 'error');
    }

    // Defer render until DOM is ready
    setTimeout(window.renderTasks, 0);

    return `
        <div class="glass-panel p-6 rounded-xl border border-white/5">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 class="text-lg font-medium text-slate-200">Tarefas</h2>
                <div class="flex items-center gap-3 w-full sm:w-auto">
                     <!-- Filter -->
                    <div class="relative flex-1 sm:flex-none w-48">
                        ${renderDropdownHtml(
        'filter',
        'Todos',
        [
            { label: 'Todos os Status', value: 'Todos' },
            { label: 'Pendentes', value: 'Pendente' },
            { label: 'Em Andamento', value: 'Em Andamento' },
            { label: 'Concluídas', value: 'Concluída' }
        ],
        'window.setFilter(this.value)'
    )}
                    </div>
                    <button onclick="openNewTaskModal()" class="bg-white/5 text-slate-200 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2 whitespace-nowrap">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Nova Tarefa</span>
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto rounded-lg border border-white/5">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th class="p-4 font-medium border-b border-white/5">Tarefa</th>
                            <th class="p-4 font-medium border-b border-white/5">Status</th>
                            <th class="p-4 font-medium border-b border-white/5">Vencimento</th>
                            <th class="p-4 font-medium border-b border-white/5">Setor</th>
                            <th class="p-4 font-medium border-b border-white/5 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="tasks-tbody" class="text-slate-300 text-sm">
                        <!-- Content rendered by renderTasks() -->
                         <tr><td colspan="5" class="text-center py-8 text-slate-500">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
