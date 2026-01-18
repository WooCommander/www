<script setup lang="ts">
import { useRouter } from 'vue-router';
import { UserService } from '../../../services/UserService';

const router = useRouter();

const logout = async () => {
    await UserService.signOut();
    router.push('/auth');
};
</script>

<template>
    <div class="admin-layout">
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h2>👑 Admin</h2>
            </div>
            <nav class="admin-nav">
                <router-link to="/admin/questions" class="nav-item" active-class="active">
                    📝 Вопросы
                </router-link>
                <router-link to="/admin/users" class="nav-item" active-class="active">
                    👥 Пользователи
                </router-link>
                <router-link to="/" class="nav-item">
                    🏠 На сайт
                </router-link>
            </nav>
            <div class="sidebar-footer">
                <button @click="logout" class="logout-btn">Выйти</button>
            </div>
        </aside>

        <main class="admin-content">
            <router-view></router-view>
        </main>
    </div>
</template>

<style scoped lang="scss">
.admin-layout {
    display: flex;
    height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
}

.admin-sidebar {
    width: 250px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.sidebar-header h2 {
    margin: 0 0 30px 0;
    font-size: 1.5rem;
    color: var(--accent-primary);
}

.admin-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
}

.nav-item {
    padding: 12px;
    border-radius: 8px;
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }

    &.active {
        background: var(--accent-primary);
        color: white;
    }
}

.logout-btn {
    width: 100%;
    padding: 10px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
}

.admin-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
}
</style>
