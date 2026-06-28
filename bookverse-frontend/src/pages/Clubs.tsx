import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ListClubDto, SaveClubDto, ClubMember } from '../types/club';
import { ListBookDTO } from '../types/book';
import GlassCard from '../components/ui/GlassCard';

const Clubs: React.FC = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<ListClubDto[]>([]);
    const [userClubs, setUserClubs] = useState<ListClubDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClub, setNewClub] = useState<SaveClubDto>({
        name: '',
        description: '',
        isPrivate: false,
    });
    const [selectedClub, setSelectedClub] = useState<ListClubDto | null>(null);
    const [clubMembers, setClubMembers] = useState<ClubMember[]>([]);
    const [clubBooks, setClubBooks] = useState<ListBookDTO[]>([]);
    const [allBooks, setAllBooks] = useState<ListBookDTO[]>([]);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showBooksModal, setShowBooksModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<SaveClubDto>({
        name: '',
        description: '',
        isPrivate: false,
    });
    const [joiningClub, setJoiningClub] = useState<number | null>(null);
    const [leavingClub, setLeavingClub] = useState<number | null>(null);
    const [addingBook, setAddingBook] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadClubs();
        loadAllBooks();
    }, [navigate]);

    const loadClubs = async () => {
        try {
            setLoading(true);
            const [allClubsRes, userClubsRes] = await Promise.all([
                api.get<ListClubDto[]>('/api/clubs/all'),
                api.get<ListClubDto[]>('/api/clubs/user-clubs').catch(() => ({ data: [] })),
            ]);
            setClubs(allClubsRes.data);
            setUserClubs(userClubsRes.data);
        } catch (error) {
            console.error('Ошибка загрузки клубов:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllBooks = async () => {
        try {
            const response = await api.get<ListBookDTO[]>('/api/books/all');
            setAllBooks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки книг:', error);
        }
    };

    const loadClubBooks = async (clubId: number) => {
        try {
            const response = await api.get<ListBookDTO[]>(`/api/clubs/${clubId}/books`);
            setClubBooks(response.data);
        } catch (error) {
            console.error('Ошибка загрузки книг клуба:', error);
            setClubBooks([]);
        }
    };

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post('/api/clubs/create', newClub);
            setShowCreateModal(false);
            setNewClub({ name: '', description: '', isPrivate: false });
            loadClubs();
        } catch (error) {
            console.error('Ошибка создания клуба:', error);
            alert('Ошибка при создании клуба');
        }
    };

    const handleEditClub = (club: ListClubDto) => {
        setSelectedClub(club);
        setEditForm({
            name: club.name,
            description: club.description,
            isPrivate: club.isPrivate,
        });
        setShowEditModal(true);
    };

    const handleUpdateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClub?.id) return;

        try {
            await api.put(`/api/clubs/${selectedClub.id}`, editForm);
            setShowEditModal(false);
            setSelectedClub(null);
            loadClubs();
        } catch (error) {
            console.error('Ошибка обновления клуба:', error);
            alert('Ошибка при обновлении клуба');
        }
    };

    const handleJoinClub = async (clubId: number) => {
        setJoiningClub(clubId);
        try {
            await api.post(`/api/clubs/join/${clubId}`);
            loadClubs();
        } catch (error) {
            console.error('Ошибка вступления в клуб:', error);
            alert('Ошибка при вступлении в клуб');
        } finally {
            setJoiningClub(null);
        }
    };

    const handleLeaveClub = async (clubId: number) => {
        if (!confirm('Вы уверены, что хотите покинуть клуб?')) return;

        setLeavingClub(clubId);
        try {
            await api.post(`/api/clubs/left/${clubId}`);
            loadClubs();
        } catch (error) {
            console.error('Ошибка выхода из клуба:', error);
            alert('Ошибка при выходе из клуба');
        } finally {
            setLeavingClub(null);
        }
    };

    const handleShowMembers = async (club: ListClubDto) => {
        setSelectedClub(club);
        try {
            const response = await api.get<ClubMember[]>(`/api/clubs/${club.id}/members`);
            setClubMembers(response.data);
            setShowMembersModal(true);
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
        }
    };

    const handleShowBooks = async (club: ListClubDto) => {
        setSelectedClub(club);
        await loadClubBooks(club.id!);
        setShowBooksModal(true);
    };

    const handleAddBookToClub = async (bookId: string) => {
        if (!selectedClub?.id) return;

        setAddingBook(true);
        try {
            await api.post(`/api/clubs/${selectedClub.id}/books/${bookId}`);
            await loadClubBooks(selectedClub.id);
        } catch (error) {
            console.error('Ошибка добавления книги:', error);
            alert('Ошибка при добавлении книги в клуб');
        } finally {
            setAddingBook(false);
        }
    };

    const handleRemoveBookFromClub = async (bookId: string) => {
        if (!selectedClub?.id || !confirm('Удалить книгу из клуба?')) return;

        try {
            await api.delete(`/api/clubs/${selectedClub.id}/books/${bookId}`);
            await loadClubBooks(selectedClub.id);
        } catch (error) {
            console.error('Ошибка удаления книги:', error);
            alert('Ошибка при удалении книги из клуба');
        }
    };

    const isUserMember = (clubId?: number) => {
        if (!clubId) return false;
        return userClubs.some(club => club.id === clubId);
    };

    const getMemberStatus = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { text: 'Активен', color: 'text-green-600' };
            case 'LEFT': return { text: 'Вышел', color: 'text-gray-500' };
            case 'BANNED': return { text: 'Заблокирован', color: 'text-red-600' };
            default: return { text: status, color: 'text-library-600' };
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
                                    Книжные клубы
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    {clubs.length} {clubs.length === 1 ? 'клуб' : clubs.length >= 2 && clubs.length <= 4 ? 'клуба' : 'клубов'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                        >
                            <span className="text-lg">+</span>
                            <span className="hidden sm:inline">Создать клуб</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                                <span className="text-4xl">👥</span>
                            </div>
                            <p className="text-library-600 text-lg animate-pulse">Загружаем клубы...</p>
                        </div>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">🏛️</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            Клубы не найдены
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            Создайте первый книжный клуб и пригласите друзей
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            + Создать клуб
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubs.map((club) => (
                            <GlassCard key={club.id} className="flex flex-col">
                                {/* Иконка клуба */}
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center shadow-glass">
                                        <span className="text-3xl">{club.isPrivate ? '🔒' : '📖'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {club.isPrivate && (
                                            <span className="px-3 py-1 glass-input rounded-full text-xs text-library-600">
                        Приватный
                      </span>
                                        )}
                                        {isUserMember(club.id) && (
                                            <span className="px-3 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-xs text-green-700">
                        Вы участник
                      </span>
                                        )}
                                    </div>
                                </div>

                                {/* Информация о клубе */}
                                <div className="flex-1">
                                    <h3 className="font-display font-semibold text-library-800 text-xl mb-2">
                                        {club.name}
                                    </h3>
                                    <p className="text-library-600 text-sm mb-4 line-clamp-3">
                                        {club.description || 'Описание отсутствует'}
                                    </p>
                                </div>

                                {/* Кнопки действий */}
                                <div className="mt-auto space-y-2">
                                    {isUserMember(club.id) && (
                                        <>
                                            <button
                                                onClick={() => handleShowBooks(club)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all duration-300 text-sm group"
                                            >
                                                <span className="group-hover:scale-110 transition-transform">📚</span>
                                                <span>Книги клуба</span>
                                            </button>

                                            <button
                                                onClick={() => handleEditClub(club)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all duration-300 text-sm group"
                                            >
                                                <span className="group-hover:scale-110 transition-transform">✏️</span>
                                                <span>Редактировать</span>
                                            </button>
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleShowMembers(club)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all duration-300 text-sm group"
                                    >
                                        <span className="group-hover:scale-110 transition-transform">👥</span>
                                        <span>Участники</span>
                                    </button>

                                    {isUserMember(club.id) ? (
                                        <button
                                            onClick={() => handleLeaveClub(club.id!)}
                                            disabled={leavingClub === club.id}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-400/20 border border-red-400/30 text-red-700 rounded-xl hover:bg-red-400/30 transition-all duration-300 text-sm group"
                                        >
                                            {leavingClub === club.id ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    <span>Выход...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="group-hover:scale-110 transition-transform">🚪</span>
                                                    <span>Покинуть клуб</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinClub(club.id!)}
                                            disabled={joiningClub === club.id}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 text-sm group"
                                        >
                                            {joiningClub === club.id ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    <span>Вступление...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="group-hover:scale-110 transition-transform">✨</span>
                                                    <span>Вступить в клуб</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}
            </main>

            {/* Модальное окно создания клуба */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Новый клуб
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateClub} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newClub.name}
                                        onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Название клуба"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={newClub.description}
                                        onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[120px] resize-none"
                                        placeholder="Опишите ваш клуб..."
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newClub.isPrivate}
                                            onChange={(e) => setNewClub({ ...newClub, isPrivate: e.target.checked })}
                                            className="w-5 h-5 rounded-lg border-library-300 text-amber-500 focus:ring-amber-400"
                                        />
                                        <div>
                                            <span className="text-library-700 text-sm font-medium">Приватный клуб</span>
                                            <p className="text-library-400 text-xs">Только по приглашению</p>
                                        </div>
                                    </label>
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
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Создать
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования клуба */}
            {showEditModal && selectedClub && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowEditModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Редактирование клуба
                                </h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateClub} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Название клуба"
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
                                        placeholder="Опишите ваш клуб..."
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isPrivate}
                                            onChange={(e) => setEditForm({ ...editForm, isPrivate: e.target.checked })}
                                            className="w-5 h-5 rounded-lg border-library-300 text-amber-500 focus:ring-amber-400"
                                        />
                                        <div>
                                            <span className="text-library-700 text-sm font-medium">Приватный клуб</span>
                                            <p className="text-library-400 text-xs">Только по приглашению</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-3 glass-input rounded-xl text-library-700 hover:bg-white/30 transition-all font-medium"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно участников */}
            {showMembersModal && selectedClub && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowMembersModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        {selectedClub.name}
                                    </h2>
                                    <p className="text-library-500 text-sm">Участники клуба</p>
                                </div>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            {clubMembers.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-4 block">👤</span>
                                    <p className="text-library-500">Нет участников</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {clubMembers.map((member, index) => {
                                        const status = getMemberStatus(member.status);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 glass-input rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                                                        <span>👤</span>
                                                    </div>
                                                    <span className="text-library-800 font-medium">
                            {member.login}
                          </span>
                                                </div>
                                                <span className={`text-sm font-medium ${status.color}`}>
                          {status.text}
                        </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно книг клуба */}
            {showBooksModal && selectedClub && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowBooksModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        {selectedClub.name}
                                    </h2>
                                    <p className="text-library-500 text-sm">Книги клуба</p>
                                </div>
                                <button
                                    onClick={() => setShowBooksModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Список книг клуба */}
                            {clubBooks.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-4 block">📚</span>
                                    <p className="text-library-500 mb-4">В клубе пока нет книг</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                                    {clubBooks.map((book) => (
                                        <div
                                            key={book.id}
                                            className="flex items-center justify-between p-3 glass-input rounded-xl"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-2xl">📖</span>
                                                <div className="min-w-0">
                                                    <p className="text-library-800 font-medium truncate">
                                                        {book.title}
                                                    </p>
                                                    <p className="text-library-500 text-sm truncate">
                                                        {book.author}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveBookFromClub(book.id!)}
                                                className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-400/20 text-library-400 hover:text-red-600 transition-all"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Добавление книги */}
                            <div className="border-t border-white/20 pt-4">
                                <h3 className="text-sm font-medium text-library-700 mb-3">
                                    Добавить книгу в клуб
                                </h3>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-4 py-2.5 glass-input rounded-xl text-library-700 focus:outline-none"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAddBookToClub(e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        disabled={addingBook}
                                    >
                                        <option value="">Выберите книгу...</option>
                                        {allBooks
                                            .filter(book => !clubBooks.some(cb => cb.id === book.id))
                                            .map((book) => (
                                                <option key={book.id} value={book.id}>
                                                    {book.title} - {book.author}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;