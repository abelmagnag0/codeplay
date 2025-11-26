import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Code } from "lucide-react";
export function Logo({ size = "md", showText = true }) {
    const sizes = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    };
    const textSizes = {
        sm: "text-lg",
        md: "text-2xl",
        lg: "text-4xl"
    };
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `${sizes[size]} bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center`, children: _jsx(Code, { className: "w-3/5 h-3/5 text-white" }) }), showText && (_jsxs("span", { className: `${textSizes[size]} font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`, children: ["CodePlay", _jsx("span", { className: "text-accent", children: "+" })] }))] }));
}
