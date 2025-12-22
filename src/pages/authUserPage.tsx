import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginUser } from '../features/authApi';
import { useNavigate } from '@tanstack/react-router';

const authSchema = z.object({
    username: z.string().min(4, 'Username must be at least 4 characters long'),
    password: z.string().min(1, 'Password must be at least 6 characters long'),
});
type AuthFormData = z.infer<typeof authSchema>;

export function AuthUserPage() {
    const navigate = useNavigate();
    const loginUserMutation = useLoginUser();
    const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    });

    const onSubmit = (data: AuthFormData) => {
        const payload = {
            login: data.username,
            password: data.password
        }
        loginUserMutation.mutate(payload, {
            // 3. Обрабатываем успешный вход
            onSuccess: () => {
                // Если есть параметр redirect (через useSearch), можно использовать его:
                // navigate({ to: search.redirect || '/recipes' });
                
                // Иначе просто переходим на рецепты:
                navigate({ to: '/profile/arranged-reception/dashboard' });
            },
            onError: (error) => {
                alert('Login failed: ' + error.message);
            }
    });

    };
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">User Authentication</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <div>
                    <label htmlFor="username" className="block font-medium">Username</label>
                    <input
                        id="username"
                        type="username"
                        {...register('username')}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="block font-medium">Password</label>
                    <input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <button 
                    type="submit" 
                    disabled={loginUserMutation.isPending} 
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    {loginUserMutation.isPending ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}