import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MeetingViewDTO, CreateMeetingDTO, UpdateMeetingDTO, MeetingParticipantDTO } from '../types/meeting';
import { ListClubDto } from '../types/club';
import GlassCard from '../components/ui/GlassCard';

const Meetings: React.FC = () => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<ListClubDto[]>([]);
    const [selectedClub, setSelectedClub] = useState<ListClubDto | null>(null);
    const [meetings, setMeetings] = useState<MeetingViewDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingViewDTO | null>(null);
    const [participants, setParticipants] = useState<MeetingParticipantDTO[]>([]);
    const [newMeeting, setNewMeeting] = useState<CreateMeetingDTO>({
        title: '',
        description: '',
        place: '',
        meetingDate: '',
    });
    const [editMeeting, setEditMeeting] = useState<UpdateMeetingDTO>({
        title: '',
        description: '',
        location: '',
        meetingTime: '',
    });
    const [creating, setCreating] = useState(false);
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [attendingMeeting, setAttendingMeeting] = useState<number | null>(null);
    const [myAttendStatus, setMyAttendStatus] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        loadClubs();
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

    const loadMeetings = async (clubId: number) => {
        try {
            setLoading(true);
            const response = await api.get<MeetingViewDTO[]>(`/api/meetings/${clubId}/meetings`);
            setMeetings(response.data);
        } catch (error) {
            console.error('Ошибка загрузки встреч:', error);
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMyAttendStatus = async (meetingId: number) => {
        try {
            const response = await api.get<MeetingParticipantDTO[]>(`/api/meetings/${meetingId}/participants`);
            const currentUser = localStorage.getItem('login') || '';
            const myParticipant = response.data.find((p: MeetingParticipantDTO) => p.login === currentUser);
            if (myParticipant) {
                setMyAttendStatus(prev => ({ ...prev, [meetingId]: myParticipant.willAttend }));
            }
        } catch (error) {
            // Игнорируем ошибку
        }
    };

    useEffect(() => {
        if (selectedClub?.id) {
            loadMeetings(selectedClub.id);
        }
    }, [selectedClub]);

    useEffect(() => {
        if (meetings.length > 0) {
            meetings.forEach(meeting => {
                if (meeting.status === 'PLANNED') {
                    loadMyAttendStatus(meeting.id);
                }
            });
        }
    }, [meetings]);

    const getTodayString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours() + 1).padStart(2, '0');
        const minutes = '00';
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleCreateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClub) return;

        setCreating(true);
        try {
            await api.post(`/api/meetings/create/${selectedClub.id}`, {
                ...newMeeting,
                meetingDate: newMeeting.meetingDate + ':00',
            });

            setShowCreateModal(false);
            setNewMeeting({
                title: '',
                description: '',
                place: '',
                meetingDate: '',
            });
            loadMeetings(selectedClub.id!);
        } catch (error: any) {
            console.error('Ошибка создания встречи:', error);
            alert('Ошибка при создании встречи');
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMeeting) return;

        try {
            await api.patch(`/api/meetings/update/${selectedMeeting.id}`, {
                ...editMeeting,
                meetingTime: editMeeting.meetingTime + ':00',
            });

            setShowEditModal(false);
            setSelectedMeeting(null);
            if (selectedClub?.id) {
                loadMeetings(selectedClub.id);
            }
        } catch (error: any) {
            console.error('Ошибка обновления встречи:', error);
            alert('Ошибка при обновлении встречи');
        }
    };

    const handleCancelMeeting = async (meetingId: number) => {
        if (!confirm('Вы уверены, что хотите отменить встречу?')) return;

        setCancelling(meetingId);
        try {
            await api.post(`/api/meetings/cancel/${meetingId}`);
            if (selectedClub?.id) {
                loadMeetings(selectedClub.id);
            }
        } catch (error: any) {
            console.error('Ошибка отмены встречи:', error);
            alert('Ошибка при отмене встречи');
        } finally {
            setCancelling(null);
        }
    };

    const handleAttendMeeting = async (meetingId: number, willAttend: boolean) => {
        setAttendingMeeting(meetingId);
        try {
            await api.post(`/api/meetings/${meetingId}/attend?willAttend=${willAttend}`);
            setMyAttendStatus(prev => ({ ...prev, [meetingId]: willAttend }));
            if (selectedClub?.id) {
                loadMeetings(selectedClub.id);
            }
        } catch (error) {
            console.error('Ошибка отметки участия:', error);
            alert('Ошибка при отметке участия');
        } finally {
            setAttendingMeeting(null);
        }
    };

    const handleShowDetails = async (meeting: MeetingViewDTO) => {
        try {
            const response = await api.get<MeetingViewDTO>(`/api/meetings/${meeting.id}/details`);
            setSelectedMeeting(response.data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
        }
    };

    const handleShowParticipants = async (meeting: MeetingViewDTO) => {
        setSelectedMeeting(meeting);
        try {
            const response = await api.get<MeetingParticipantDTO[]>(`/api/meetings/${meeting.id}/participants`);
            setParticipants(response.data);
            setShowParticipantsModal(true);
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
        }
    };

    const handleEditClick = (meeting: MeetingViewDTO) => {
        setSelectedMeeting(meeting);
        setEditMeeting({
            title: meeting.title,
            description: meeting.description,
            location: meeting.location,
            meetingTime: meeting.meetingTime.slice(0, 16),
        });
        setShowEditModal(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLANNED':
                return { text: 'Запланирована', color: 'bg-blue-400/20 text-blue-700 border-blue-400/30', icon: '📅' };
            case 'CANCELLED':
                return { text: 'Отменена', color: 'bg-red-400/20 text-red-700 border-red-400/30', icon: '❌' };
            case 'COMPLETED':
                return { text: 'Завершена', color: 'bg-green-400/20 text-green-700 border-green-400/30', icon: '✅' };
            default:
                return { text: status, color: 'bg-gray-400/20 text-gray-700 border-gray-400/30', icon: '📌' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && !selectedClub) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-library-50 via-parchment-50 to-library-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 glass rounded-2xl flex items-center justify-center animate-float">
                        <span className="text-4xl">📅</span>
                    </div>
                    <p className="text-library-600 text-lg animate-pulse">Загружаем встречи...</p>
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
                                    Встречи клуба
                                </h1>
                                <p className="text-library-500 text-sm hidden sm:block">
                                    Планируйте обсуждения книг
                                </p>
                            </div>
                        </div>

                        {selectedClub && (
                            <button
                                onClick={() => {
                                    setNewMeeting({
                                        title: '',
                                        description: '',
                                        place: '',
                                        meetingDate: getTodayString(),
                                    });
                                    setShowCreateModal(true);
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                            >
                                <span className="text-lg">+</span>
                                <span className="hidden sm:inline">Назначить встречу</span>
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

                {/* Список встреч */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 glass rounded-2xl flex items-center justify-center animate-float">
                            <span className="text-3xl">📅</span>
                        </div>
                        <p className="text-library-600">Загружаем встречи...</p>
                    </div>
                ) : meetings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-7xl mb-6 animate-float">📅</div>
                        <h3 className="text-2xl font-display text-library-700 mb-4">
                            Нет запланированных встреч
                        </h3>
                        <p className="text-library-500 mb-8 max-w-md mx-auto">
                            Создайте встречу для обсуждения книги с участниками клуба
                        </p>
                        {selectedClub && (
                            <button
                                onClick={() => {
                                    setNewMeeting({
                                        title: '',
                                        description: '',
                                        place: '',
                                        meetingDate: getTodayString(),
                                    });
                                    setShowCreateModal(true);
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                + Назначить встречу
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {meetings.map((meeting) => {
                            const status = getStatusBadge(meeting.status);
                            const isPlanned = meeting.status === 'PLANNED';

                            return (
                                <GlassCard key={meeting.id}>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-2xl">{status.icon}</span>
                                                    <h3 className="text-xl font-display font-semibold text-library-800">
                                                        {meeting.title}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs border ${status.color}`}>
                            {status.text}
                          </span>
                                                </div>

                                                <p className="text-library-600 text-sm mb-3">
                                                    {meeting.description}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-library-500">
                                                    <div className="flex items-center gap-2">
                                                        <span>🕐</span>
                                                        <span>{formatDate(meeting.meetingTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span>📍</span>
                                                        <span>{meeting.location || 'Не указано'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleShowDetails(meeting)}
                                                    className="px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm whitespace-nowrap"
                                                >
                                                    👁️ Подробнее
                                                </button>

                                                <button
                                                    onClick={() => handleShowParticipants(meeting)}
                                                    className="px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm whitespace-nowrap"
                                                >
                                                    👥 Участники
                                                </button>

                                                {isPlanned && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(meeting)}
                                                            className="px-4 py-2 glass-input rounded-xl text-library-600 hover:bg-white/30 transition-all text-sm whitespace-nowrap"
                                                        >
                                                            ✏️ Изменить
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelMeeting(meeting.id)}
                                                            disabled={cancelling === meeting.id}
                                                            className="px-4 py-2 bg-red-400/20 border border-red-400/30 text-red-700 rounded-xl hover:bg-red-400/30 transition-all text-sm whitespace-nowrap"
                                                        >
                                                            {cancelling === meeting.id ? '⏳...' : '❌ Отменить'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Кнопки участия */}
                                        {isPlanned && (
                                            <div className="flex gap-2 pt-2 border-t border-white/20">
                                                <button
                                                    onClick={() => handleAttendMeeting(meeting.id, true)}
                                                    disabled={attendingMeeting === meeting.id}
                                                    className={`flex-1 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                                        myAttendStatus[meeting.id] === true
                                                            ? 'bg-green-400/30 border border-green-400/50 text-green-700'
                                                            : 'glass-input text-library-600 hover:bg-white/30'
                                                    }`}
                                                >
                                                    {myAttendStatus[meeting.id] === true ? '✅ Пойду' : '👍 Пойду'}
                                                </button>

                                                <button
                                                    onClick={() => handleAttendMeeting(meeting.id, false)}
                                                    disabled={attendingMeeting === meeting.id}
                                                    className={`flex-1 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                                        myAttendStatus[meeting.id] === false
                                                            ? 'bg-red-400/20 border border-red-400/30 text-red-700'
                                                            : 'glass-input text-library-600 hover:bg-white/30'
                                                    }`}
                                                >
                                                    {myAttendStatus[meeting.id] === false ? '❌ Не пойду' : '👎 Не пойду'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Модальное окно создания встречи */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg my-8">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Новая встреча
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateMeeting} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newMeeting.title}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Например: Обсуждение 'Война и мир'"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={newMeeting.description}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[80px] resize-none"
                                        placeholder="Что будем обсуждать?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Место проведения
                                    </label>
                                    <input
                                        type="text"
                                        value={newMeeting.place}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, place: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                        placeholder="Zoom, Google Meet, кафе 'Книжный'..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Дата и время *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={newMeeting.meetingDate}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, meetingDate: e.target.value })}
                                        max="9999-12-31T23:59"
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none"
                                    />
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
                                        {creating ? 'Создание...' : 'Создать встречу'}
                                    </button>
                                </div>
                            </form>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно редактирования */}
            {showEditModal && selectedMeeting && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowEditModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-semibold text-library-800">
                                    Изменить встречу
                                </h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateMeeting} className="space-y-4">
                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Название *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editMeeting.title}
                                        onChange={(e) => setEditMeeting({ ...editMeeting, title: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Описание
                                    </label>
                                    <textarea
                                        value={editMeeting.description}
                                        onChange={(e) => setEditMeeting({ ...editMeeting, description: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none min-h-[80px] resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Место проведения
                                    </label>
                                    <input
                                        type="text"
                                        value={editMeeting.location}
                                        onChange={(e) => setEditMeeting({ ...editMeeting, location: e.target.value })}
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 placeholder-library-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-library-700 text-sm font-medium mb-2">
                                        Дата и время *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editMeeting.meetingTime}
                                        onChange={(e) => setEditMeeting({ ...editMeeting, meetingTime: e.target.value })}
                                        max="9999-12-31T23:59"
                                        className="w-full px-4 py-3 glass-input rounded-xl text-library-800 focus:outline-none"
                                    />
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

            {/* Модальное окно деталей */}
            {showDetailsModal && selectedMeeting && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowDetailsModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-3xl">{getStatusBadge(selectedMeeting.status).icon}</span>
                                        <h2 className="text-2xl font-display font-semibold text-library-800">
                                            {selectedMeeting.title}
                                        </h2>
                                    </div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getStatusBadge(selectedMeeting.status).color}`}>
                    {getStatusBadge(selectedMeeting.status).text}
                  </span>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-library-500 mb-1">Описание</h3>
                                    <p className="text-library-800">
                                        {selectedMeeting.description || 'Описание отсутствует'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-library-500 mb-1">Дата и время</h3>
                                        <p className="text-library-800 flex items-center gap-2">
                                            <span>🕐</span>
                                            {formatDate(selectedMeeting.meetingTime)}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-library-500 mb-1">Место</h3>
                                        <p className="text-library-800 flex items-center gap-2">
                                            <span>📍</span>
                                            {selectedMeeting.location || 'Не указано'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* Модальное окно участников */}
            {showParticipantsModal && selectedMeeting && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowParticipantsModal(false)}
                >
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
                        <GlassCard>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-display font-semibold text-library-800">
                                        Участники встречи
                                    </h2>
                                    <p className="text-library-500 text-sm">{selectedMeeting.title}</p>
                                </div>
                                <button
                                    onClick={() => setShowParticipantsModal(false)}
                                    className="w-10 h-10 glass-input rounded-full flex items-center justify-center hover:bg-white/30 transition-all text-library-600 hover:text-library-800"
                                >
                                    ✕
                                </button>
                            </div>

                            {participants.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl mb-4 block">👥</span>
                                    <p className="text-library-500">Пока никто не отметился</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {participants.filter(p => p.willAttend).length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                                <span>✅</span> Придут ({participants.filter(p => p.willAttend).length})
                                            </h3>
                                            {participants.filter(p => p.willAttend).map((p, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 glass-input rounded-xl mb-2">
                                                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                                                        <span>👤</span>
                                                    </div>
                                                    <span className="text-library-800 font-medium">{p.login}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {participants.filter(p => !p.willAttend).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                                <span>❌</span> Не придут ({participants.filter(p => !p.willAttend).length})
                                            </h3>
                                            {participants.filter(p => !p.willAttend).map((p, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 glass-input rounded-xl mb-2 opacity-70">
                                                    <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
                                                        <span>👤</span>
                                                    </div>
                                                    <span className="text-library-800 font-medium">{p.login}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {participants.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-white/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-library-500">Всего отметилось:</span>
                                        <span className="text-library-800 font-medium">{participants.length}</span>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Meetings;