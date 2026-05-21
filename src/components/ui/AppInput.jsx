import React, { useState } from 'react';

const AppInput = (props) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative text-left">
      {label && 
        <label className='block mb-2 text-sm font-bold text-neutral-700 dark:text-neutral-300'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className="peer relative z-10 border-2 border-neutral-200 dark:border-white/10 h-12 w-full rounded-xl bg-white dark:bg-neutral-900/50 px-4 font-medium text-neutral-900 dark:text-white outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-neutral-50 dark:focus:bg-neutral-900 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-xl overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--tw-colors-indigo-500, #6366f1) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-xl overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--tw-colors-indigo-500, #6366f1) 0%, transparent 70%)`,
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-neutral-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppInput;
