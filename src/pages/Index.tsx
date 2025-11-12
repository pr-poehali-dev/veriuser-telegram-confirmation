import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface VerifiedUser {
  id: string;
  name: string;
  username: string;
  channel: string;
  age: string;
  reason?: string;
  patents: string[];
  socialNetworks: string;
  status: 'verified' | 'fraud';
  createdAt: string;
  expiresAt: string;
}

const Index = () => {
  const [users, setUsers] = useState<VerifiedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'fraud'>('all');
  const [editingUser, setEditingUser] = useState<VerifiedUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    channel: '',
    age: '',
    reason: '',
    patents: [''],
    socialNetworks: '',
    status: 'verified' as 'verified' | 'fraud'
  });
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('veriuser_data');
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const saveToLocalStorage = (data: VerifiedUser[]) => {
    localStorage.setItem('veriuser_data', JSON.stringify(data));
  };

  const addPatentField = () => {
    setFormData({ ...formData, patents: [...formData.patents, ''] });
  };

  const updatePatent = (index: number, value: string) => {
    const newPatents = [...formData.patents];
    newPatents[index] = value;
    setFormData({ ...formData, patents: newPatents });
  };

  const removePatent = (index: number) => {
    if (formData.patents.length > 1) {
      const newPatents = formData.patents.filter((_, i) => i !== index);
      setFormData({ ...formData, patents: newPatents });
    }
  };

  const handleAddUser = () => {
    const filledPatents = formData.patents.filter(p => p.trim() !== '');
    
    if (!formData.name || !formData.username || !formData.channel || !formData.age || filledPatents.length === 0) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля (имя, username, канал, возраст и минимум один патент)",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const newUser: VerifiedUser = {
      id: Date.now().toString(),
      name: formData.name,
      username: formData.username,
      channel: formData.channel,
      age: formData.age,
      reason: formData.reason || undefined,
      patents: filledPatents,
      socialNetworks: formData.socialNetworks,
      status: formData.status,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToLocalStorage(updatedUsers);

    setFormData({
      name: '',
      username: '',
      channel: '',
      age: '',
      reason: '',
      patents: [''],
      socialNetworks: '',
      status: 'verified'
    });

    toast({
      title: "Успешно",
      description: "Пользователь добавлен в базу данных"
    });
  };

  const handleEditUser = (user: VerifiedUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      channel: user.channel,
      age: user.age,
      reason: user.reason || '',
      patents: user.patents,
      socialNetworks: user.socialNetworks,
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const filledPatents = formData.patents.filter(p => p.trim() !== '');
    
    if (!formData.name || !formData.username || !formData.channel || !formData.age || filledPatents.length === 0) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const updatedUser: VerifiedUser = {
      ...editingUser,
      name: formData.name,
      username: formData.username,
      channel: formData.channel,
      age: formData.age,
      reason: formData.reason || undefined,
      patents: filledPatents,
      socialNetworks: formData.socialNetworks,
      status: formData.status
    };

    const updatedUsers = users.map(u => u.id === editingUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    saveToLocalStorage(updatedUsers);

    setIsEditDialogOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      channel: '',
      age: '',
      reason: '',
      patents: [''],
      socialNetworks: '',
      status: 'verified'
    });

    toast({
      title: "Обновлено",
      description: "Данные пользователя успешно обновлены"
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `veriuser_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Экспорт завершен",
      description: "База данных успешно экспортирована"
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setUsers(imported);
        saveToLocalStorage(imported);
        toast({
          title: "Импорт завершен",
          description: "База данных успешно импортирована"
        });
      } catch (error) {
        toast({
          title: "Ошибка импорта",
          description: "Некорректный файл",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handlePrintCertificate = (user: VerifiedUser) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const daysLeft = getDaysRemaining(user.expiresAt);
    const expired = isExpired(user.expiresAt);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Сертификат верификации - ${user.username}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              max-width: 900px;
              width: 100%;
              background: white;
              border-radius: 24px;
              box-shadow: 0 30px 60px rgba(0,0,0,0.3);
              overflow: hidden;
              position: relative;
            }
            .header-bg {
              background: linear-gradient(135deg, #0088cc 0%, #005f8d 100%);
              padding: 50px 40px;
              position: relative;
              overflow: hidden;
            }
            .header-bg::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -10%;
              width: 300px;
              height: 300px;
              background: rgba(255,255,255,0.1);
              border-radius: 50%;
            }
            .header-bg::after {
              content: '';
              position: absolute;
              bottom: -30%;
              left: -5%;
              width: 200px;
              height: 200px;
              background: rgba(255,255,255,0.08);
              border-radius: 50%;
            }
            .header-content {
              position: relative;
              z-index: 1;
              text-align: center;
              color: white;
            }
            .logo {
              font-size: 36px;
              font-weight: 700;
              margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .title {
              font-size: 20px;
              font-weight: 400;
              opacity: 0.95;
              letter-spacing: 0.5px;
            }
            .status-badge {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 32px;
              border-radius: 50px;
              font-weight: 600;
              font-size: 16px;
              background: ${user.status === 'verified' ? '#22c55e' : '#ef4444'};
              color: white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .content {
              padding: 50px 50px 40px;
            }
            .user-header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 30px;
              border-bottom: 2px solid #f0f0f0;
            }
            .user-name {
              font-size: 32px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 8px;
            }
            .user-username {
              font-size: 20px;
              color: #0088cc;
              font-weight: 500;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 25px;
              margin-bottom: 35px;
            }
            .info-item {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #0088cc;
            }
            .info-label {
              font-size: 13px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .info-value {
              font-size: 16px;
              color: #1a1a1a;
              font-weight: 500;
              word-break: break-word;
            }
            .patents-section {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 25px;
              border-radius: 12px;
              margin-bottom: 35px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .patent-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 10px;
              border-left: 3px solid #0088cc;
              font-size: 15px;
              color: #333;
              line-height: 1.5;
            }
            .patent-item:last-child {
              margin-bottom: 0;
            }
            .validity-notice {
              background: ${expired ? '#fee2e2' : daysLeft <= 7 ? '#fef3c7' : '#dcfce7'};
              border: 2px solid ${expired ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#22c55e'};
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              margin-bottom: 30px;
            }
            .validity-title {
              font-size: 14px;
              font-weight: 700;
              color: ${expired ? '#991b1b' : daysLeft <= 7 ? '#92400e' : '#166534'};
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .validity-text {
              font-size: 18px;
              font-weight: 600;
              color: ${expired ? '#dc2626' : daysLeft <= 7 ? '#d97706' : '#16a34a'};
            }
            .validity-subtext {
              font-size: 13px;
              color: ${expired ? '#991b1b' : daysLeft <= 7 ? '#92400e' : '#166534'};
              margin-top: 5px;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
            }
            .confirmed-text {
              font-size: 18px;
              font-weight: 600;
              color: #0088cc;
              margin-bottom: 15px;
            }
            .date-info {
              display: flex;
              justify-content: center;
              gap: 40px;
              flex-wrap: wrap;
            }
            .date-item {
              text-align: center;
            }
            .date-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .date-value {
              font-size: 15px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              font-weight: 900;
              color: rgba(0,136,204,0.03);
              pointer-events: none;
              white-space: nowrap;
            }
            @media print {
              body {
                padding: 0;
                background: white;
              }
              .certificate {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="watermark">VERIFIED</div>
            <div class="header-bg">
              <div class="header-content">
                <div class="logo">VeriUser.Telegram</div>
                <div class="title">Официальный сертификат верификации</div>
                <div class="status-badge">
                  ${user.status === 'verified' ? '✓ Верифицирован' : '⚠ Мошенник'}
                </div>
              </div>
            </div>
            
            <div class="content">
              <div class="user-header">
                <div class="user-name">${user.name}</div>
                <div class="user-username">@${user.username}</div>
              </div>

              <div class="validity-notice">
                <div class="validity-title">
                  ${expired ? 'Сертификат истёк' : daysLeft <= 7 ? 'Требуется обновление' : 'Срок действия'}
                </div>
                <div class="validity-text">
                  ${expired ? 'Требуется повторная проверка' : `Действителен ещё ${daysLeft} ${daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней'}`}
                </div>
                ${expired || daysLeft <= 7 ? '<div class="validity-subtext">Свяжитесь с администрацией для продления</div>' : ''}
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Канал / Профиль</div>
                  <div class="info-value">${user.channel}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Возраст</div>
                  <div class="info-value">${user.age} лет</div>
                </div>
                ${user.socialNetworks ? `
                  <div class="info-item" style="grid-column: 1 / -1;">
                    <div class="info-label">Другие социальные сети</div>
                    <div class="info-value">${user.socialNetworks}</div>
                  </div>
                ` : ''}
              </div>

              <div class="patents-section">
                <div class="section-title">
                  <span>🔐</span>
                  <span>Подтверждённые права собственности</span>
                </div>
                ${user.patents.map((patent, index) => `
                  <div class="patent-item">
                    <strong>#${index + 1}</strong> ${patent}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="footer">
              <div class="confirmed-text">
                ✓ Подтверждено командой VeriUser.Telegram
              </div>
              <div class="date-info">
                <div class="date-item">
                  <div class="date-label">Дата выдачи</div>
                  <div class="date-value">${new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div class="date-item">
                  <div class="date-label">Действителен до</div>
                  <div class="date-value">${new Date(user.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveToLocalStorage(updatedUsers);
    toast({
      title: "Удалено",
      description: "Пользователь удален из базы данных"
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderForm = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={isEdit ? "edit-name" : "name"}>Имя (Псевдоним) *</Label>
        <Input
          id={isEdit ? "edit-name" : "name"}
          placeholder="Иван Иванов"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-username" : "username"}>Username *</Label>
        <Input
          id={isEdit ? "edit-username" : "username"}
          placeholder="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-channel" : "channel"}>Канал/Профиль *</Label>
        <Input
          id={isEdit ? "edit-channel" : "channel"}
          placeholder="@channel_name или ссылка"
          value={formData.channel}
          onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-age" : "age"}>Возраст *</Label>
        <Input
          id={isEdit ? "edit-age" : "age"}
          type="number"
          placeholder="25"
          value={formData.age}
          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-social" : "social"}>Другие социальные сети</Label>
        <Input
          id={isEdit ? "edit-social" : "social"}
          placeholder="Instagram: @username, VK: @username"
          value={formData.socialNetworks}
          onChange={(e) => setFormData({ ...formData, socialNetworks: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-reason" : "reason"}>Причина верификации (опционально)</Label>
        <Textarea
          id={isEdit ? "edit-reason" : "reason"}
          placeholder="Опишите причину..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={2}
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Подтверждения прав собственности (патенты) *</Label>
          <Button type="button" size="sm" variant="outline" onClick={addPatentField}>
            <Icon name="Plus" size={16} className="mr-1" />
            Добавить
          </Button>
        </div>
        <div className="space-y-2">
          {formData.patents.map((patent, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Пользователю ${formData.name || '[имя]'} принадлежит @${formData.username || '[username]'}`}
                value={patent}
                onChange={(e) => updatePatent(index, e.target.value)}
              />
              {formData.patents.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removePatent(index)}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit-status" : "status"}>Статус верификации *</Label>
        <Select
          value={formData.status}
          onValueChange={(value: 'verified' | 'fraud') => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="verified">Верифицированный аккаунт</SelectItem>
            <SelectItem value="fraud">Мошенник</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={isEdit ? handleUpdateUser : handleAddUser} 
        className="w-full" 
        size="lg"
      >
        <Icon name={isEdit ? "Check" : "Plus"} size={20} className="mr-2" />
        {isEdit ? "Сохранить изменения" : "Добавить пользователя"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            <Icon name="ShieldCheck" size={40} />
            VeriUser.Telegram
          </h1>
          <p className="text-muted-foreground text-lg">Система верификации пользователей Telegram</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Icon name="UserPlus" size={24} />
                Добавить пользователя
              </CardTitle>
              <CardDescription>Внесите данные для верификации</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {renderForm(false)}
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Database" size={24} />
                База данных ({users.length})
              </CardTitle>
              <CardDescription>Управление записями верификации</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="search">Поиск по Username</Label>
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Введите username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filter">Фильтр по статусу</Label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'verified' | 'fraud') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все записи</SelectItem>
                    <SelectItem value="verified">Верифицированные</SelectItem>
                    <SelectItem value="fraud">Мошенники</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Icon name="Download" size={20} className="mr-2" />
                  Экспорт
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <label className="cursor-pointer">
                    <Icon name="Upload" size={20} className="mr-2" />
                    Импорт
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Info" size={20} className="text-primary" />
                  <span className="font-medium">Статистика</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Верифицировано</p>
                    <p className="text-2xl font-bold text-success">
                      {users.filter(u => u.status === 'verified').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Мошенники</p>
                    <p className="text-2xl font-bold text-destructive">
                      {users.filter(u => u.status === 'fraud').length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Список верифицированных пользователей
            </CardTitle>
            <CardDescription>
              {searchQuery || statusFilter !== 'all' ? `Найдено: ${filteredUsers.length}` : `Всего записей: ${users.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Нет данных</p>
                <p className="text-sm">
                  {searchQuery || statusFilter !== 'all' ? 'Попробуйте изменить фильтры' : 'Добавьте первого пользователя'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Канал</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Срок действия</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const expired = isExpired(user.expiresAt);
                      const daysLeft = getDaysRemaining(user.expiresAt);
                      
                      return (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">@{user.username}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.channel}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.status === 'verified' ? 'default' : 'destructive'}
                              className={user.status === 'verified' ? 'bg-success hover:bg-success/90' : ''}
                            >
                              {user.status === 'verified' ? 'Верифицирован' : 'Мошенник'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={expired ? 'destructive' : daysLeft <= 7 ? 'secondary' : 'outline'}>
                              {expired ? 'Истёк' : `${daysLeft} дн.`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Icon name="Pencil" size={16} className="mr-1" />
                                Изменить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintCertificate(user)}
                              >
                                <Icon name="Printer" size={16} className="mr-1" />
                                Печать
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Pencil" size={24} />
              Редактировать пользователя
            </DialogTitle>
            <DialogDescription>
              Измените данные верификации для @{editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
