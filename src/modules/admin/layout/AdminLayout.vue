<script setup lang="ts">
import { useRouter } from 'vue-router';
import { UserService } from '../../../services/UserService';

import { ref } from 'vue';

const router = useRouter();
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
    isSidebarOpen.value = false;
};

const logout = async () => {
    await UserService.signOut();
    router.push('/auth');
};
</script>

<template>
    <div class="admin-layout">
        <!-- Mobile Header -->
        <div class="mobile-header">
            <button class="hamburger-btn" @click="toggleSidebar">☰</button>
            <h2>Admin</h2>
        </div>

        <!-- Sidebar Backdrop -->
        <div class="sidebar-backdrop" v-if="isSidebarOpen" @click="closeSidebar"></div>

        <aside class="admin-sidebar" :class="{ open: isSidebarOpen }">
            <div class="sidebar-header">
                <h2>👑 Admin</h2>
                <button class="close-btn mobile-only" @click="closeSidebar">×</button>
            </div>
            <nav class="admin-nav" @click="closeSidebar"> <!-- Close on nav click for mobile -->
                <router-link to="/admin/questions" class="nav-item" active-class="active">
                    📝 Вопросы
                </router-link>
                <router-link to="/admin/users" class="nav-item" active-class="active">
                    👥 Пользователи
                </router-link>
                <router-link to="/admin/courses" class="nav-item" active-class="active">
                    🎓 Курсы
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

    @media (max-width: 768px) {
        padding: 16px;
    }
}

.mobile-header {
    display: none;
    align-items: baseline;
    gap: 16px;
    padding-left: 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
}

.hamburger-btn {
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 4px;
}

.sidebar-backdrop {
    display: none;
}

.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .admin-layout {
        flex-direction: column;
    }

    .mobile-header {
        display: flex;
    }

    .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
    }

    .admin-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: 100;
        width: 280px;
        box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);

        &.open {
            transform: translateX(0);
        }
    }

    .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .mobile-only {
        display: block;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
    }
}
</style>
