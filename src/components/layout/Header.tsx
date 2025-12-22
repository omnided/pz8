import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
// Предполагаем, что у тебя есть хук авторизации (или создай заглушку)
import { useAuth, useLoginUser } from '../../features/authApi'; 

export const Header = () => {
  const { user, logout } = useAuth();
  const isPatient = user?.user_role === 'patient';
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Логотип */}
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2 no-underline">
          🏥 <span>Polyclinic</span>
        </Link>

        {/* Навигация (Видна только авторизованным) */}
        {user && (
          <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
            <Link 
              to="/profile/receptions" 
              className="hover:text-blue-600 transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              Мої записи
            </Link>
            <Link 
              to="/profile/recipes" 
              className="hover:text-blue-600 transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              Мої рецепти
            </Link>
            <Link 
              to="/profile/analyses" 
              className="hover:text-blue-600 transition-colors"
              activeProps={{ className: 'text-blue-600' }}
            >
              Мої аналізи
            </Link>
          </nav>
        )}

        {/* Кнопки входа / профиля */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block font-medium">
                {user.username}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
              >
                Вийти
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};