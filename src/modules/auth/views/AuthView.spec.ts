import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuthView from './AuthView.vue';
import { AuthService } from '../services/AuthService';
import { createRouter, createWebHistory } from 'vue-router';

// Mock AuthService
vi.mock('../services/AuthService', () => ({
    AuthService: {
        signIn: vi.fn(),
        signUp: vi.fn(),
        resetPasswordForEmail: vi.fn()
    }
}));

// Setup Router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/auth', component: AuthView }
    ]
});

describe('AuthView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        router.push('/auth');
    });

    it('should render login form by default', async () => {
        const wrapper = mount(AuthView, {
            global: {
                plugins: [router]
            }
        });

        expect(wrapper.text()).toContain('Вход');
        expect(wrapper.find('input[type="email"]').exists()).toBe(true);
        expect(wrapper.find('input[type="password"]').exists()).toBe(true);
        expect(wrapper.find('button[type="submit"]').text()).toBe('Войти');
    });

    it('should switch to signup mode', async () => {
        const wrapper = mount(AuthView, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('.toggle-mode a').trigger('click');

        expect(wrapper.text()).toContain('Регистрация');
        expect(wrapper.text()).toContain('Создать аккаунт');
        // Check for confirm password field presence if possible, or text associated with it
    });

    it('should call AuthService.signIn on login submit', async () => {
        (AuthService.signIn as any).mockResolvedValue({ error: null });

        const wrapper = mount(AuthView, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('input[type="email"]').setValue('test@test.com');
        await wrapper.find('input[type="password"]').setValue('password');
        await wrapper.find('form').trigger('submit');

        expect(AuthService.signIn).toHaveBeenCalledWith('test@test.com', 'password');
    });

    it('should show error message on failed login', async () => {
        const errorMsg = 'Invalid credentials';
        (AuthService.signIn as any).mockResolvedValue({ error: { message: errorMsg } });

        const wrapper = mount(AuthView, {
            global: {
                plugins: [router]
            }
        });

        await wrapper.find('input[type="email"]').setValue('test@test.com');
        await wrapper.find('input[type="password"]').setValue('password');
        await wrapper.find('form').trigger('submit');

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain(errorMsg);
    });
});
