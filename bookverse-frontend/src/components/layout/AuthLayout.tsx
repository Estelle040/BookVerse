import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Анимированный градиентный фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-stone-50/50 to-amber-50/50" />

            {/* Декоративные книги на фоне */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 text-7xl animate-float opacity-20" style={{ animationDelay: '0s' }}>📚</div>
                <div className="absolute top-40 right-20 text-6xl animate-float opacity-20" style={{ animationDelay: '1s' }}>📖</div>
                <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20" style={{ animationDelay: '2s' }}>📕</div>
                <div className="absolute bottom-40 right-10 text-6xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>📗</div>
                <div className="absolute top-1/3 left-1/4 text-5xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>📘</div>
                <div className="absolute top-1/4 right-1/3 text-6xl animate-float opacity-20" style={{ animationDelay: '2.5s' }}>📙</div>
                <div className="absolute top-1/2 right-1/4 text-5xl animate-float opacity-20" style={{ animationDelay: '3s' }}>📓</div>
                <div className="absolute bottom-1/3 left-1/3 text-6xl animate-float opacity-20" style={{ animationDelay: '1.8s' }}>📔</div>
            </div>

            {/* Декоративные круги */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-transparent rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-library-200/20 to-transparent rounded-full filter blur-3xl" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Логотип */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-6 relative">
                        <div className="w-20 h-20 mx-auto glass rounded-2xl flex items-center justify-center shadow-glass transform hover:scale-105 transition-transform duration-300">
                            <span className="text-3xl">📚</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 glass rounded-full flex items-center justify-center text-xs shadow-glass">
                            ✨
                        </div>
                    </div>

                    <h1 className="text-4xl font-display font-semibold text-library-800 mb-3 tracking-wide">
                        {title}
                    </h1>
                    <p className="text-library-500 text-sm font-light tracking-wider">
                        {subtitle}
                    </p>
                </div>

                {/* Основная стеклянная карточка */}
                <div className="glass rounded-3xl p-8 shadow-glass hover:shadow-glass-hover transition-all duration-500">
                    {children}
                </div>

                {/* Декоративная полоска внизу */}
                <div className="mt-8 text-center text-library-400 text-xs">
          <span className="inline-flex items-center gap-3">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-library-300"></span>
            <span className="font-medium tracking-widest uppercase">Book Verse</span>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-library-300"></span>
          </span>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;