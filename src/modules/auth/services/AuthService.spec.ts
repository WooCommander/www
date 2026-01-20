import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { supabase } from '../../../shared/api/supabase';

// Mock the supabase client
vi.mock('../../../shared/api/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            getUser: vi.fn(),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
        }
    }
}));

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should sign in with email and password', async () => {
        const mockEmail = 'test@example.com';
        const mockPassword = 'password123';
        const mockResponse = { data: { user: { id: '1' } }, error: null };
        (supabase.auth.signInWithPassword as any).mockResolvedValue(mockResponse);

        const result = await AuthService.signIn(mockEmail, mockPassword);

        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: mockEmail,
            password: mockPassword
        });
        expect(result).toEqual({ error: null });
    });

    it('should return error when sign in fails', async () => {
        const mockError = { message: 'Invalid login' };
        (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: null, error: mockError });

        const result = await AuthService.signIn('fail@test.com', 'wrongpass');

        expect(result).toEqual({ error: mockError });
    });

    it('should sign up with email and password', async () => {
        const mockEmail = 'new@example.com';
        const mockPassword = 'newpassword';
        const mockResponse = { data: { user: { id: '2' } }, error: null };
        (supabase.auth.signUp as any).mockResolvedValue(mockResponse);

        const result = await AuthService.signUp(mockEmail, mockPassword);

        expect(supabase.auth.signUp).toHaveBeenCalledWith({
            email: mockEmail,
            password: mockPassword
        });
        expect(result).toEqual({ error: null });
    });

    it('should sign out', async () => {
        (supabase.auth.signOut as any).mockResolvedValue({ error: null });

        const result = await AuthService.signOut();

        expect(supabase.auth.signOut).toHaveBeenCalled();
        expect(result).toEqual({ error: null });
    });
});
