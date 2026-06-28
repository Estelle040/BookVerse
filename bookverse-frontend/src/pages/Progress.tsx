import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { ProgressViewDTO, ProgressWithBook } from '../types/progress';
import { ListBookDTO } from '../types/book';
import { ListClubDto } from '../types/club';
import GlassCard from '../components/ui/GlassCard';

const Progress: React.FC = () => {
    const navigate = useNavigate();
    const [myProgress, setMyProgress] = useState<ProgressWithBook[]>([]);
    const [clubs, setClubs] = useState<ListClubDto[]>([]);
    const [books, setBooks] = useState<ListBookDTO[]>([]);
    const [clubBooks, setClubBooks] = useState<ListBookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClub, setSelectedClub] = useState<number | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showStartModal, setShowStartModal] = useState(false);
    const [selectedProgress, setSelectedProgress] = useState<ProgressWithBook | null>(null);
    const [selectedBook, setSelectedBook] = useState<ListBookDTO | null>(null);
    const [newPage, setNewPage] = useState<number>(0);
    const [updating, setUpdating] = useState(false);
    const [clubProgress, setClubProgress] = useState<ProgressWithBook[]>([]);
    const [activeTab, setActiveTab] = useState<'my' | 'club'>('my');
    const [startingBook, setStartingBook] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [progressRes, clubsRes, booksRes] = await Promise.all([
                api.get<ProgressViewDTO[]>('/api/books/progress/my').catch(() => ({ data: [] })),
                api.get<ListClubDto[]>('/api/clubs/user-clubs').catch(() => ({ data: [] })),
                api.get<ListBookDTO[]>('/api/books/all').catch(() => ({ data: [] })),
            ]);

            const enrichedProgress = progressRes.data.map(p => {
                const book = booksRes.data.find(b => b.title === p.bookTitle);
                return {
                    ...p,
                    totalPages: book?.pages || 0,
                    percentage: book?.pages ? Math.round((p.currentPage / book.pages) * 100) : 0,
                    author: book?.author || '',
                    coverUrl: book?.coverUrl || '',
                };
            });

            setMyProgress(enrichedProgress);
            setClubs(clubsRes.data);
            setBooks(booksRes.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClubBooks = async (clubId: number) => {
        try {
            const response = await api.get<ListBookDTO[]>(`/api/clubs/${clubId}/books`).catch(() => ({ data: [] }));
            setClubBooks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки книг клуба:', error);
            setClubBooks([]);
        }
    };

    const loadClubProgress = async (clubId: number) => {
        try {
            setLoading(true);
            const booksRes = await api.get<ListBookDTO[]>(`/api/clubs/${clubId}/books`).catch(() => ({ data: [] }));
            const allProgress: ProgressWithBook[] = [];

            for (const book of booksRes.data) {
                if (!book.id) continue;
                try {
                    const res = await api.get<ProgressViewDTO>(`/api/clubs/progress/${clubId}/books/${book.id}`);
                    const enriched = {
                        ...res.data,
                        totalPages: book.pages,
                        percentage: book.pages ? Math.round((res.data.currentPage / book.pages) * 100) : 0,
                        author: book.author,
                        coverUrl: book.coverUrl || '',
                    };
                    allProgress.push(enriched);
                } catch (error) {
                    // Пропускаем книги без прогресса
                }
            }

            setClubProgress(allProgress);
        } catch (error) {
            console.error('Ошибка загрузки прогресса клуба:', error);
            setClubProgress([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTracking = (book: ListBookDTO) => {
        setSelectedBook(book);
        setNewPage(0);
        setShowStartModal(true);
    };

    const handleStartProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook || !selectedClub) return;

        setStartingBook(true);
        try {
            await api.post('/api/books/progress/update', {
                clubId: selectedClub,
                bookId: selectedBook.id,
                currentPage: newPage,
            });

            setShowStartModal(false);
            setSelectedBook(null);
            loadData();
            loadClubProgress(selectedClub);
        } catch (error: any) {
            console.error('Ошибка начала отслеживания:', error);
            alert('Ошибка при добавлении книги в прогресс');
        } finally {
            setStartingBook(false);
        }
    };

    const handleUpdateClick = (progress: ProgressWithBook) => {
        setSelectedProgress(progress);
        setNewPage(progress.currentPage);
        setShowUpdateModal(true);
    };

    const handleUpdateProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgress) return;

        setUpdating(true);
        try {
            await api.post('/api/books/progress/update', {
                clubId: selectedProgress.clubId,
                bookId: books.find(b => b.title === selectedProgress.bookTitle)?.id || '',
                currentPage: newPage,
            });

            setShowUpdateModal(false);
            loadData();
            if (selectedClub) {
                loadClubProgress(selectedClub);
            }
        } catch (error: any) {
            console.error('Ошибка обновления прогресса:', error);
            alert('Ошибка при обновлении прогресса');
        } finally {
            setUpdating(false);
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'from-green-400 to-green-500';
        if (percentage >= 75) return 'from-blue-400 to-blue-500';
        if (percentage >= 50) return 'from-amber-400 to-amber-500';
        if (percentage >= 25) return 'from-orange-400 to-orange-500';
        return 'from-red-400 to-red-500';
    };

    const getProgressEmoji = (percentage: number) => {
        if (percentage >= 100) return '🎉';
        if (percentage >= 75) return '📖';
        if (percentage >= 50) return '📘';
        if (percentage >= 25) return '📄';
        return '📚';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && myProgress.length === 0 && clubProgress.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                        <span className="text-4xl">📊</span>
                    </div>
                    <p className="text-library-600 text-lg animate-pulse">Загружаем прогресс...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100">
            {/* Хедер */}
            <header className="glass border-b border-white/20 sticky top-0 z-10 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-10 h-10 glass rounded-xl flex items-center justify-center shadow-glass hover:bg-white/30 transition-all duration-300"
                                title="На главную"
                            >
                                <span className="text-lg">🏠</span>
                            </button>
                            <div>
                                <h1 className="text-2xl font-display font-semibold text-library-800">
                                    Прогресс чтения
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    Отслеживайте свой путь в мире книг
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Табы */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeTab === 'my'
                                    ? 'bg-amber-400 text-white shadow-lg'
                                    : 'glass-input text-library-600 hover:bg-white/30'
                            }`}
                        >
                            👤 Мой прогресс
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('club');
                                if (clubs.length > 0 && !selectedClub) {
                                    const firstClubId = clubs[0].id!;
                                    setSelectedClub(firstClubId);
                                    loadClubProgress(firstClubId);
                                    loadClubBooks(firstClubId);
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeTab === 'club'
                                    ? 'bg-amber-400 text-white shadow-lg'
                                    : 'glass-input text-library-600 hover:bg-white/30'
                            }`}
                        >
                            👥 Прогресс клуба
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'club' && (
                    <>
                        <div className="glass rounded-2xl p-4 sm:p-6 mb-8 shadow-glass">
                            <label className="block text-library-700 text-sm font-medium mb-3">
                                Выберите клуб
                            </label>
                            <select
                                value={selectedClub || ''}
                                onChange={(e) => {
                                    const clubId = Number(e.target.value);
                                    setSelectedClub(clubId);
                                    loadClubProgress(clubId);
                                    loadClubBooks(clubId);
                                }}
                                className="w-full px-4 py-3 glass-input rounded-xl text-library-700 focus:outline-none cursor-pointer"
                            >
                                {clubs.length === 0 ? (
                                    <option value="">Нет доступных клубов</option>
                                ) : (
                                    clubs.map((club) => (
                                        <option key={club.id} value={club.id}>
                                            {club.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Книги клуба для начала отслеживания */}
                        {clubBooks.length > 0 && (
                            <div className="glass rounded-2xl p-4 sm:p-6 mb-8 shadow-glass">
                                <h3 className="text-lg font-semibold text-library-800 mb-4">
                                    Книги клуба
                                </h3>
                                <p className="text-library-500 text-sm mb-4">
                                    Выберите книгу, чтобы начать отслеживать прогресс
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {clubBooks.map((book) => {
                                        const hasProgress = myProgress.some(p => p.bookTitle === book.title);
                                        return (
                                            <button
                                                key={book.id}
                                                onClick={() => !hasProgress && handleStartTracking(book)}
                                                disabled={hasProgress}
                                                className={`p-3 rounded-xl text-center transition-all ${
                                                    hasProgress
                                                        ? 'glass-input opacity-50 cursor-not-allowed'
                                                        : 'glass-input hover:bg-white/30 cursor-pointer'
                                                }`}
                                            >
                                                <span className="text-2xl block mb-1">{hasProgress ? '✅' : '📖'}</span>
                                                <p className="text-xs text-library-700 truncate">{book.title}</p>
                                                {hasProgress && (
                                                    <p className="text-xs text-green-600 mt-1">Отслеживается</p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Статистика */}
                {activeTab === 'my' && myProgress.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <GlassCard className="text-center">
                            <div className="text-3xl mb-2">📚</div>
                            <div className="text-3xl font-bold text-library-800">{myProgress.length}</div>
                            <div className="text-library-500 text-sm">Всего книг</div>
                        </GlassCard>

                        <GlassCard className="text-center">
                            <div className="text-3xl mb-2">📄</div>
                            <div className="text-3xl font-bold text-library-800">
                                {myProgress.reduce((sum, p) => sum + p.currentPage, 0)}
                            </div>
                            <div className="text-library-500 text-sm">Прочитано страниц</div>
                        </GlassCard>

                        <GlassCard className="text-center">
                            <div className="text-3xl mb-2">🎯</div>
                            <div className="text-3xl font-bold text-library-800">
                                {Math.round(myProgress.reduce((sum, p) => sum + (p.percentage || 0), 0) / myProgress.length)}%
                            </div>
                            <div className="text-library-500 text-sm">Средний прогресс</div>
                        </GlassCard>
                    </div>
                )}

                {/* Список прогресса */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center animate-float">
                            <span className="text-3xl">📊</span>
                        </div>
                        <p className="text-library-600">Загружаем...</p>
                    </div>
                ) : (activeTab === 'my' ? myProgress : clubProgress).length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">📖</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            {activeTab === 'my' ? 'Нет прогресса чтения' : 'Нет данных по клубу'}
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            {activeTab === 'my'
                                ? 'Перейдите на вкладку "Прогресс клуба", выберите клуб и начните отслеживать чтение'
                                : 'Участники клуба ещё не начали отмечать прогресс'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(activeTab === 'my' ? myProgress : clubProgress).map((progress, index) => {
                            const percentage = Math.min(progress.percentage || 0, 100);
                            const colorGradient = getProgressColor(percentage);

                            return (
                                <GlassCard key={progress.id || index}>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-20 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-library-100 to-parchment-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                                            {progress.coverUrl ? (
                                                <img
                                                    src={getImageUrl(progress.coverUrl)}
                                                    alt={progress.bookTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-3xl">{getProgressEmoji(percentage)}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-display font-semibold text-library-800 text-lg">
                                                        {progress.bookTitle}
                                                    </h3>
                                                    {progress.author && (
                                                        <p className="text-library-500 text-sm">{progress.author}</p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                          <span className="text-2xl font-bold text-library-800">
                            {percentage}%
                          </span>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <div className="flex justify-between text-xs text-library-500 mb-1">
                                                    <span>{progress.currentPage} стр.</span>
                                                    <span>{progress.totalPages || '?'} стр.</span>
                                                </div>
                                                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${colorGradient} rounded-full transition-all duration-1000 flex items-center justify-end pr-2`}
                                                        style={{ width: `${Math.max(percentage, 1)}%` }}
                                                    >
                                                        {percentage > 15 && (
                                                            <span className="text-white text-xs font-medium">
                                {getProgressEmoji(percentage)}
                              </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-library-400">
                                                <span>👤 {progress.username}</span>
                                                <span>🕐 {formatDate(progress.updatedAt)}</span>
                                            </div>

                                            {activeTab === 'my' && (
                                                <button
                                                    onClick={() => handleUpdateClick(progress)}
                                                    className="mt-3 w-full px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm"
                                                >
                                                    ✏️ Обновить прогресс
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Модальное окно начала отслеживания */}
            {showStartModal && selectedBook && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowStartModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        Начать читать
                                    </h2>
                                    <p className="text-library-500 text-sm">{selectedBook.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowStartModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleStartProgress} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        На какой странице вы сейчас?
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={selectedBook.pages || 9999}
                                        value={newPage}
                                        onChange={(e) => setNewPage(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none text-center text-2xl"
                                    />
                                    <div className="flex justify-between text-xs text-library-400 mt-2">
                                        <span>0</span>
                                        <span>из {selectedBook.pages || '?'} страниц</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowStartModal(false)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={startingBook}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {startingBook ? 'Добавление...' : 'Начать'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно обновления прогресса */}
            {showUpdateModal && selectedProgress && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowUpdateModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        Обновить прогресс
                                    </h2>
                                    <p className="text-library-500 text-sm">{selectedProgress.bookTitle}</p>
                                </div>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProgress} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Текущая страница
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max={selectedProgress.totalPages || 9999}
                                        value={newPage}
                                        onChange={(e) => setNewPage(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none text-center text-2xl"
                                    />
                                    <div className="flex justify-between text-xs text-library-400 mt-2">
                                        <span>0</span>
                                        <span>из {selectedProgress.totalPages || '?'} страниц</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {[25, 50, 75, 100].map((percent) => {
                                        const page = Math.round((selectedProgress.totalPages || 100) * percent / 100);
                                        return (
                                            <button
                                                key={percent}
                                                type="button"
                                                onClick={() => setNewPage(page)}
                                                className="px-2 py-2 glass-input rounded-xl text-sm text-library-600 hover:bg-white/30 transition-all"
                                            >
                                                {percent}%
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Progress;