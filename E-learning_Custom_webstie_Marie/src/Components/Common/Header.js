// 'use client';
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { FiMenu } from "react-icons/fi";
// import { RxCross1 } from "react-icons/rx";

// const Header = () => {
//   const [open, setOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     console.log("open manik hossain", open);
//   }, [open]);

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem('user');
//       setUser(storedUser ? JSON.parse(storedUser) : null);
//     } catch {
//       setUser(null);
//     }
//   }, []);

//   useEffect(() => {
//     if (!open) return undefined;

//     const onKeyDown = (event) => {
//       if (event.key === 'Escape') setOpen(false);
//     };

//     document.addEventListener('keydown', onKeyDown);
//     return () => document.removeEventListener('keydown', onKeyDown);
//   }, [open]);

//   const navigationItems = [
//     { label: "L'approche", id: "approach" },
//     { label: "Comment ça marche", id: "how-it-works" },
//     { label: "Pour les particuliers", id: "path" },
//     { label: "Pour les entreprises", id: "for-companies" },
//     { label: "Pour les mentors", id: "for-mentors" },
//     { label: "Témoignages", id: "testimonials" },
//   ];

//   const closeMenu = () => setOpen(false);

//   const handleNavClick = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//     closeMenu();
//   };

//   return (
//     <header className="w-full">
//       <div className="container mx-auto fixed z-[1002] px-4 left-0 right-0 top-3 sm:top-5">
//         <div className="flex items-center justify-between rounded-xl bg-white/90 backdrop-blur-md px-4 sm:px-6 xl:py-3 py-3 sm:py-5 border border-gray-300 shadow-sm">

//           <div className="flex shrink-0 items-center gap-2">
//             <Link href="/" onClick={closeMenu}>
//               <img
//                 src="/Images/Auth/main_logo.jpg"
//                 alt="Propulsaria"
//                 className="h-10 sm:h-12 w-auto cursor-pointer"
//               />
//             </Link>
//           </div>

//           <ul className="hidden xl:flex items-center gap-6 2xl:gap-10 text-gray-900 text-sm">
//             {navigationItems.map((item) => (
//               <li
//                 key={item.id}
//                 onClick={() => handleNavClick(item.id)}
//                 className="cursor-pointer hover:text-orange-500 text-[15px] 2xl:text-[17px] transition whitespace-nowrap"
//               >
//                 {item.label}
//               </li>
//             ))}
//           </ul>

//           {user ? (
//             <div className="hidden xl:flex items-center text-[17px] gap-3 shrink-0">
//               <Link
//                 href={`/${user?.role == 'student' ? 'students' : 'mentor'}`}
//                 className="px-8 customSignUpButton py-4 rounded-lg text-white text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
//               >
//                 Tableau de bord
//               </Link>
//             </div>
//           ) : (
//             <div className="hidden xl:flex items-center text-[17px] gap-3 shrink-0">
//               <Link href="/signup" className="px-8 customSignUpButton py-4 rounded-lg text-white text-sm font-medium hover:opacity-90 transition whitespace-nowrap">
//                 S'inscrire
//               </Link>
//               <Link href="/login" className="px-6 py-4 rounded-lg border border-gray-500 text-gray-700 text-sm customSignUpButtonHover hover:opacity-90 transition whitespace-nowrap">
//                 Se connecter
//               </Link>
//             </div>
//           )}

//           <button
//             type="button"
//             className="xl:hidden shrink-0 p-2 text-gray-900 hover:text-orange-500 transition"
//             onClick={() => setOpen((prev) => !prev)}
//             aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
//             aria-expanded={open}
//           >
//             {open ? <RxCross1 size={26} /> : <FiMenu size={26} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile backdrop */}
//       <button
//         type="button"
//         aria-label="Close menu"
//         onClick={closeMenu}
//         className={`xl:hidden fixed inset-0 z-[1000] bg-black/50 transition-opacity duration-300 ${
//           open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
//         }`}
//       />

//       {/* Mobile aside drawer */}
//       <aside
//         id="mobile-nav-drawer"
//         aria-hidden={!open}
//         className={`xl:hidden fixed left-0 top-0 z-[999999] flex h-full w-[min(20rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
//           open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
//         }`}
//       >
//         <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
//           <Link href="/" onClick={closeMenu}>
//             <img
//               src="/Images/Auth/main_logo.jpg"
//               alt="Propulsaria"
//               className="h-10 w-auto"
//             />
//           </Link>
//           <button
//             type="button"
//             onClick={closeMenu}
//             aria-label="Close navigation menu"
//             className="p-2 text-gray-700 hover:text-orange-500 transition"
//           >
//             <RxCross1 size={24} />
//           </button>
//         </div>

//         <nav className="flex-1 overflow-y-auto">
//           <ul className="flex flex-col divide-y divide-gray-100">
//             {navigationItems.map((item) => (
//               <li key={item.id}>
//                 <button
//                   type="button"
//                   onClick={() => handleNavClick(item.id)}
//                   className="w-full text-left px-5 py-4 text-gray-900 text-base hover:bg-gray-50 hover:text-orange-500 transition"
//                 >
//                   {item.label}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <div className="border-t border-gray-200 p-5 space-y-3">
//           {user ? (
//             <Link
//               href={`/${user?.role == 'student' ? 'students' : 'mentor'}`}
//               onClick={closeMenu}
//               className="block w-full text-center px-6 customSignUpButton py-3 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
//             >
//               Tableau de bord
//             </Link>
//           ) : (
//             <>
//               <Link
//                 href="/signup"
//                 onClick={closeMenu}
//                 className="block w-full text-center px-6 customSignUpButton py-3 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
//               >
//                 S'inscrire
//               </Link>
//               <Link
//                 href="/login"
//                 onClick={closeMenu}
//                 className="block w-full text-center px-6 py-3 rounded-lg border border-gray-400 text-gray-800 text-sm customSignUpButtonHover hover:opacity-90 transition"
//               >
//                 Se connecter
//               </Link>
//             </>
//           )}
//         </div>
//       </aside>
//     </header>
//   );
// };

// export default Header;



"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] =useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const navigationItems = [
    { label: "L'approche", id: "approach" },
    { label: "Comment ça marche", id: "how-it-works" },
    { label: "Pour les particuliers", id: "path" },
    { label: "Pour les entreprises", id: "for-companies" },
    { label: "Pour les mentors", id: "for-mentors" },
    { label: "Témoignages", id: "testimonials" },
  ];

  const closeMenu = () => setOpen(false);

  const handleNavClick = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }

    closeMenu();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between rounded-xl bg-white shadow-lg border border-gray-200 px-5 py-3">

          <Link href="/">
            <img
              src="/Images/Auth/main_logo.jpg"
              alt="logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden xl:flex gap-8">
            {navigationItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="cursor-pointer hover:text-orange-500"
              >
                {item.label}
              </li>
            ))}
          </ul>

          {/* Desktop Buttons */}
          <div className="hidden xl:flex gap-3">
            {user ? (
              <Link
                href={`/${user?.role === "student" ? "students" : "mentor"}`}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg"
              >
                Tableau de bord
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg"
                >
                  S'inscrire
                </Link>

                <Link
                  href="/login"
                  className="border px-6 py-3 rounded-lg"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden z-[99999]"
          >
            {open ? <RxCross1 size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 xl:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <img
            src="/Images/Auth/main_logo.jpg"
            className="h-10"
            alt=""
          />

          <button onClick={closeMenu}>
            <RxCross1 size={24} />
          </button>
        </div>

        <ul>
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left px-5 py-4 hover:bg-gray-100"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="p-5 space-y-3">
          {user ? (
            <Link
              href={`/${user?.role === "student" ? "students" : "mentor"}`}
              onClick={closeMenu}
              className="block bg-orange-500 text-white text-center py-3 rounded-lg"
            >
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                onClick={closeMenu}
                className="block bg-orange-500 text-white text-center py-3 rounded-lg"
              >
                S'inscrire
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
                className="block border text-center py-3 rounded-lg"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;