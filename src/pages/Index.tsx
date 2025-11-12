import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface VerifiedUser {
  id: string;
  name: string;
  username: string;
  channel: string;
  age: string;
  reason: string;
  patentConfirmation: string;
  status: 'verified' | 'fraud';
  createdAt: string;
}

const Index = () => {
  const [users, setUsers] = useState<VerifiedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    channel: '',
    age: '',
    reason: '',
    patentConfirmation: '',
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

  const handleAddUser = () => {
    if (!formData.name || !formData.username || !formData.channel || !formData.age || !formData.reason || !formData.patentConfirmation) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    const newUser: VerifiedUser = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
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
      patentConfirmation: '',
      status: 'verified'
    });

    toast({
      title: "Успешно",
      description: "Пользователь добавлен в базу данных"
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

  const handlePrintCertificate = (user: VerifiedUser) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Сертификат верификации - ${user.username}</title>
          <style>
            body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 40px;
              background: white;
            }
            .certificate {
              max-width: 800px;
              margin: 0 auto;
              border: 3px solid #0088cc;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,136,204,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #0088cc;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: 700;
              color: #0088cc;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 500;
              color: #333;
              margin-top: 10px;
            }
            .content {
              margin: 30px 0;
              line-height: 1.8;
            }
            .field {
              margin: 15px 0;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            .label {
              font-weight: 500;
              color: #666;
              font-size: 14px;
            }
            .value {
              font-size: 16px;
              color: #333;
              margin-top: 5px;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 500;
              font-size: 14px;
              background: ${user.status === 'verified' ? '#22c55e' : '#ef4444'};
              color: white;
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #0088cc;
              text-align: center;
              color: #666;
            }
            .confirmed {
              font-size: 18px;
              font-weight: 500;
              color: #0088cc;
              margin-bottom: 10px;
            }
            .date {
              font-size: 14px;
              color: #999;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">VeriUser.Telegram</div>
              <div class="title">Сертификат верификации пользователя</div>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Имя (Псевдоним)</div>
                <div class="value">${user.name}</div>
              </div>
              <div class="field">
                <div class="label">Username</div>
                <div class="value">@${user.username}</div>
              </div>
              <div class="field">
                <div class="label">Канал/Профиль</div>
                <div class="value">${user.channel}</div>
              </div>
              <div class="field">
                <div class="label">Возраст</div>
                <div class="value">${user.age} лет</div>
              </div>
              <div class="field">
                <div class="label">Причина верификации</div>
                <div class="value">${user.reason}</div>
              </div>
              <div class="field">
                <div class="label">Подтверждение использования username (патент)</div>
                <div class="value">${user.patentConfirmation}</div>
              </div>
              <div class="field">
                <div class="label">Статус верификации</div>
                <div class="status">${user.status === 'verified' ? 'Верифицированный аккаунт' : 'Мошенник'}</div>
              </div>
            </div>
            <div class="footer">
              <div class="confirmed">Подтверждено командой: VeriUser.Telegram</div>
              <div class="date">Дата создания: ${new Date(user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
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

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="name">Имя (Псевдоним)</Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="channel">Канал/Профиль</Label>
                <Input
                  id="channel"
                  placeholder="@channel_name или ссылка"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Возраст</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="reason">Причина верификации</Label>
                <Textarea
                  id="reason"
                  placeholder="Опишите причину..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="patent">Подтверждение использования username (патент)</Label>
                <Input
                  id="patent"
                  placeholder="Пользователю [имя] принадлежит [username]"
                  value={formData.patentConfirmation}
                  onChange={(e) => setFormData({ ...formData, patentConfirmation: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Статус верификации</Label>
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
              <Button onClick={handleAddUser} className="w-full" size="lg">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить пользователя
              </Button>
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
              {searchQuery ? `Найдено: ${filteredUsers.length}` : `Всего записей: ${users.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Нет данных</p>
                <p className="text-sm">Добавьте первого пользователя</p>
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
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
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
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
