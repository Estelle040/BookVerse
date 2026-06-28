import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/layout/AuthLayout';
import { RegisterRequest } from '../types/auth';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterRequest>({
        login: '',
        password: '',
        role: 'USER', // По умолчанию USER
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            navigate('/login', {
                state: { message: 'Регистрация успешна! Добро пожаловать в Book Verse.' }
            });
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Ошибка при регистрации. Возможно, такой пользователь уже существует.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Присоединяйтесь"
            subtitle="Станьте частью книжного сообщества"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-400/10 backdrop-blur-md border border-red-400/20 text-red-600 px-4 py-3 rounded-2xl text-sm animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-library-700 text-sm font-medium ml-1">
                        Логин
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-library-400">👤</span>
                        <input
                            type="text"
                            required
                            value={formData.login}
                            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-library-800 placeholder-library-400 font-light"
                            placeholder="Придумайте логин"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-library-700 text-sm font-medium ml-1">
                        Пароль
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-library-400">🔒</span>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 glass-input rounded-2xl text-library-800 placeholder-library-400 font-light"
                            placeholder="Придумайте пароль"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Создаём аккаунт...
            </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
              <span>Зарегистрироваться</span>
              <span>✨</span>
            </span>
                    )}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-library-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 text-library-400 bg-white/50 backdrop-blur-sm rounded-full">или</span>
                    </div>
                </div>

                <div className="text-center text-sm text-library-500">
                    Уже есть аккаунт?{' '}
                    <Link
                        to="/login"
                        className="text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300 underline decoration-amber-300 underline-offset-4"
                    >
                        Войти
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;