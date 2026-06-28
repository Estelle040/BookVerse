import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [userClubs, setUserClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Пробуем загрузить клубы пользователя
        loadUserClubs();
    }, [navigate]);

    const loadUserClubs = async () => {
        try {
            const response = await api.get('/api/clubs/user-clubs');
            setUserClubs(response.data);
        } catch (error) {
            console.log('Клубы пока не загружены (модуль в разработке)');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100">
            {/* Хедер */}
            <header className="glass border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center shadow-glass">
                                <span className="text-xl">📚</span>
                            </div>
                            <h1 className="text-2xl font-display font-semibold text-library-800">
                                Book Verse
                            </h1>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                        >
                            <span>🚪</span>
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Основной контент */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center animate-float">
                                <span className="text-3xl">📖</span>
                            </div>
                            <p className="text-library-600 text-lg animate-pulse">Загружаем вашу библиотеку...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        {/* Приветствие */}
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display font-semibold text-library-800 mb-4">
                                Добро пожаловать в Book Verse!
                            </h2>
                            <p className="text-library-500 text-lg max-w-2xl mx-auto">
                                Ваше пространство для чтения, обсуждения книг и встреч с единомышленниками
                            </p>
                        </div>

                        {/* Карточки модулей */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Клубы */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/clubs')}
                            >
                                <div className="text-4xl mb-4">👥</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Клубы</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Присоединяйтесь к книжным клубам или создайте свой
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>

                            {/* Книги */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/books')}
                            >
                                <div className="text-4xl mb-4">📚</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Книги</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Ищите и добавляйте книги в библиотеку клуба
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>

                            {/* Голосования */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/votes')}
                            >
                                <div className="text-4xl mb-4">🗳️</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Голосования</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Выбирайте книги для чтения всем клубом
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>

                            {/* Обсуждения */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/discussions')}
                            >
                                <div className="text-4xl mb-4">💬</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Обсуждения</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Обсуждайте книги и делитесь впечатлениями
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>

                            {/* Встречи */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/meetings')}
                            >
                                <div className="text-4xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Встречи</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Планируйте и посещайте встречи клуба
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>

                            {/* Прогресс */}
                            <div
                                className="glass rounded-2xl p-6 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer"
                                onClick={() => navigate('/progress')}
                            >
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-xl font-semibold text-library-800 mb-2">Прогресс чтения</h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Отслеживайте свой прогресс и соревнуйтесь
                                </p>
                                <div className="flex items-center text-amber-600 text-sm font-medium">
                                    <span>Открыть</span>
                                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </div>

                        {/* Статистика */}
                        {userClubs.length > 0 && (
                            <div className="mt-12 glass rounded-2xl p-6 shadow-glass">
                                <h3 className="text-xl font-semibold text-library-800 mb-4">
                                    Ваши клубы ({userClubs.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userClubs.map((club: any, index: number) => (
                                        <div key={index} className="p-4 glass-input rounded-xl">
                                            <h4 className="font-medium text-library-700">{club.name}</h4>
                                            <p className="text-sm text-library-500 mt-1">{club.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Футер */}
            <footer className="mt-auto border-t border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-library-400 text-sm">
                        © 2026 Book Verse. Все права защищены.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;