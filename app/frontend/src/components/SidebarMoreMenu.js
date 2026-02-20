import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const SidebarMoreMenu = ({ items, onCloseMobile }) => {
    const location = useLocation();
    const isActive = items.some(item => location.pathname === item.path);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 mb-1"
                >
                    <MoreHorizontal className="w-4 h-4" />
                    Plus
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 ml-2">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                        <Link
                            to={item.path}
                            className="flex items-center gap-2 cursor-pointer w-full"
                            onClick={onCloseMobile}
                        >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SidebarMoreMenu;
