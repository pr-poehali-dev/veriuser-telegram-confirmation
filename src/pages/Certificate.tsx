import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface CustomStatus {
  id: string;
  name: string;
  color: string;
}

interface VerifiedUser {
  id: string;
  name: string;
  username: string;
  channel: string;
  age: string;
  category?: string;
  reason?: string;
  patents: string[];
  socialNetworks: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

const DEFAULT_STATUSES: CustomStatus[] = [
  { id: 'verified', name: 'Верифицирован', color: '#22c55e' },
  { id: 'fraud', name: 'Мошенник', color: '#ef4444' }
];

const Certificate = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>(DEFAULT_STATUSES);

  useEffect(() => {
    const stored = localStorage.getItem('veriuserru_data');
    if (stored) {
      const users: VerifiedUser[] = JSON.parse(stored);
      const foundUser = users.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
      }
    }

    const storedStatuses = localStorage.getItem('veriuserru_statuses');
    if (storedStatuses) {
      setCustomStatuses(JSON.parse(storedStatuses));
    }
  }, [id]);

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (statusId: string) => {
    const status = customStatuses.find(s => s.id === statusId);
    return status?.color || '#3b82f6';
  };

  const getStatusName = (statusId: string) => {
    const status = customStatuses.find(s => s.id === statusId);
    return status?.name || statusId;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Сертификат не найден</h2>
            <p className="text-muted-foreground mb-4">
              Сертификат с таким ID не существует или был удалён
            </p>
            <Button asChild>
              <Link to="/">
                <Icon name="Home" size={16} className="mr-2" />
                На главную
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(user.expiresAt);
  const expired = isExpired(user.expiresAt);
  const statusColor = getStatusColor(user.status);
  const statusName = getStatusName(user.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Link>
          </Button>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <span className="text-primary text-2xl font-bold">V</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold">VeriUserRU</h1>
                    <p className="text-sm text-white/90">Сертификат верификации</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mt-4">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: statusColor }}
                  ></div>
                  <span className="text-sm font-semibold" style={{ color: '#fff' }}>
                    {statusName}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center mb-6 pb-6 border-b">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-xl text-primary font-semibold">@{user.username}</p>
              </div>

              <div 
                className={`rounded-xl p-4 mb-6 text-center ${
                  expired 
                    ? 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200' 
                    : daysLeft <= 7 
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200'
                    : 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                  expired ? 'text-red-900' : daysLeft <= 7 ? 'text-yellow-900' : 'text-green-900'
                }`}>
                  {expired ? 'Сертификат истёк' : daysLeft <= 7 ? 'Требуется обновление' : 'Срок действия'}
                </div>
                <div className={`text-lg font-bold ${
                  expired ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {expired ? 'Требуется повторная проверка' : `Действителен ещё ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Канал / Профиль
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{user.channel}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    Возраст
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{user.age} лет</div>
                </div>
                {user.socialNetworks && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 col-span-2">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      Другие социальные сети
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{user.socialNetworks}</div>
                  </div>
                )}
              </div>

              {user.patents.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name="Lock" size={16} className="text-primary" />
                    <h3 className="text-sm font-bold text-gray-900">Подтверждённые права собственности</h3>
                  </div>
                  <div className="space-y-2">
                    {user.patents.map((patent, index) => (
                      <div key={index} className="bg-white border-l-2 border-primary rounded p-2 text-sm text-gray-700">
                        <span className="font-bold text-primary">#{index + 1}</span> {patent}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-4 text-center text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-3">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Подтверждено командой VeriUserRU</span>
                </div>
                
                <div className="flex justify-center gap-6">
                  <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                    <div className="text-xs text-white/80 mb-1">Дата выдачи</div>
                    <div className="text-sm font-bold">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                    <div className="text-xs text-white/80 mb-1">Действителен до</div>
                    <div className="text-sm font-bold">
                      {new Date(user.expiresAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificate;
