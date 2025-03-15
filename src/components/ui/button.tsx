import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  onMouseEnter?: () => void; // ✅ 追加
  onMouseLeave?: () => void; // ✅ 追加
}

const Button: React.FC<ButtonProps> = ({ children, onClick, className, onMouseEnter, onMouseLeave }) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter} // ✅ 追加
      onMouseLeave={onMouseLeave} // ✅ 追加
      className={`px-6 py-3 text-white font-bold rounded-full shadow-md transition-transform transform hover:scale-105 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
