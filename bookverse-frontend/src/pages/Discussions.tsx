import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ThreadResponseDTO, CreateThreadDTO, MessageResponseDTO } from '../types/discussion';
import { ListClubDto } from '../types/club';
import { ListBookDTO } from '../types/book';
import GlassCard from '../components/ui/GlassCard';

const Discussions: React.FC = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<ListClubDto[]>([]);
    const [selectedClub, setSelectedClub] = useState<ListClubDto | null>(null);
    const [threads, setThreads] = useState<ThreadResponseDTO[]>([]);
    const [books, setBooks] = useState<ListBookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedThread, setSelectedThread] = useState<ThreadResponseDTO | null>(null);
    const [messages, setMessages] = useState<MessageResponseDTO[]>([]);
    const [newThread, setNewThread] = useState<CreateThreadDTO>({
        clubId: 0,
        bookId: '',
        title: '',
    });
    const [newMessage, setNewMessage] = useState('');
    const [creating, setCreating] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadClubs();
        loadBooks();
    }, [navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadClubs = async () => {
        try {
            const response = await api.get<ListClubDto[]>('/api/clubs/user-clubs');
            setClubs(response.data);
            if (response.data.length > 0 && !selectedClub) {
                setSelectedClub(response.data[0]);
                setNewThread(prev => ({ ...prev, clubId: response.data[0].id || 0 }));
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

    const loadThreads = async (clubId: number) => {
        try {
            setLoading(true);
            const response = await api.get<ThreadResponseDTO[]>(`/api/discussions/club/${clubId}`);
            setThreads(response.data);
        } catch (error) {
            console.error('Ошибка загрузки обсуждений:', error);
            setThreads([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (threadId: number) => {
        try {
            const response = await api.get<MessageResponseDTO[]>(`/api/discussions/${threadId}/messages`);
            setMessages(response.data);
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
            setMessages([]);
        }
    };

    useEffect(() => {
        if (selectedClub?.id) {
            loadThreads(selectedClub.id);
            setNewThread(prev => ({ ...prev, clubId: selectedClub.id || 0 }));
        }
    }, [selectedClub]);

    // Автообновление сообщений каждые 3 секунды
    useEffect(() => {
        if (showChatModal && selectedThread) {
            const interval = setInterval(() => {
                loadMessages(selectedThread.id);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [showChatModal, selectedThread]);

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClub) return;

        setCreating(true);
        try {
            await api.post('/api/discussions/create', newThread);

            setShowCreateModal(false);
            setNewThread({
                clubId: selectedClub.id || 0,
                bookId: '',
                title: '',
            });
            loadThreads(selectedClub.id!);
        } catch (error: any) {
            console.error('Ошибка создания обсуждения:', error);
            alert('Ошибка при создании обсуждения');
        } finally {
            setCreating(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread) return;

        setSending(true);
        try {
            await api.post('/api/discussions/message', {
                threadId: selectedThread.id,
                message: newMessage.trim(),
            });

            setNewMessage('');
            loadMessages(selectedThread.id);
        } catch (error: any) {
            console.error('Ошибка отправки сообщения:', error);
            alert('Ошибка при отправке сообщения');
        } finally {
            setSending(false);
        }
    };

    const handleOpenChat = async (thread: ThreadResponseDTO) => {
        setSelectedThread(thread);
        await loadMessages(thread.id);
        setShowChatModal(true);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && !selectedClub) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                        <span className="text-4xl">💬</span>
                    </div>
                    <p className="text-library-600 text-lg animate-pulse">Загружаем обсуждения...</p>
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
                                    Обсуждения
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    Обсуждайте книги с участниками клуба
                                </p>
                            </div>
                        </div>

                        {selectedClub && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                            >
                                <span className="text-lg">+</span>
                                <span className="hidden sm:inline">Новое обсуждение</span>
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

                {/* Список обсуждений */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center animate-float">
                            <span className="text-3xl">💬</span>
                        </div>
                        <p className="text-library-600">Загружаем обсуждения...</p>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">💬</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            Нет обсуждений
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            Создайте тему для обсуждения книги с участниками клуба
                        </p>
                        {selectedClub && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                + Новое обсуждение
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {threads.map((thread) => (
                            <GlassCard
                                key={thread.id}
                                className="cursor-pointer hover:shadow-glass-hover transition-all duration-300"
                                onClick={() => handleOpenChat(thread)}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 glass rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display font-semibold text-library-800 text-lg mb-1 truncate">
                                            {thread.title}
                                        </h3>
                                        <p className="text-library-500 text-sm">
                                            📖 {thread.bookTitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-library-400">
                                    <span>🕐 {formatDateTime(thread.createdAt)}</span>
                                    <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Открыть чат →
                  </span>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </main>

            {/* Модальное окно создания обсуждения */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Новое обсуждение
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateThread} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название темы *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newThread.title}
                                        onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Например: Впечатления от первой главы"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Книга *
                                    </label>
                                    <select
                                        required
                                        value={newThread.bookId}
                                        onChange={(e) => setNewThread({ ...newThread, bookId: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-700 focus:outline-none cursor-pointer"
                                    >
                                        <option value="">Выберите книгу...</option>
                                        {books.map((book) => (
                                            <option key={book.id} value={book.id}>
                                                {book.title} - {book.author}
                                            </option>
                                        ))}
                                    </select>
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
                                        {creating ? 'Создание...' : 'Создать'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно чата */}
            {showChatModal && selectedThread && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowChatModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl h-[80vh] flex flex-col">
                        <GlassCard className="flex flex-col h-full p-0 overflow-hidden">
                            {/* Заголовок чата */}
                            <div className="flex justify-between items-center p-4 border-b border-white/20">
                                <div>
                                    <h2 className="text-xl font-display font-semibold text-library-800">
                                        {selectedThread.title}
                                    </h2>
                                    <p className="text-library-500 text-sm">📖 {selectedThread.bookTitle}</p>
                                </div>
                                <button
                                    onClick={() => setShowChatModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Сообщения */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="text-4xl mb-4 block">💬</span>
                                        <p className="text-library-500">Нет сообщений. Начните обсуждение!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="w-8 h-8 glass rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm">👤</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                          <span className="text-library-800 font-medium text-sm">
                            {msg.username}
                          </span>
                                                    <span className="text-library-400 text-xs">
                            {formatDateTime(msg.createdAt)}
                          </span>
                                                </div>
                                                <p className="text-library-700 text-sm break-words">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Поле ввода */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Введите сообщение..."
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? '...' : '📤'}
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

export default Discussions;