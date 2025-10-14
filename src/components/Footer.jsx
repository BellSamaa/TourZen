// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = {
    'Công ty': [
      { name: 'Về chúng tôi', path: '/about' },
      { name: 'Tuyển dụng', path: '/careers' },
      { name: 'Báo chí', path: '/press' },
    ],
    'Hỗ trợ': [
      { name: 'Trung tâm trợ giúp', path: '/help' },
      { name: 'Chính sách bảo mật', path: '/privacy' },
      { name: 'Điều khoản dịch vụ', path: '/terms' },
    ],
    'Điểm đến': [
      { name: 'Trong nước', path: '/tours?domestic' },
      { name: 'Quốc tế', path: '/tours?international' },
      { name: 'Tour theo mùa', path: '/tours?seasonal' },
    ],
  };

  return (
    <footer className="bg-neutral-800 text-white">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">TourZen</h3>
            <p className="mt-2 text-neutral-400 max-w-xs">
              Kiến tạo những kỷ niệm khó phai trên mọi hành trình của bạn.
            </p>
            <div className="mt-6">
              <h4 className="font-semibold text-neutral-200">Đăng ký nhận tin</h4>
              <form className="mt-2 flex">
                <input type="email" placeholder="Email của bạn" className="w-full rounded-l-md border-neutral-600 bg-neutral-700 text-white placeholder-neutral-400 focus:ring-primary"/>
                <button className="bg-primary px-4 rounded-r-md font-semibold hover:bg-primary-dark">Đăng ký</button>
              </form>
            </div>
          </div>
          {Object.keys(footerLinks).map(title => (
            <div key={title}>
              <h4 className="font-semibold text-neutral-200">{title}</h4>
              <ul className="mt-4 space-y-2">
                {footerLinks[title].map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-neutral-400 hover:text-white transition-colors">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-neutral-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} TourZen by Nhóm 5. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Thiết kế với ❤️ cho hành trình của bạn.</p>
        </div>
      </div>
    </footer>
  );
}