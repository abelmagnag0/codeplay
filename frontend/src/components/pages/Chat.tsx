import { useState, useRef, useEffect } from "react";
import { Send, MonitorUp, MonitorOff, Users, Settings, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

interface ChatProps {
  onNavigate: (page: string) => void;
}

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export function Chat({ onNavigate }: ChatProps) {
  const [message, setMessage] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('rooms')}
            className="hover:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl">Frontend Masters</h1>
            <p className="text-sm text-muted-foreground">React & TypeScript</p>
          </div>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            5 online
          </Badge>
        </div>
        <Button variant="outline" size="icon" className="border-border hover:border-primary/50">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Screen Share Area */}
          {isScreenSharing && (
            <Card className="bg-card border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MonitorUp className="w-4 h-4 text-primary" />
                    Você está compartilhando sua tela
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={toggleScreenShare}
                  >
                    <MonitorOff className="w-4 h-4 mr-2" />
                    Encerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-secondary rounded-lg border border-border flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MonitorUp className="w-12 h-12 mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Sua tela está sendo compartilhada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className={msg.isOwn ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}>
                          {msg.user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 space-y-1 ${msg.isOwn ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-semibold">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            msg.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary border border-border'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-secondary/30">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-background border-border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`border-border ${isScreenSharing ? 'bg-primary/20 border-primary/50' : ''}`}
                    onClick={toggleScreenShare}
                  >
                    {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Sidebar */}
        <Card className="bg-card border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Participantes ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {participant.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                          participant.status === 'online' ? 'bg-green-400' :
                          participant.status === 'away' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {participant.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <MonitorUp className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm">
              <span className="font-semibold">Dica:</span> Clique no ícone de monitor para compartilhar sua tela com outros participantes.
              Perfeito para demonstrar código ou explicar conceitos!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
