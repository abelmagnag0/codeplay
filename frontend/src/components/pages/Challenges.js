import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Search, Filter, Zap, Clock, Code2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
export function Challenges() {
    const [selectedLanguage, setSelectedLanguage] = useState("all");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const challenges = [
        {
            id: 1,
            title: "Fibonacci Recursivo",
            description: "Implemente a sequência de Fibonacci usando recursão",
            difficulty: "Médio",
            xp: 150,
            language: "Python",
            avgTime: "15 min",
            solved: 342
        },
        {
            id: 2,
            title: "Binary Search Tree",
            description: "Crie uma árvore binária de busca com operações básicas",
            difficulty: "Difícil",
            xp: 250,
            language: "JavaScript",
            avgTime: "30 min",
            solved: 156
        },
        {
            id: 3,
            title: "Array Rotation",
            description: "Rotacione um array N posições para a direita",
            difficulty: "Fácil",
            xp: 50,
            language: "C++",
            avgTime: "10 min",
            solved: 567
        },
        {
            id: 4,
            title: "Merge Sort",
            description: "Implemente o algoritmo Merge Sort",
            difficulty: "Médio",
            xp: 120,
            language: "Python",
            avgTime: "20 min",
            solved: 289
        },
        {
            id: 5,
            title: "Valid Parentheses",
            description: "Valide se uma string de parênteses está balanceada",
            difficulty: "Fácil",
            xp: 75,
            language: "JavaScript",
            avgTime: "12 min",
            solved: 423
        },
        {
            id: 6,
            title: "Graph Traversal",
            description: "Implemente BFS e DFS em um grafo",
            difficulty: "Difícil",
            xp: 300,
            language: "C++",
            avgTime: "40 min",
            solved: 98
        },
        {
            id: 7,
            title: "Hash Table",
            description: "Crie uma hash table com tratamento de colisões",
            difficulty: "Médio",
            xp: 180,
            language: "Python",
            avgTime: "25 min",
            solved: 234
        },
        {
            id: 8,
            title: "Linked List Reverse",
            description: "Inverta uma lista ligada in-place",
            difficulty: "Fácil",
            xp: 60,
            language: "JavaScript",
            avgTime: "8 min",
            solved: 512
        },
    ];
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Fácil": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "Médio": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "Difícil": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };
    const filteredChallenges = challenges.filter(challenge => {
        const matchesLanguage = selectedLanguage === "all" || challenge.language === selectedLanguage;
        const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
        const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLanguage && matchesDifficulty && matchesSearch;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl mb-2", children: "Desafios de C\u00F3digo \uD83C\uDFAF" }), _jsx("p", { className: "text-muted-foreground", children: "Resolva desafios, ganhe XP e suba no ranking!" })] }), _jsx(Card, { className: "bg-card border-border", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Buscar desafios...", className: "pl-10 bg-secondary border-border", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs(Select, { value: selectedLanguage, onValueChange: setSelectedLanguage, children: [_jsx(SelectTrigger, { className: "w-full md:w-[180px] bg-secondary border-border", children: _jsx(SelectValue, { placeholder: "Linguagem" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "Todas" }), _jsx(SelectItem, { value: "Python", children: "Python" }), _jsx(SelectItem, { value: "JavaScript", children: "JavaScript" }), _jsx(SelectItem, { value: "C++", children: "C++" })] })] }), _jsxs(Select, { value: selectedDifficulty, onValueChange: setSelectedDifficulty, children: [_jsx(SelectTrigger, { className: "w-full md:w-[180px] bg-secondary border-border", children: _jsx(SelectValue, { placeholder: "Dificuldade" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "Todas" }), _jsx(SelectItem, { value: "F\u00E1cil", children: "F\u00E1cil" }), _jsx(SelectItem, { value: "M\u00E9dio", children: "M\u00E9dio" }), _jsx(SelectItem, { value: "Dif\u00EDcil", children: "Dif\u00EDcil" })] })] })] }) }) }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: filteredChallenges.map((challenge) => (_jsxs(Card, { className: "bg-card border-border hover:border-primary/50 transition-all group cursor-pointer", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-1 flex-1", children: [_jsx(CardTitle, { className: "group-hover:text-primary transition-colors", children: challenge.title }), _jsx(CardDescription, { children: challenge.description })] }), _jsx(Badge, { variant: "outline", className: getDifficultyColor(challenge.difficulty), children: challenge.difficulty })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [_jsx(Code2, { className: "w-4 h-4" }), _jsx("span", { className: "font-code", children: challenge.language })] }), _jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [_jsx(Clock, { className: "w-4 h-4" }), challenge.avgTime] })] }), _jsxs("span", { className: "flex items-center gap-1 text-accent font-semibold", children: [_jsx(Zap, { className: "w-4 h-4" }), challenge.xp, " XP"] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: [challenge.solved, " pessoas resolveram"] }), _jsxs(Dialog, { children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-primary hover:bg-primary/90", children: ["Resolver", _jsx(ChevronRight, { className: "w-4 h-4 ml-1" })] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto bg-card", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center justify-between", children: [challenge.title, _jsx(Badge, { variant: "outline", className: getDifficultyColor(challenge.difficulty), children: challenge.difficulty })] }), _jsx(DialogDescription, { children: challenge.description })] }), _jsxs("div", { className: "space-y-4 mt-4", children: [_jsxs("div", { className: "p-4 bg-secondary rounded-lg border border-border", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Detalhes do Desafio" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("p", { className: "text-muted-foreground", children: "Implemente uma solu\u00E7\u00E3o eficiente para este problema. Considere a complexidade de tempo e espa\u00E7o." }), _jsxs("div", { className: "flex gap-4 mt-3", children: [_jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [_jsx(Code2, { className: "w-4 h-4" }), challenge.language] }), _jsxs("span", { className: "flex items-center gap-1 text-muted-foreground", children: [_jsx(Clock, { className: "w-4 h-4" }), "Tempo m\u00E9dio: ", challenge.avgTime] }), _jsxs("span", { className: "flex items-center gap-1 text-accent", children: [_jsx(Zap, { className: "w-4 h-4" }), challenge.xp, " XP"] })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Seu C\u00F3digo" }), _jsx(Textarea, { placeholder: `// Escreva seu código em ${challenge.language} aqui...\n\nfunction solution() {\n  // Sua solução\n}`, className: "font-code h-64 bg-secondary border-border" })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "outline", children: "Testar C\u00F3digo" }), _jsx(Button, { className: "bg-accent text-accent-foreground hover:bg-accent/90", children: "Enviar Solu\u00E7\u00E3o" })] })] })] })] })] })] }) })] }, challenge.id))) }), filteredChallenges.length === 0 && (_jsx(Card, { className: "bg-card border-border", children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(Filter, { className: "w-12 h-12 mx-auto mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg mb-2", children: "Nenhum desafio encontrado" }), _jsx("p", { className: "text-muted-foreground", children: "Tente ajustar os filtros ou a busca" })] }) }))] }));
}
