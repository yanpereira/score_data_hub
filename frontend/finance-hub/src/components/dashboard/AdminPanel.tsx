import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Shield, UserCog, Trash2, Layout } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  role: "admin" | "gerente" | "usuario";
  modules: string[];
  dashboards: string[];
}

const AVAILABLE_MODULES = [
  { id: "financeiro", label: "Financeiro" },
  { id: "pdi", label: "PD&I" },
  { id: "rh", label: "RH" },
];

const AVAILABLE_DASHBOARDS = [
  { id: "visao-geral", label: "Visão Geral" },
  { id: "dfc", label: "DFC" },
  { id: "dre", label: "DRE" },
  { id: "extrato", label: "Extrato" },
  { id: "indicadores", label: "Indicadores" },
];

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserProfile["role"]>("usuario");
  const [selectedModules, setSelectedModules] = useState<string[]>(["financeiro"]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>(["visao-geral"]);

  useEffect(() => {
    const savedUsers = localStorage.getItem("app_users");
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default users
      const initialUsers: UserProfile[] = [
        { id: "1", username: "yan", role: "admin", modules: ["financeiro", "pdi", "rh"], dashboards: ["visao-geral", "dfc", "dre", "extrato", "indicadores"] },
        { id: "2", username: "henrique", role: "usuario", modules: ["financeiro"], dashboards: ["visao-geral", "extrato"] }
      ];
      setUsers(initialUsers);
      localStorage.setItem("app_users", JSON.stringify(initialUsers));
    }
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUsername,
      role: newRole,
      modules: selectedModules,
      dashboards: selectedDashboards,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("app_users", JSON.stringify(updatedUsers));
    
    // Also store password for login simulation
    localStorage.setItem(`pwd_${newUsername}`, newPassword);

    toast.success(`Usuário ${newUsername} criado com sucesso!`);
    setNewUsername("");
    setNewPassword("");
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem("app_users", JSON.stringify(updatedUsers));
    toast.info("Usuário removido.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <Card className="lg:col-span-1 border-0 shadow-lg bg-white">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Novo Usuário</CardTitle>
            <CardDescription>Cadastre novos membros e defina acessos.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Ex: joao.silva" />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="usuario">Usuário Padrão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Módulos Permitidos</Label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_MODULES.map(m => (
                    <div key={m.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`m-${m.id}`} 
                        checked={selectedModules.includes(m.id)}
                        onCheckedChange={(checked) => {
                          setSelectedModules(checked ? [...selectedModules, m.id] : selectedModules.filter(x => x !== m.id));
                        }}
                      />
                      <label htmlFor={`m-${m.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{m.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Dashboards (Financeiro)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_DASHBOARDS.map(d => (
                    <div key={d.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`d-${d.id}`} 
                        checked={selectedDashboards.includes(d.id)}
                        onCheckedChange={(checked) => {
                          setSelectedDashboards(checked ? [...selectedDashboards, d.id] : selectedDashboards.filter(x => x !== d.id));
                        }}
                      />
                      <label htmlFor={`d-${d.id}`} className="text-sm font-medium leading-none">{d.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">Criar Usuário</Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Gestão de Acessos</CardTitle>
            <CardDescription>Usuários cadastrados e seus níveis de permissão.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : user.role === "gerente" ? "secondary" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.modules.map(m => (
                          <span key={m} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 uppercase font-bold">{m}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={user.username === "yan"}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}