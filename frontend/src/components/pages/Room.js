import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Users, Lock, Globe, Search, Plus, Video, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
export function Rooms({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomTopic, setNewRoomTopic] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const rooms = [
        {
            id: 1,
            name: "Frontend Masters",
            topic: "React & TypeScript",
            members: 24,
            maxMembers: 50,
            isPrivate: false,
            language: "JavaScript",
            active: true
        },
        {
            id: 2,
            name: "Python Gang",
            topic: "Data Structures",
            members: 18,
            maxMembers: 30,
            isPrivate: false,
            language: "Python",
            active: true
        },
        {
            id: 3,
            name: "Algoritmos Avançados",
            topic: "Competitive Programming",
            members: 12,
            maxMembers: 25,
            isPrivate: false,
            language: "C++",
            active: true
        },
        {
            id: 4,
            name: "Web3 Developers",
            topic: "Blockchain & Smart Contracts",
            members: 15,
            maxMembers: 40,
            isPrivate: true,
            language: "Solidity",
            active: true
        },
        {
            id: 5,
            name: "Machine Learning",
            topic: "Neural Networks & AI",
            members: 32,
            maxMembers: 60,
            isPrivate: false,
            language: "Python",
            active: true
        },
        {
            id: 6,
            name: "DevOps & Cloud",
            topic: "AWS, Docker, Kubernetes",
            members: 21,
            maxMembers: 35,
            isPrivate: false,
            language: "Various",
            active: true
        },
        {
            id: 7,
            name: "Mobile Dev",
            topic: "React Native & Flutter",
            members: 17,
            maxMembers: 30,
            isPrivate: false,
            language: "JavaScript",
            active: true
        },
        {
            id: 8,
            name: "Game Development",
            topic: "Unity & Unreal Engine",
            members: 14,
            maxMembers: 25,
            isPrivate: true,
            language: "C#",
            active: true
        },
    ];
    const filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const handleCreateRoom = () => {
        setDialogOpen(false);
        setNewRoomName("");
        setNewRoomTopic("");
        setIsPrivate(false);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl mb-2", children: "Salas de Estudo \uD83D\uDC65" }), _jsx("p", { className: "text-muted-foreground", children: "Conecte-se com outros desenvolvedores e aprenda em grupo" })] }), _jsxs(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-accent text-accent-foreground hover:bg-accent/90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Criar Sala"] }) }), _jsxs(DialogContent, { className: "bg-card", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Criar Nova Sala" }), _jsx(DialogDescription, { children: "Crie uma sala para estudar com outros desenvolvedores" })] }), _jsxs("div", { className: "space-y-4 mt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "room-name", children: "Nome da Sala" }), _jsx(Input, { id: "room-name", placeholder: "Ex: Frontend Masters", value: newRoomName, onChange: (e) => setNewRoomName(e.target.value), className: "bg-secondary border-border" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "room-topic", children: "Tema/T\u00F3pico" }), _jsx(Input, { id: "room-topic", placeholder: "Ex: React & TypeScript", value: newRoomTopic, onChange: (e) => setNewRoomTopic(e.target.value), className: "bg-secondary border-border" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-secondary rounded-lg", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "private-room", children: "Sala Privada" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Apenas membros convidados podem entrar" })] }), _jsx(Switch, { id: "private-room", checked: isPrivate, onCheckedChange: setIsPrivate })] }), _jsx(Button, { onClick: handleCreateRoom, className: "w-full bg-primary hover:bg-primary/90", children: "Criar Sala" })] })] })] })] }), _jsx(Card, { className: "bg-card border-border", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Buscar salas...", className: "pl-10 bg-secondary border-border", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }) }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredRooms.map((room) => (_jsxs(Card, { className: "bg-gradient-to-br from-card to-secondary border-border hover:border-primary/50 transition-all group cursor-pointer", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx(Badge, { variant: "outline", className: room.isPrivate ?
                                                "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                                                "bg-green-500/20 text-green-400 border-green-500/30", children: room.isPrivate ? (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-3 h-3 mr-1" }), "Privada"] })) : (_jsxs(_Fragment, { children: [_jsx(Globe, { className: "w-3 h-3 mr-1" }), "P\u00FAblica"] })) }), _jsx(Badge, { variant: "outline", className: "bg-accent/20 text-accent border-accent/30", children: room.language })] }), _jsx(CardTitle, { className: "group-hover:text-primary transition-colors", children: room.name }), _jsx(CardDescription, { children: room.topic })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm", children: [_jsx("span", { className: "font-semibold text-foreground", children: room.members }), _jsxs("span", { className: "text-muted-foreground", children: ["/", room.maxMembers] })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "Ativa" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { className: "flex-1 bg-primary hover:bg-primary/90", onClick: () => onNavigate('chat'), children: [_jsx(MessageSquare, { className: "w-4 h-4 mr-2" }), "Entrar"] }), _jsx(Button, { variant: "outline", size: "icon", className: "border-border hover:border-primary/50", children: _jsx(Video, { className: "w-4 h-4" }) })] })] })] }, room.id))) }), filteredRooms.length === 0 && (_jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Search, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg mb-2", children: "Nenhuma sala encontrada" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Tente outro termo de busca ou crie uma nova sala" }), _jsxs(Button, { className: "bg-accent text-accent-foreground hover:bg-accent/90", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Criar Nova Sala"] })] }) })), _jsxs(Card, { className: "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5" }), "Sobre as Salas de Estudo"] }) }), _jsxs(CardContent, { className: "space-y-2 text-sm text-muted-foreground", children: [_jsx("p", { children: "\u2022 Colabore em tempo real com outros desenvolvedores" }), _jsx("p", { children: "\u2022 Compartilhe sua tela para mostrar c\u00F3digo e conceitos" }), _jsx("p", { children: "\u2022 Chat em tempo real para discuss\u00F5es t\u00E9cnicas" }), _jsx("p", { children: "\u2022 Crie salas p\u00FAblicas ou privadas para seu grupo" })] })] })] }));
}
