import { renderDropdownHtml } from '../utils/Dropdowns.js';

export const openModal = (title, contentHTML) => {
    const modal = document.createElement('div');
    // Initial State: Invisible
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/0 backdrop-blur-0 transition-all duration-300';
    modal.id = 'active-modal';

    modal.innerHTML = `
        <div class="glass-panel w-full max-w-lg rounded-xl border border-white/10 shadow-2xl relative overflow-hidden transform scale-95 opacity-0 transition-all duration-300 ease-out">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                <h3 class="text-lg font-medium text-white">${title}</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white transition rounded-lg p-1 hover:bg-white/5">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <!-- Body -->
            <div class="p-6 max-h-[80vh] overflow-y-auto">
                ${contentHTML}
            </div>
        </div>
    `;

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Trigger Transition
    requestAnimationFrame(() => {
        modal.classList.remove('bg-black/0', 'backdrop-blur-0');
        modal.classList.add('bg-black/60', 'backdrop-blur-sm');

        const panel = modal.firstElementChild;
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
    });
};

window.closeModal = () => {
    const modal = document.getElementById('active-modal');
    if (modal) {
        // Transition Out
        modal.classList.remove('bg-black/60', 'backdrop-blur-sm');
        modal.classList.add('bg-black/0', 'backdrop-blur-0');

        const panel = modal.firstElementChild;
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');

        setTimeout(() => modal.remove(), 300);
    }
    document.body.style.overflow = '';
};


// --- Specific Modal Contents ---

export const NewEntryModalContent = `
    <form class="space-y-4" onsubmit="window.handleEntrySubmit(event)">
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Tipo</label>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="Receita" class="text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-600" checked>
                    <span class="text-sm text-slate-300">Receita</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" value="Despesa" class="text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-600">
                    <span class="text-sm text-slate-300">Despesa</span>
                </label>
            </div>
        </div>
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Descrição</label>
            <input type="text" name="description" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="Ex: Honorários Mensais" required>
        </div>
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Valor (R$)</label>
            <input type="number" name="amount" step="0.01" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="0,00" required>
        </div>
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Data</label>
            <input type="date" name="date" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" required>
        </div>
        
        <div class="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-white text-slate-900 font-medium text-sm hover:bg-slate-200 transition">Salvar Lançamento</button>
        </div>
    </form>
`;

export const NewClientModalContent = `
    <form class="space-y-4" onsubmit="window.handleClientSubmit(event)">
        <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
                <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Nome da Empresa</label>
                <input type="text" name="name" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="Razão Social" required>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-500 uppercase mb-1">CNPJ</label>
                <input type="text" name="cnpj" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="00.000.000/0000-00" required>
            </div>
            <div>
                 <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Regime</label>
                 ${renderDropdownHtml('regime', 'Simples Nacional', [
    { label: 'Simples Nacional', value: 'Simples Nacional' },
    { label: 'Lucro Presumido', value: 'Lucro Presumido' },
    { label: 'Lucro Real', value: 'Lucro Real' }
])}
            </div>
            <div class="col-span-2">
                <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Email de Contato</label>
                <input type="email" name="email" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="contato@empresa.com" required>
            </div>

        <div class="col-span-2 pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition">Cadastrar Cliente</button>
        </div>
    </form>
`;

export const NewTaskModalContent = `
    <form class="space-y-4" onsubmit="window.handleTaskSubmit(event)">
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Título da Tarefa</label>
            <input type="text" name="title" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="Ex: Calcular Folha de Pagamento" required>
        </div>
         <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Cliente (ID)</label>
            <!-- Temporary Input until we load clients dynamically in the select -->
            <input type="number" name="client_id" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="ID do Cliente (ex: 1)" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Vencimento</label>
                <input type="date" name="due_date" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" required>
            </div>
            <div>
                 <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Setor</label>
                 ${renderDropdownHtml('sector', 'Fiscal', [
    { label: 'Fiscal', value: 'Fiscal' },
    { label: 'Contábil', value: 'Contábil' },
    { label: 'Pessoal', value: 'Pessoal' }
])}
            </div>

        <div class="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition">Criar Tarefa</button>
        </div>
    </form>
`;

export const UploadModalContent = `
    <div class="text-center py-8" ondrop="event.preventDefault(); window.showToast('Simulação: Arquivo recebido (DND)!', 'success'); closeModal();" ondragover="event.preventDefault()">
        <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <i data-lucide="cloud-upload" class="w-8 h-8 text-blue-400"></i>
        </div>
        <h3 class="text-slate-200 font-medium mb-1">Arraste seus arquivos aqui</h3>
        <p class="text-slate-500 text-sm mb-6">ou clique para buscar no computador</p>
        
        <form onsubmit="window.handleUploadSubmit(event)">
             <input type="file" name="file" id="fileUi" class="hidden" onchange="window.handleUploadSubmit({ target: this.form, preventDefault: () => {} })">
        </form>

        <button onclick="document.getElementById('fileUi').click()" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition">
            Escolher Arquivos
        </button>
        
        <p class="text-xs text-slate-600 mt-6">Suporta: PDF, XML, XLSX, OFX (Max 25MB)</p>
    </div>
`;

export const NewFolderModalContent = `
    <form class="space-y-4" onsubmit="window.handleFolderSubmit(event)">
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Nome da Pasta</label>
            <input type="text" name="name" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" placeholder="Ex: Impostos 2024" required>
        </div>
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Cor</label>
            <div class="flex gap-3">
                <label class="cursor-pointer">
                    <input type="radio" name="color" value="blue" class="peer sr-only" checked>
                    <div class="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-transparent peer-checked:border-blue-500 peer-checked:bg-blue-500/40 transition"></div>
                </label>
                <label class="cursor-pointer">
                    <input type="radio" name="color" value="emerald" class="peer sr-only">
                    <div class="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-transparent peer-checked:border-emerald-500 peer-checked:bg-emerald-500/40 transition"></div>
                </label>
                <label class="cursor-pointer">
                    <input type="radio" name="color" value="amber" class="peer sr-only">
                    <div class="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-transparent peer-checked:border-amber-500 peer-checked:bg-amber-500/40 transition"></div>
                </label>
                 <label class="cursor-pointer">
                    <input type="radio" name="color" value="purple" class="peer sr-only">
                    <div class="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-transparent peer-checked:border-purple-500 peer-checked:bg-purple-500/40 transition"></div>
                </label>
            </div>
        </div>
        <div class="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-white text-slate-900 font-medium text-sm hover:bg-slate-200 transition">Criar Pasta</button>
        </div>
    </form>
`;

export const MoveDocModalContent = (folders) => `
    <form onsubmit="handleMoveSubmit(event)">
        <input type="hidden" name="doc_id" id="move_doc_id_input">
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Selecione a Pasta</label>
                ${renderDropdownHtml('folder_id', '', [
    { label: '(Raiz)', value: '' },
    ...folders.map(f => ({ label: f.name, value: f.id }))
], '', 'Selecione a Destino')}
            </div>
            <button type="submit" class="w-full bg-white text-slate-900 list-none rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition">
                Mover Arquivo
            </button>
        </div>
    </form>
`;

export const EditClientModalContent = (client) => `
    <form onsubmit="handleEditClientSubmit(event, ${client.id})">
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Nome da Empresa/Cliente</label>
                <input type="text" name="name" value="${client.name}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">CNPJ/CPF</label>
                    <input type="text" name="cnpj" value="${client.cnpj}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Regime Tributário</label>
                    ${renderDropdownHtml('regime', client.regime, [
    { label: 'Simples Nacional', value: 'Simples Nacional' },
    { label: 'Lucro Presumido', value: 'Lucro Presumido' },
    { label: 'Lucro Real', value: 'Lucro Real' },
    { label: 'MEI', value: 'MEI' }
])}
                </div>
            </div>
            <div>
                 <label class="block text-xs font-medium text-slate-400 mb-1">Email de Contato</label>
                 <input type="email" name="email" value="${client.email}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
             <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Status</label>
                ${renderDropdownHtml('status', client.status, [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' }
])}
            </div>
            <button type="submit" class="w-full bg-white text-slate-900 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition">
                Salvar Alterações
            </button>
        </div>
    </form>
`;

export const EditTransactionModalContent = (t) => `
    <form onsubmit="handleEditTransactionSubmit(event, ${t.id})">
        <div class="space-y-4">
             <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                <input type="text" name="description" value="${t.description}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" name="amount" value="${t.amount}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
                </div>
                <div>
                     <label class="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
                     ${renderDropdownHtml('type', t.type, [
    { label: 'Receita (Entrada)', value: 'Receita' },
    { label: 'Despesa (Saída)', value: 'Despesa' }
])}
                </div>
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Data</label>
                <input type="date" name="date" value="${new Date(t.date).toISOString().split('T')[0]}" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
            <button type="submit" class="w-full bg-white text-slate-900 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition">
                Salvar Alterações
            </button>
        </div>
    </form>
`;

export const NewReminderModalContent = `
    <form onsubmit="handleReminderSubmit(event)">
        <div class="space-y-4">
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Título</label>
                <input type="text" name="title" placeholder="Ex: Pagar DAS" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
            <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Vencimento</label>
                <input type="date" name="due_date" required class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
             <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Descrição (Opcional)</label>
                <input type="text" name="description" class="input-minimal w-full bg-slate-900/50 text-slate-300 rounded-lg border border-white/10 p-2 focus:border-blue-500 outline-none" />
            </div>
            <button type="submit" class="w-full bg-white text-slate-900 rounded-lg py-2 text-sm font-medium hover:bg-slate-200 transition">
                Adicionar Vencimento
            </button>
        </div>
    </form>
`;

export const RenameFolderModalContent = (id, currentName) => `
    <form class="space-y-4" onsubmit="window.handleRenameFolderSubmit(event, ${id})">
        <div>
            <label class="block text-xs font-medium text-slate-500 uppercase mb-1">Nome da Pasta</label>
            <input type="text" name="name" value="${currentName}" class="input-minimal w-full bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-600" required>
        </div>
        <div class="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition">Renomear</button>
        </div>
    </form>
`;
