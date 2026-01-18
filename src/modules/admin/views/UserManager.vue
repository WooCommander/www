<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AdminService } from '../services/AdminService';
import { NotificationService } from '../../../shared/services/NotificationService';
import { UserService } from '../../../services/UserService';
import type { UserProfile } from '../../../shared/types';

// Extended type for local use if needed, or just cast
interface AdminUserProfile extends UserProfile {
    created_at?: string;
    is_banned?: boolean;
    role?: string;
}

const users = ref<AdminUserProfile[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const currentUserId = ref<string | null>(null);

const loadUsers = async () => {
    try {
        loading.value = true;

        // Fetch users AND current session in parallel
        const [data, session] = await Promise.all([
            AdminService.getUsers(),
            UserService.getSession()
        ]);

        users.value = data as AdminUserProfile[];
        currentUserId.value = session?.user.id || null;
    } catch (e: any) {
        console.error(e);
        NotificationService.error(`Ошибка: ${e.message || JSON.stringify(e)}`);
    } finally {
        loading.value = false;
    }
};

const toggleBan = async (user: AdminUserProfile) => {
    // 1. Self-Ban Protection
    if (user.id === currentUserId.value) {
        NotificationService.error('Нельзя забанить самого себя! 🤡');
        return;
    }

    // 2. Confirmation Dialogs
    if (user.is_banned) {
        if (!confirm(`Разбанить пользователя ${user.username || 'Без имени'}?`)) return;
    } else {
        if (!confirm(`ЗАБАНИТЬ пользователя ${user.username || 'Без имени'}?\n\nОн мгновенно потеряет доступ к сайту.`)) return;
    }

    try {
        const newState = !user.is_banned;
        await AdminService.toggleBan(user.id, newState);
        user.is_banned = newState; // Optimistic update
        NotificationService.success(newState ? 'Пользователь забанен' : 'Пользователь разбанен');
    } catch (e) {
        NotificationService.error('Ошибка изменения статуса');
    }
};

const updateRole = async (user: AdminUserProfile, newRole: string) => {
    if (!confirm(`Назначить пользователя ${user.username} ролью "${newRole.toUpperCase()}"?`)) return;
    try {
        await AdminService.updateUserRole(user.id, newRole);
        user.role = newRole;
        NotificationService.success('Роль обновлена');
    } catch (e: any) {
        NotificationService.error('Ошибка обновления роли');
    }
};

const filteredUsers = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return users.value.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
});

onMounted(() => {
    loadUsers();
});
</script>

<template>
    <div class="user-manager">
        <header class="page-header">
            <div class="header-left">
                <h1>👥 Пользователи</h1>
                <span class="count-badge" v-if="users.length">{{ users.length }}</span>
            </div>

            <div class="actions">
                <input v-model="searchQuery" placeholder="🔍 Поиск людей..." class="search-input" />
                <button class="refresh-btn" @click="loadUsers">🔄</button>
            </div>
        </header>

        <div class="content-card">
            <p v-if="loading" class="no-data">Загрузка списка...</p>
            <p v-else-if="users.length === 0" class="no-data">Пользователей нет.</p>

            <div v-else class="table-container desktop-only">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Пользователь</th>
                            <th>ID</th>
                            <th>Статус</th>
                            <th>Роль</th>
                            <th align="right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filteredUsers" :key="user.id"
                            :class="{ banned: user.is_banned, 'is-me': user.id === currentUserId }">
                            <td>
                                <div class="user-info">
                                    <div class="avatar-ph">{{ ((user.username || '?')[0] || '?').toUpperCase() }}</div>
                                    <div class="names">
                                        <div class="username">
                                            {{ user.username || 'Без имени' }}
                                            <span v-if="user.id === currentUserId" class="me-badge">(Вы)</span>
                                        </div>
                                        <div class="fullname" v-if="user.full_name">{{ user.full_name }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="id-col" :title="user.id">{{ user.id.slice(0, 8) }}...</td>
                            <td>
                                <span class="badge" :class="user.is_banned ? 'banned' : 'active'">
                                    {{ user.is_banned ? '⛔ BANNED' : '✅ Active' }}
                                </span>
                            </td>
                            <td>
                                <select :value="user.role || 'user'"
                                    @change="e => updateRole(user, (e.target as HTMLSelectElement).value)"
                                    class="role-select" :class="user.role" :disabled="user.id === currentUserId">
                                    <option value="user">User</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td align="right">
                                <button class="ban-btn" :class="{ unban: user.is_banned }"
                                    :disabled="user.id === currentUserId"
                                    :title="user.id === currentUserId ? 'Нельзя забанить себя' : ''"
                                    @click="toggleBan(user)">
                                    {{ user.is_banned ? 'Разбанить' : '⛔ Бан' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile Card View -->
            <div v-if="users.length > 0" class="mobile-list mobile-only">
                <div v-for="user in filteredUsers" :key="user.id" class="user-card"
                    :class="{ banned: user.is_banned, 'is-me': user.id === currentUserId }">
                    <div class="u-header">
                        <div class="u-info">
                            <div class="avatar-ph">{{ ((user.username || '?')[0] || '?').toUpperCase() }}</div>
                            <div class="names">
                                <div class="username">
                                    {{ user.username || 'Без имени' }}
                                    <span v-if="user.id === currentUserId" class="me-badge">(Вы)</span>
                                </div>
                                <span class="badge" :class="user.is_banned ? 'banned' : 'active'">
                                    {{ user.is_banned ? '⛔ BANNED' : '✅ Active' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="u-body">
                        <div class="field-row">
                            <span class="label">ID:</span>
                            <span class="value monospace">{{ user.id.slice(0, 8) }}...</span>
                        </div>
                        <div class="field-row">
                            <span class="label">Роль:</span>
                            <select :value="user.role || 'user'"
                                @change="e => updateRole(user, (e.target as HTMLSelectElement).value)"
                                class="role-select" :class="user.role" :disabled="user.id === currentUserId">
                                <option value="user">User</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div class="u-footer">
                        <button class="ban-btn full-width" :class="{ unban: user.is_banned }"
                            :disabled="user.id === currentUserId" @click="toggleBan(user)">
                            {{ user.is_banned ? 'Разбанить' : '⛔ Забанить' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h1 {
        margin: 0;
        font-size: var(--fs-h1);
    }
}

.count-badge {
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

.actions {
    display: flex;
    gap: 12px;
}

.search-input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    width: 250px;
}

.refresh-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0 12px;

    &:hover {
        background: var(--bg-primary);
    }
}

.content-card {
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 14px 20px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    th {
        background: rgba(0, 0, 0, 0.2);
        font-weight: 600;
        color: var(--text-secondary);
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr.banned td {
        background: rgba(239, 68, 68, 0.05);
        opacity: 0.8;
    }

    tr.is-me td {
        background: rgba(59, 130, 246, 0.05);
    }
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar-ph {
    width: 36px;
    height: 36px;
    background: var(--bg-secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

.names {
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: 600;
    color: var(--text-primary);
}

.me-badge {
    font-size: 0.75rem;
    color: var(--accent-primary);
    margin-left: 6px;
    font-weight: bold;
}

.fullname {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.id-col {
    font-family: monospace;
    color: var(--text-secondary);
    font-size: 0.85rem;
}

.badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;

    &.active {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
    }

    &.banned {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
    }
}

.ban-btn {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    transition: all 0.2s;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-1px);
    }

    &.unban {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;

        &:hover {
            background: rgba(34, 197, 94, 0.2);
        }
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        filter: grayscale(100%);

        &:hover {
            transform: none;
            background: rgba(239, 68, 68, 0.1);
        }
    }
}

.no-data {
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
}

/* Role Select Styles */
.role-select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
    }

    /* Style based on value (requires JS binding usually, but nice if possible) */
    &.admin {
        color: #a855f7;
        border-color: rgba(168, 85, 247, 0.3);
        background: rgba(168, 85, 247, 0.05);
    }

    &.editor {
        color: #3b82f6;
        border-color: rgba(59, 130, 246, 0.3);
        background: rgba(59, 130, 246, 0.05);
    }

    &.user {
        color: var(--text-secondary);
    }
}

tr.banned .fullname,
tr.banned .id-col {
    text-decoration: line-through;
    opacity: 0.7;
}

/* Mobile Styles */
.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }

    .mobile-only {
        display: block;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .actions {
        width: 100%;
        gap: 12px;
    }

    .search-input {
        width: 100%;
        flex: 1;
    }

    .header-left {
        width: 100%;
        justify-content: space-between;
    }

    .user-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;

        &.is-me {
            border-color: var(--accent-primary);
            background: rgba(59, 130, 246, 0.05);
        }
    }

    .u-header {
        margin-bottom: 12px;
    }

    .u-info {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    .u-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        padding: 12px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .field-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--fs-body);
    }

    .label {
        color: var(--text-secondary);
    }

    .monospace {
        font-family: monospace;
    }

    .ban-btn.full-width {
        width: 100%;
        padding: 10px;
    }
}
</style>