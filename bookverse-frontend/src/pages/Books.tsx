import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { ListBookDTO, SaveBookDTO, UpdateBookDTO } from '../types/book';
import GlassCard from '../components/ui/GlassCard';

const Books: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<ListBookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'title' | 'author'>('title');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBook, setNewBook] = useState<SaveBookDTO>({
        title: '',
        author: '',
        pages: 0,
        description: '',
    });
    const [selectedBook, setSelectedBook] = useState<ListBookDTO | null>(null);
    const [uploadingBooks, setUploadingBooks] = useState<Record<string, boolean>>({});

    // Новые состояния для редактирования
    const [editingBook, setEditingBook] = useState<ListBookDTO | null>(null);
    const [editForm, setEditForm] = useState<UpdateBookDTO>({
        title: '',
        author: '',
        pages: 0,
        description: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadBooks();
    }, [navigate]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get<ListBookDTO[]>('/api/books/all');
            setBooks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки книг:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadBooks();
            return;
        }

        try {
            setLoading(true);
            const endpoint = searchType === 'title'
                ? `/api/books/title/${searchQuery}`
                : `/api/books/author/${searchQuery}`;

            const response = await api.get<ListBookDTO[]>(endpoint);
            setBooks(response.data);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            loadBooks();
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post('/api/books/save', {
                title: newBook.title,
                author: newBook.author,
                pages: newBook.pages,
                description: newBook.description
            });

            setShowAddModal(false);
            setNewBook({ title: '', author: '', pages: 0, description: '' });
            loadBooks();
        } catch (error) {
            console.error('Ошибка добавления книги:', error);
            alert('Ошибка при добавлении книги');
        }
    };

    const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>, book: ListBookDTO) => {
        const file = e.target.files?.[0];
        if (!file || !book.id) return;

        setUploadingBooks(prev => ({ ...prev, [book.id!]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post(`/api/books/${book.id}/cover`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await loadBooks();
        } catch (error) {
            console.error('Ошибка загрузки обложки:', error);
            alert('Ошибка при загрузке обложки');
        } finally {
            setUploadingBooks(prev => ({ ...prev, [book.id!]: false }));
            e.target.value = '';
        }
    };

    // Открыть модальное окно редактирования
    const handleEditClick = (book: ListBookDTO) => {
        setEditingBook(book);
        setEditForm({
            title: book.title,
            author: book.author,
            pages: book.pages,
            description: book.description,
        });
    };

    // Сохранить изменения
    const handleUpdateBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBook?.id) return;

        setSaving(true);
        try {
            await api.put(`/api/books/${editingBook.id}`, editForm);
            setEditingBook(null);
            loadBooks();
        } catch (error) {
            console.error('Ошибка обновления книги:', error);
            alert('Ошибка при обновлении книги');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

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
                                    Библиотека
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    {books.length} {books.length === 1 ? 'книга' : books.length >= 2 && books.length <= 4 ? 'книги' : 'книг'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <span className="text-lg">+</span>
                            <span className="hidden sm:inline">Добавить книгу</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Поиск */}
                <div className="glass rounded-2xl p-4 sm:p-6 mb-8 shadow-glass">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value as 'title' | 'author')}
                            className="px-4 py-3 glass-input rounded-xl text-library-700 focus:outline-none cursor-pointer"
                        >
                            <option value="title">По названию</option>
                            <option value="author">По автору</option>
                        </select>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={searchType === 'title' ? 'Название книги...' : 'Имя автора...'}
                                className="w-full px-4 py-3 pr-12 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all"
                            >
                                <span>🔍</span>
                            </button>
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 sm:hidden"
                        >
                            Найти
                        </button>
                    </div>
                </div>

                {/* Список книг */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                                <span className="text-4xl">📖</span>
                            </div>
                            <p className="text-library-600 text-lg animate-pulse">Загружаем библиотеку...</p>
                        </div>
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">📚</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            {searchQuery ? 'Книги не найдены' : 'Библиотека пуста'}
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            {searchQuery
                                ? 'Попробуйте изменить поисковый запрос или поискать по другому параметру'
                                : 'Добавьте первую книгу в библиотеку, чтобы начать'}
                        </p>
                        {searchQuery ? (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    loadBooks();
                                }}
                                className="px-6 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all"
                            >
                                Показать все книги
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                + Добавить книгу
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.map((book, index) => (
                            <GlassCard key={book.id || index} className="flex flex-col">
                                {/* Обложка */}
                                <div
                                    className="aspect-[3/4] mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-library-100 to-parchment-100 flex items-center justify-center cursor-pointer relative group"
                                    onClick={() => setSelectedBook(book)}
                                >
                                    {book.coverUrl ? (
                                        <img
                                            src={getImageUrl(book.coverUrl)}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform duration-300">📚</span>
                                            <p className="text-library-400 text-sm">Без обложки</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-4xl">🔍</span>
                                    </div>
                                </div>

                                {/* Информация о книге */}
                                <div className="flex-1">
                                    <h3
                                        className="font-display font-semibold text-library-800 text-lg mb-2 line-clamp-2 cursor-pointer hover:text-amber-600 transition-colors"
                                        onClick={() => setSelectedBook(book)}
                                    >
                                        {book.title}
                                    </h3>

                                    <p className="text-library-600 text-sm mb-3">
                                        {book.author}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-library-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span>📄</span>
                      <span>{book.pages} стр.</span>
                    </span>
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="mt-auto space-y-2">
                                    {/* Кнопка редактирования */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(book);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all duration-300 text-sm group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">✏️</span>
                                        <span>Редактировать</span>
                                    </button>

                                    {/* Кнопка загрузки обложки */}
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id={`cover-upload-${book.id || index}`}
                                            className="hidden"
                                            onChange={(e) => handleUploadCover(e, book)}
                                        />
                                        <label
                                            htmlFor={`cover-upload-${book.id || index}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-input rounded-xl text-library-600 hover:bg-white/30 cursor-pointer transition-all duration-300 text-sm group"
                                        >
                                            {uploadingBooks[book.id || ''] ? (
                                                <>
                                                    <span className="animate-spin text-lg">⏳</span>
                                                    <span>Загрузка...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="group-hover:scale-110 transition-transform text-lg">📷</span>
                                                    <span>{book.coverUrl ? 'Изменить обложку' : 'Добавить обложку'}</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </main>

            {/* Модальное окно добавления книги */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowAddModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Новая книга
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleAddBook} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newBook.title}
                                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Название книги"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Автор *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newBook.author}
                                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Имя автора"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Количество страниц
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newBook.pages}
                                        onChange={(e) => setNewBook({ ...newBook, pages: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={newBook.description}
                                        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[120px] resize-none"
                                        placeholder="Краткое описание книги..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Добавить
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования книги */}
            {editingBook && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setEditingBook(null)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Редактирование
                                </h2>
                                <button
                                    onClick={() => setEditingBook(null)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateBook} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Название книги"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Автор *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.author}
                                        onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Имя автора"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Количество страниц
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.pages}
                                        onChange={(e) => setEditForm({ ...editForm, pages: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[120px] resize-none"
                                        placeholder="Краткое описание книги..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingBook(null)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно просмотра книги */}
            {selectedBook && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedBook(null)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
                        <GlassCard>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 flex-shrink-0">
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-library-100 to-parchment-100 flex items-center justify-center">
                                        {selectedBook.coverUrl ? (
                                            <img
                                                src={getImageUrl(selectedBook.coverUrl)}
                                                alt={selectedBook.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-7xl">📚</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-display font-semibold text-library-800 mb-2">
                                                {selectedBook.title}
                                            </h2>
                                            <p className="text-library-600 text-lg">{selectedBook.author}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBook(null)}
                                            className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-library-500 mb-6">
                    <span className="flex items-center gap-1">
                      <span>📄</span>
                      <span>{selectedBook.pages} страниц</span>
                    </span>
                                    </div>

                                    <div className="prose prose-stone">
                                        <p className="text-library-700 leading-relaxed">
                                            {selectedBook.description || 'Описание отсутствует'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;