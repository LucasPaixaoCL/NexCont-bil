import { openModal, UploadModalContent, NewFolderModalContent, MoveDocModalContent, RenameFolderModalContent } from './Modals.js';

export const Documents = async () => {
    let documents = [];
    let folders = [];
    let activeFolderId = null; // null = root

    // --- Data Fetching ---
    const loadData = async () => {
        try {
            const [docsRes, foldersRes] = await Promise.all([
                fetch('http://localhost:3000/api/documents'),
                fetch('http://localhost:3000/api/folders')
            ]);
            if (docsRes.ok) documents = await docsRes.json();
            if (foldersRes.ok) folders = await foldersRes.json();
        } catch (e) { console.error('Error fetching docs/folders:', e); }
    };
    await loadData();

    // --- Handlers ---
    window.openDocumentsUpload = () => openModal('Upload de Documento', UploadModalContent);
    window.openNewFolderModal = () => openModal('Nova Pasta', NewFolderModalContent);
    window.openRenameFolderModal = (id, currentName) => openModal('Renomear Pasta', RenameFolderModalContent(id, currentName));

    // Expose render function for internal re-renders
    window.renderDocumentsComponent = async () => {
        const container = document.getElementById('documents-container');
        if (container) {
            const newContent = await DocumentsLogic();
            container.innerHTML = newContent;
        } else {
            // Fallback if not mounted yet (should not prevent initial render)
            console.warn('Documents container not found for re-render');
        }
        if (window.lucide) window.lucide.createIcons();
    };

    window.setActiveFolder = (id) => {
        activeFolderId = id;
        window.renderDocumentsComponent();
    };

    window.handleRenameFolderSubmit = async (event, id) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get('name');
        try {
            await fetch(`http://localhost:3000/api/folders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: 'blue' }) // Keep existing color logic later
            });
            window.showToast('Pasta renomeada!', 'success');
            window.closeModal();
            // Update local state if needed or just re-fetch
            await loadData(); // Reload folders
            window.renderDocumentsComponent();
        } catch (e) { window.showToast('Erro ao renomear', 'error'); }
    };

    window.handleFolderSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await fetch('http://localhost:3000/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            window.showToast('Pasta criada!', 'success');
            window.closeModal();
            await loadData();
            window.renderDocumentsComponent();
        } catch (e) { window.showToast('Erro ao criar pasta', 'error'); }
    };

    window.handleUploadSubmit = async (event) => {
        if (event.preventDefault) event.preventDefault(); // Handle both form submit and onchange

        const form = event.target.closest ? event.target.closest('form') : event.target;
        const fileInput = form.querySelector('input[type="file"]');
        const file = fileInput.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('type', file.name.split('.').pop().toUpperCase());
        formData.append('size', (file.size / 1024 / 1024).toFixed(2) + ' MB');

        try {
            // Determine target folder: activeFolder or "Downloads"
            let targetFolderId = activeFolderId;
            if (!targetFolderId) {
                const fRes = await fetch('http://localhost:3000/api/folders');
                if (fRes.ok) {
                    const folders = await fRes.json();
                    const dlFolder = folders.find(f => f.name === 'Downloads');
                    if (dlFolder) targetFolderId = dlFolder.id;
                }
            }
            if (targetFolderId) formData.append('folder_id', targetFolderId);

            const response = await fetch('http://localhost:3000/api/documents', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                window.showToast('Upload concluído!', 'success');
                window.closeModal();
                await loadData();
                window.renderDocumentsComponent(); // Re-render to show new file if we are in that folder
            } else {
                window.showToast('Erro no upload', 'error');
            }
        } catch (e) { console.error(e); window.showToast('Erro de conexão', 'error'); }
    };

    window.deleteDocument = async (id) => {
        if (!confirm('Excluir este documento permanentemente?')) return;
        try {
            await fetch(`http://localhost:3000/api/documents/${id}`, { method: 'DELETE' });
            await loadData();
            window.renderDocumentsComponent();
        } catch (e) { window.showToast('Erro ao excluir', 'error'); }
    };

    window.deleteFolder = async (id, event) => {
        event.stopPropagation();
        if (!confirm('Excluir esta pasta e todos os seus itens?')) return;
        try {
            await fetch(`http://localhost:3000/api/folders/${id}`, { method: 'DELETE' });
            await loadData();
            window.renderDocumentsComponent();
        } catch (e) { window.showToast('Erro ao excluir pasta', 'error'); }
    };

    window.openMoveModal = (docId) => {
        openModal('Mover Documento', MoveDocModalContent(folders, activeFolderId));
        setTimeout(() => document.getElementById('move_doc_id_input').value = docId, 50);
    };

    window.handleMoveSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const folderId = formData.get('folder_id') || null; // Handle empty value as null
        const docId = formData.get('doc_id');

        try {
            await fetch(`http://localhost:3000/api/documents/${docId}/move`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder_id: folderId })
            });
            window.closeModal();
            await loadData();
            window.renderDocumentsComponent();
        } catch (e) { window.showToast('Erro ao mover arquivo', 'error'); }
    };


    // --- Core Logic Wrapper ---
    const DocumentsLogic = async () => {
        // --- Filtering ---
        // --- Filtering ---
        // If activeFolderId is set, show only files in that folder.
        // If NO activeFolderId (Root), show ALL files (Recent Files view).
        const filteredDocs = activeFolderId
            ? documents.filter(d => d.folder_id === activeFolderId)
            : documents; // Show all documents in root view for "Recent Activity"
        const activeFolder = folders.find(f => f.id === activeFolderId);

        // --- Render Helpers ---
        const renderFolders = () => {
            if (activeFolderId) return ''; // Hide folders list when inside a folder
            return `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <!-- Add New Folder Card -->
                    <div onclick="openNewFolderModal()" class="p-4 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition group h-32">
                        <div class="p-2 bg-slate-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <i data-lucide="plus" class="w-5 h-5 text-slate-400"></i>
                        </div>
                        <span class="text-xs font-medium text-slate-400">Nova Pasta</span>
                    </div>
                    ${folders.map(f => `
                        <div onclick="setActiveFolder(${f.id})" class="p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:bg-slate-800 cursor-pointer transition flex flex-col justify-between group h-32 relative">
                            <div class="flex justify-between items-start">
                                <i data-lucide="folder" class="w-8 h-8 text-${f.color || 'blue'}-400/80 group-hover:text-${f.color || 'blue'}-400 transition-colors"></i>
                                 <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onclick="openRenameFolderModal(${f.id}, '${f.name}'); event.stopPropagation()" class="text-slate-600 hover:text-white p-1"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                                    <button onclick="deleteFolder(${f.id}, event)" class="text-slate-600 hover:text-red-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-slate-200 truncate">${f.name}</p>
                                <p class="text-xs text-slate-500">${documents.filter(d => d.folder_id === f.id).length} arquivos</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        };

        const renderBreadcrumbs = () => {
            if (!activeFolderId) return '<h3 class="font-medium text-slate-200 mb-4 flex items-center gap-2"><i data-lucide="folder" class="w-4 h-4"></i> Pastas</h3>';
            return `
                <div class="flex items-center gap-2 mb-6 text-sm">
                    <button onclick="setActiveFolder(null)" class="text-slate-400 hover:text-white transition flex items-center gap-1">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> Voltar
                    </button>
                    <span class="text-slate-600">/</span>
                    <span class="text-white font-medium flex items-center gap-2">
                        <i data-lucide="folder-open" class="w-4 h-4 text-${activeFolder?.color || 'blue'}-400"></i>
                        ${activeFolder?.name}
                    </span>
                </div>
            `;
        };

        const docRows = filteredDocs.map(doc => `
            <tr class="border-b border-white/5 hover:bg-white/[0.02] transition group">
                <td class="py-3 flex items-center gap-3">
                    <div class="p-2 bg-slate-800 rounded mx-1">
                        <i data-lucide="${doc.type === 'PDF' ? 'file-text' : 'file-spreadsheet'}" class="w-4 h-4 text-slate-400"></i>
                    </div>
                    <span class="text-slate-300 font-medium">${doc.name}</span>
                </td>
                <td class="py-3 text-slate-500">${new Date(doc.upload_date).toLocaleDateString()}</td>
                <td class="py-3 text-slate-500">${doc.size || '0 MB'}</td>
                <td class="py-3"><span class="bg-${doc.type === 'PDF' ? 'rose' : 'emerald'}-500/10 text-${doc.type === 'PDF' ? 'rose' : 'emerald'}-400 border border-${doc.type === 'PDF' ? 'rose' : 'emerald'}-500/20 px-2 py-0.5 rounded text-xs font-medium">${doc.type}</span></td>
                <td class="py-3 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="openMoveModal(${doc.id})" title="Mover" class="text-slate-500 hover:text-blue-400 p-1"><i data-lucide="folder-input" class="w-4 h-4"></i></button>
                        <a href="http://localhost:3000/api/documents/${doc.id}/download" target="_blank" class="text-slate-500 hover:text-white p-1 inline-block"><i data-lucide="download" class="w-4 h-4"></i></a>
                        <button onclick="deleteDocument(${doc.id})" title="Excluir" class="text-slate-500 hover:text-red-400 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
             <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-light text-white tracking-tight">Gestão Fiscal</h2>
                 <div onclick="openDocumentsUpload()" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-2">
                    <i data-lucide="upload" class="w-4 h-4"></i>
                    <span>Upload</span>
                </div>
             </div>

             <!-- Folders Area -->
             ${renderBreadcrumbs()}
             ${renderFolders()}

            <!-- Files List -->
            <div class="glass-panel p-6 rounded-xl border border-white/5 flex-1">
                <h3 class="font-medium text-slate-200 mb-4 flex items-center gap-2">
                    ${activeFolderId ? 'Arquivos da Pasta' : 'Todos os Arquivos Recentes'}
                </h3>
                 <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-slate-500 text-xs uppercase border-b border-white/5">
                            <tr>
                                <th class="py-3 pl-2 font-medium w-1/3">Nome</th>
                                <th class="py-3 font-medium">Data</th>
                                <th class="py-3 font-medium">Tamanho</th>
                                <th class="py-3 font-medium">Tipo</th>
                                <th class="py-3 text-right font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm text-slate-300">
                            ${filteredDocs.length ? docRows : `<tr><td colspan="5" class="py-8 text-center text-slate-500 font-light">Nenhum arquivo encontrado nesta pasta.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    const initialContent = await DocumentsLogic();
    return `<div id="documents-container" class="flex flex-col h-full">${initialContent}</div>`;
}
