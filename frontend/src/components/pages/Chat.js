import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Send, MonitorUp, MonitorOff, Users, Settings, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
export function Chat({ onNavigate }) {
    const [message, setMessage] = useState("");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: "DevMaster_99",
            content: "Alguém pode me ajudar com recursão?",
            timestamp: "14:23",
            isOwn: false
        },
        {
            id: 2,
            user: "CodeNinja",
            content: "Claro! Qual é a sua dúvida específica?",
            timestamp: "14:24",
            isOwn: false
        },
        {
            id: 3,
            user: "AbelDev",
            content: "Estou tendo problemas com a base case",
            timestamp: "14:25",
            isOwn: true
        },
        {
            id: 4,
            user: "DevMaster_99",
            content: "Deixa eu compartilhar minha tela para mostrar o código",
            timestamp: "14:26",
            isOwn: false
        },
    ]);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const participants = [
        { name: "DevMaster_99", status: "online", role: "admin" },
        { name: "CodeNinja", status: "online", role: "member" },
        { name: "AbelDev", status: "online", role: "member" },
        { name: "PyMaster", status: "away", role: "member" },
        { name: "JSGenius", status: "online", role: "member" },
    ];
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                user: "AbelDev",
                content: message,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                isOwn: true
            };
            setMessages([...messages, newMessage]);
            setMessage("");
        }
    };
    const toggleScreenShare = () => {
        setIsScreenSharing(!isScreenSharing);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => onNavigate('rooms'), className: "hover:bg-secondary", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl", children: "Frontend Masters" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "React & TypeScript" })] }), _jsxs(Badge, { variant: "outline", className: "bg-green-500/20 text-green-400 border-green-500/30", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" }), "5 online"] })] }), _jsx(Button, { variant: "outline", size: "icon", className: "border-border hover:border-primary/50", children: _jsx(Settings, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-3 space-y-4", children: [isScreenSharing && (_jsxs(Card, { className: "bg-card border-primary/30", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(MonitorUp, { className: "w-4 h-4 text-primary" }), "Voc\u00EA est\u00E1 compartilhando sua tela"] }), _jsxs(Button, { variant: "destructive", size: "sm", onClick: toggleScreenShare, children: [_jsx(MonitorOff, { className: "w-4 h-4 mr-2" }), "Encerrar"] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "aspect-video bg-secondary rounded-lg border border-border flex items-center justify-center", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx(MonitorUp, { className: "w-12 h-12 mx-auto text-primary" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Sua tela est\u00E1 sendo compartilhada" })] }) }) })] })), _jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "p-0", children: [_jsx(ScrollArea, { className: "h-[500px] p-4", children: _jsxs("div", { className: "space-y-4", children: [messages.map((msg) => (_jsxs("div", { className: `flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`, children: [_jsx(Avatar, { className: "w-10 h-10 flex-shrink-0", children: _jsx(AvatarFallback, { className: msg.isOwn ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent', children: msg.user.substring(0, 2).toUpperCase() }) }), _jsxs("div", { className: `flex-1 space-y-1 ${msg.isOwn ? 'text-right' : ''}`, children: [_jsxs("div", { className: `flex items-center gap-2 ${msg.isOwn ? 'flex-row-reverse' : ''}`, children: [_jsx("span", { className: "text-sm font-semibold", children: msg.user }), _jsx("span", { className: "text-xs text-muted-foreground", children: msg.timestamp })] }), _jsx("div", { className: `inline-block p-3 rounded-lg max-w-[80%] ${msg.isOwn
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'bg-secondary border border-border'}`, children: _jsx("p", { className: "text-sm break-words", children: msg.content }) })] })] }, msg.id))), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { className: "p-4 border-t border-border bg-secondary/30", children: _jsxs("form", { onSubmit: handleSendMessage, className: "flex gap-2", children: [_jsx(Input, { placeholder: "Digite sua mensagem...", value: message, onChange: (e) => setMessage(e.target.value), className: "flex-1 bg-background border-border" }), _jsx(Button, { type: "button", variant: "outline", className: `border-border ${isScreenSharing ? 'bg-primary/20 border-primary/50' : ''}`, onClick: toggleScreenShare, children: isScreenSharing ? _jsx(MonitorOff, { className: "w-4 h-4" }) : _jsx(MonitorUp, { className: "w-4 h-4" }) }), _jsx(Button, { type: "submit", className: "bg-primary hover:bg-primary/90", children: _jsx(Send, { className: "w-4 h-4" }) })] }) })] }) })] }), _jsxs(Card, { className: "bg-card border-border h-fit", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [_jsx(Users, { className: "w-4 h-4" }), "Participantes (", participants.length, ")"] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "space-y-3", children: participants.map((participant, index) => (_jsxs("div", { className: "flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors", children: [_jsxs("div", { className: "relative", children: [_jsx(Avatar, { className: "w-10 h-10", children: _jsx(AvatarFallback, { className: "bg-primary/20 text-primary", children: participant.name.substring(0, 2).toUpperCase() }) }), _jsx("div", { className: `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${participant.status === 'online' ? 'bg-green-400' :
                                                                participant.status === 'away' ? 'bg-yellow-400' :
                                                                    'bg-gray-400'}` })] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: participant.name }), _jsx("p", { className: "text-xs text-muted-foreground capitalize", children: participant.role })] })] }, index))) }) }) })] })] }), _jsx(Card, { className: "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30", children: _jsx(CardContent, { className: "py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(MonitorUp, { className: "w-5 h-5 text-primary flex-shrink-0" }), _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-semibold", children: "Dica:" }), " Clique no \u00EDcone de monitor para compartilhar sua tela com outros participantes. Perfeito para demonstrar c\u00F3digo ou explicar conceitos!"] })] }) }) })] }));
}
