import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {ShortVoteDTO, StartVote, VoteResultDTO, VotedBookDTO, OptionResult} from '../types/vote';
import { ListClubDto } from '../types/club';
import { ListBookDTO } from '../types/book';
import GlassCard from '../components/ui/GlassCard';

const Votes: React.FC = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<ListClubDto[]>([]);
    const [selectedClub, setSelectedClub] = useState<ListClubDto | null>(null);
    const [votes, setVotes] = useState<ShortVoteDTO[]>([]);
    const [books, setBooks] = useState<ListBookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [showAddBookModal, setShowAddBookModal] = useState(false);
    const [selectedVote, setSelectedVote] = useState<ShortVoteDTO | null>(null);
    const [voteResults, setVoteResults] = useState<VoteResultDTO | null>(null);
    const [newVote, setNewVote] = useState<StartVote>({
        name: '',
        start: '',
        end: '',
        club_name: '',
        description: '',
    });
    const [selectedBooksForVote, setSelectedBooksForVote] = useState<string[]>([]);
    const [votingLoading, setVotingLoading] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadClubs();
        loadBooks();
    }, [navigate]);

    const loadClubs = async () => {
        try {
            const response = await api.get<ListClubDto[]>('/api/clubs/user-clubs');
            setClubs(response.data);
            if (response.data.length > 0 && !selectedClub) {
                setSelectedClub(response.data[0]);
            }
        } catch (error) {
            console.error('Ошибка загрузки клубов:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBooks = async () => {
        try {
            const response = await api.get<ListBookDTO[]>('/api/books/all');
            setBooks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки книг:', error);
        }
    };

    const loadVotes = async (clubId: number) => {
        try {
            setLoading(true);
            const response = await api.get<ShortVoteDTO[]>(`/api/votes/${clubId}`);
            setVotes(response.data);
        } catch (error) {
            console.error('Ошибка загрузки голосований:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClub?.id) {
            loadVotes(selectedClub.id);
        }
    }, [selectedClub]);

    const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleCreateVote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClub) return;

        setCreating(true);
        try {
            // Создаём голосование
            await api.post('/api/votes/start', {
                name: newVote.name,
                start: newVote.start + ':00',
                end: newVote.end + ':00',
                club_name: selectedClub.name,
                description: newVote.description,
            });

            // Получаем обновлённый список голосований
            const updatedVotes = await api.get<ShortVoteDTO[]>(`/api/votes/${selectedClub.id}`);
            const createdVote = updatedVotes.data.find(v => v.name === newVote.name);

            // Добавляем выбранные книги в голосование
            if (createdVote && selectedBooksForVote.length > 0) {
                for (const bookId of selectedBooksForVote) {
                    await api.post(`/api/votes/add/${createdVote.id}/${bookId}`).catch(err => {
                        console.error(`Ошибка добавления книги ${bookId}:`, err);
                    });
                }
            }

            setShowCreateModal(false);
            setNewVote({
                name: '',
                start: '',
                end: '',
                club_name: '',
                description: '',
            });
            setSelectedBooksForVote([]);
            loadVotes(selectedClub.id!);
        } catch (error: any) {
            console.error('Ошибка создания голосования:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Ошибка при создании голосования: ' + (error.response?.data?.message || 'Неизвестная ошибка'));
            }
        } finally {
            setCreating(false);
        }
    };

    const handleAddBookToVote = async (bookId: string) => {
        if (!selectedVote?.id) return;

        try {
            await api.post(`/api/votes/add/${selectedVote.id}/${bookId}`);
            if (selectedClub?.id) {
                loadVotes(selectedClub.id);
            }
        } catch (error) {
            console.error('Ошибка добавления книги:', error);
            alert('Ошибка при добавлении книги в голосование');
        }
    };

    const handleVote = async (voteId: number, optionIndex: number) => {
        setVotingLoading(voteId);
        try {
            await api.post<VotedBookDTO>(`/api/votes/${voteId}/vote/${optionIndex}`);
            if (selectedClub?.id) {
                loadVotes(selectedClub.id);
            }
        } catch (error: any) {
            console.error('Ошибка голосования:', error);
            const message = error.response?.data?.message || 'Вы уже проголосовали или голосование неактивно';
            alert(message);
        } finally {
            setVotingLoading(null);
        }
    };

    const handleShowResults = async (vote: ShortVoteDTO) => {
        setSelectedVote(vote);
        try {
            const response = await api.get<VoteResultDTO>(`/api/votes/${vote.id}/results`);
            setVoteResults(response.data);
            setShowResultsModal(true);
        } catch (error) {
            console.error('Ошибка загрузки результатов:', error);
        }
    };

    const handleEndVote = async (voteId: number) => {
        if (!confirm('Завершить голосование?')) return;

        try {
            await api.post(`/api/votes/end/${voteId}`);
            if (selectedClub?.id) {
                loadVotes(selectedClub.id);
            }
        } catch (error) {
            console.error('Ошибка завершения голосования:', error);
            alert('Ошибка при завершении голосования');
        }
    };

    const toggleBookSelection = (bookId: string) => {
        setSelectedBooksForVote(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        );
    };

    const getStatusBadge = (vote: ShortVoteDTO) => {
        const now = new Date();
        const end = new Date(vote.end);

        if (vote.status === 'FINISHED' || now > end) {
            return { text: 'Завершено', color: 'bg-gray-400/20 text-gray-700 border-gray-400/30' };
        } else if (vote.status === 'WAITING' || now < new Date(vote.start)) {
            return { text: 'Ожидает', color: 'bg-yellow-400/20 text-yellow-700 border-yellow-400/30' };
        } else {
            return { text: 'Активно', color: 'bg-green-400/20 text-green-700 border-green-400/30' };
        }
    };

    const getMaxScore = (results: OptionResult[]) => {
        return Math.max(...results.map(r => r.score), 1);
    };

    const getTodayString = () => {
        const now = new Date();
        return formatDateTime(now).slice(0, 16);
    };

    const getWeekLaterString = () => {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        return formatDateTime(now).slice(0, 16);
    };

    if (loading && !selectedClub) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                        <span className="text-4xl">🗳️</span>
                    </div>
                    <p className="text-library-600 text-lg animate-pulse">Загружаем...</p>
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
                                    Голосования
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    Выбирайте книги для чтения
                                </p>
                            </div>
                        </div>

                        {selectedClub && (
                            <button
                                onClick={() => {
                                    setNewVote({
                                        name: '',
                                        start: getTodayString(),
                                        end: getWeekLaterString(),
                                        club_name: '',
                                        description: '',
                                    });
                                    setSelectedBooksForVote([]);
                                    setShowCreateModal(true);
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                            >
                                <span className="text-lg">+</span>
                                <span className="hidden sm:inline">Создать голосование</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Выбор клуба */}
                <div className="glass rounded-2xl p-4 sm:p-6 mb-8 shadow-glass">
                    <label className="block text-library-700 text-sm font-medium mb-3">
                        Выберите клуб
                    </label>
                    <select
                        value={selectedClub?.id || ''}
                        onChange={(e) => {
                            const club = clubs.find(c => c.id === Number(e.target.value));
                            setSelectedClub(club || null);
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

                {/* Список голосований */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center animate-float">
                            <span className="text-3xl">🗳️</span>
                        </div>
                        <p className="text-library-600">Загружаем голосования...</p>
                    </div>
                ) : votes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">🗳️</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            Нет голосований
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            Создайте голосование, чтобы выбрать книгу для чтения в клубе
                        </p>
                        {selectedClub && (
                            <button
                                onClick={() => {
                                    setNewVote({
                                        name: '',
                                        start: getTodayString(),
                                        end: getWeekLaterString(),
                                        club_name: '',
                                        description: '',
                                    });
                                    setSelectedBooksForVote([]);
                                    setShowCreateModal(true);
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                + Создать голосование
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {votes.map((vote) => {
                            const status = getStatusBadge(vote);
                            const now = new Date();
                            const isActive = vote.status === 'ACTIVE' && new Date(vote.start) <= now && new Date(vote.end) > now;
                            const isFinished = vote.status === 'FINISHED' || now > new Date(vote.end);

                            return (
                                <GlassCard key={vote.id}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-display font-semibold text-library-800">
                                                    {vote.name}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs border ${status.color}`}>
                          {status.text}
                        </span>
                                            </div>
                                            <p className="text-library-600 text-sm mb-3">
                                                {vote.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-library-500">
                                                <span>📅 {new Date(vote.start).toLocaleDateString('ru-RU')}</span>
                                                <span>→ {new Date(vote.end).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {!isFinished && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedVote(vote);
                                                        setShowAddBookModal(true);
                                                    }}
                                                    className="px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm whitespace-nowrap"
                                                >
                                                    + Книги
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleShowResults(vote)}
                                                className="px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm whitespace-nowrap"
                                            >
                                                📊 Результаты
                                            </button>
                                            {isActive && (
                                                <button
                                                    onClick={() => handleEndVote(vote.id!)}
                                                    className="px-4 py-2 bg-red-400/20 border border-red-400/30 text-red-700 rounded-xl hover:bg-red-400/30 transition-all text-sm whitespace-nowrap"
                                                >
                                                    🏁 Завершить
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Опции для голосования */}
                                    {isActive && vote.optionList && vote.optionList.length > 0 && (
                                        <div className="border-t border-white/20 pt-4">
                                            <h4 className="text-sm font-medium text-library-700 mb-3">
                                                Доступные варианты:
                                            </h4>
                                            <div className="space-y-2">
                                                {vote.optionList.map((option, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleVote(vote.id!, index + 1)}
                                                        disabled={votingLoading === vote.id}
                                                        className="w-full flex items-center justify-between p-3 glass-input rounded-xl hover:bg-white/30 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">📖</span>
                                                            <div>
                                                                <p className="text-library-800 font-medium">{option}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Голосовать →
                            </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isFinished && (
                                        <div className="border-t border-white/20 pt-4 text-center">
                                            <p className="text-library-500 text-sm">Голосование завершено</p>
                                        </div>
                                    )}
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Модальное окно создания голосования */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-8">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Новое голосование
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateVote} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newVote.name}
                                        onChange={(e) => setNewVote({ ...newVote, name: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Например: Выбираем книгу на июнь"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={newVote.description}
                                        onChange={(e) => setNewVote({ ...newVote, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[80px] resize-none"
                                        placeholder="Опишите голосование..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-library-700 text-sm font-medium mb-2">
                                            Дата начала
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newVote.start}
                                            onChange={(e) => setNewVote({ ...newVote, start: e.target.value })}
                                            max="9999-12-31T23:59"
                                            className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-library-700 text-sm font-medium mb-2">
                                            Дата окончания
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={newVote.end}
                                            onChange={(e) => setNewVote({ ...newVote, end: e.target.value })}
                                            max="9999-12-31T23:59"
                                            className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Выбор книг */}
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Выберите книги для голосования
                                    </label>
                                    <p className="text-library-400 text-xs mb-3">
                                        Выбрано: {selectedBooksForVote.length} книг
                                    </p>
                                    <div className="max-h-48 overflow-y-auto space-y-2 border border-white/20 rounded-xl p-2">
                                        {books.length === 0 ? (
                                            <p className="text-library-400 text-sm text-center py-4">
                                                Книги не найдены. Сначала добавьте книги в библиотеку.
                                            </p>
                                        ) : (
                                            books.map((book) => (
                                                <label
                                                    key={book.id}
                                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                                                        selectedBooksForVote.includes(book.id!)
                                                            ? 'bg-amber-400/20 border border-amber-400/30'
                                                            : 'hover:bg-white/10 border border-transparent'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBooksForVote.includes(book.id!)}
                                                        onChange={() => toggleBookSelection(book.id!)}
                                                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-library-800 text-sm font-medium truncate">
                                                            {book.title}
                                                        </p>
                                                        <p className="text-library-500 text-xs truncate">
                                                            {book.author}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {creating ? 'Создание...' : 'Создать голосование'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно добавления книг в существующее голосование */}
            {showAddBookModal && selectedVote && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowAddBookModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        Добавить книги
                                    </h2>
                                    <p className="text-library-500 text-sm">{selectedVote.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowAddBookModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {books
                                    .filter(book => !selectedVote.optionList?.includes(book.title))
                                    .map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => handleAddBookToVote(book.id!)}
                                            className="w-full flex items-center gap-3 p-3 glass-input rounded-xl hover:bg-white/30 transition-all text-left group"
                                        >
                                            <span className="text-2xl">📖</span>
                                            <div className="flex-1">
                                                <p className="text-library-800 font-medium">{book.title}</p>
                                                <p className="text-library-500 text-sm">{book.author}</p>
                                            </div>
                                            <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        + Добавить
                      </span>
                                        </button>
                                    ))
                                }
                                {books.filter(book => !selectedVote.optionList?.includes(book.title)).length === 0 && (
                                    <div className="text-center py-8">
                                        <span className="text-4xl mb-4 block">📚</span>
                                        <p className="text-library-500">Все книги уже добавлены</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно результатов */}
            {showResultsModal && voteResults && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowResultsModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        Результаты
                                    </h2>
                                    <p className="text-library-500 text-sm">{voteResults.voteTitle}</p>
                                </div>
                                <button
                                    onClick={() => setShowResultsModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            {voteResults.results.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-4 block">📊</span>
                                    <p className="text-library-500">Пока нет голосов</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {voteResults.results.map((result, index) => {
                                        const maxScore = getMaxScore(voteResults.results);
                                        const percentage = Math.round((result.score / maxScore) * 100);

                                        return (
                                            <div key={index}>
                                                <div className="flex justify-between items-center mb-2">
                          <span className="text-library-800 font-medium text-sm flex items-center gap-2">
                            {index === 0 && maxScore > 0 && '👑 '}
                              {result.bookTitle}
                          </span>
                                                    <span className="text-library-600 text-sm font-medium">
                            {result.score} голосов
                          </span>
                                                </div>
                                                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                                                        style={{ width: `${Math.max(percentage, 2)}%` }}
                                                    >
                                                        {percentage > 10 && (
                                                            <span className="text-white text-xs font-medium">
                                {percentage}%
                              </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Votes;