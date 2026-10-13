import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound({ darkMode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      
      {/* ฝัง CSS Animation ตรงนี้เพื่อให้ขยับทันทีโดยไม่ต้องพึ่ง tailwind.config.js */}
      <style>{`
        @keyframes moveRobot {
          0% { transform: translateX(-40px); }
          100% { transform: translateX(40px); }
        }
        @keyframes sweepArm {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(25deg); }
        }
        @keyframes sweepBroom {
          0% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }
        @keyframes cleanDust {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes pulseBall {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>

      {/* ส่วนตัวการ์ตูนหุ่นยนต์ทำความสะอาด */}
      <div className="relative h-40 mb-4 flex justify-center items-end">
        <div 
          className="relative w-[90px] h-[90px]"
          style={{ animation: 'moveRobot 4s ease-in-out infinite alternate' }}
        >
          
          {/* เสาอากาศ */}
          <div className="absolute -top-[15px] left-[27px] w-1 h-[15px] bg-slate-800 dark:bg-slate-200"></div>
          <div 
            className="absolute -top-[22px] left-[23px] w-3 h-3 bg-red-400 rounded-full border-2 border-slate-800 dark:border-slate-200"
            style={{ animation: 'pulseBall 1.5s infinite' }}
          ></div>
          
          {/* หัวหุ่นยนต์ */}
          <div className="absolute top-0 left-[15px] w-[60px] h-[45px] bg-slate-200 dark:bg-slate-800 rounded-t-[30px] rounded-b-[15px] border-[3px] border-slate-800 dark:border-slate-200 flex justify-center items-center">
            <div className="flex gap-3">
              <div 
                className="w-2 h-2 bg-slate-800 dark:bg-slate-200 rounded-full"
                style={{ animation: 'blink 3s infinite' }}
              ></div>
              <div 
                className="w-2 h-2 bg-slate-800 dark:bg-slate-200 rounded-full"
                style={{ animation: 'blink 3s infinite' }}
              ></div>
            </div>
          </div>

          {/* ลำตัวหุ่นยนต์ */}
          <div className="absolute top-[42px] left-[20px] w-[50px] h-[40px] bg-indigo-600 rounded-md border-[3px] border-slate-800 dark:border-slate-200"></div>

          {/* ล้อหุ่นยนต์ */}
          <div className="absolute bottom-0 left-[32px] w-[26px] h-[14px] bg-slate-800 dark:bg-slate-200 rounded-full"></div>

          {/* แขนถือไม้กวาด */}
          <div 
            className="absolute top-[52px] left-[8px] w-[25px] h-[1.5px] bg-slate-800 dark:bg-slate-200 rounded-full origin-right"
            style={{ animation: 'sweepArm 0.8s ease-in-out infinite alternate' }}
          >
            <div 
              className="absolute -top-3 -left-3 w-[25px] h-[25px] origin-bottom-right"
              style={{ animation: 'sweepBroom 0.8s ease-in-out infinite alternate' }}
            >
              <div className="absolute top-[5px] left-[12px] w-[3px] h-[25px] bg-amber-500 rotate-[-30deg]"></div>
              <div className="absolute bottom-0 left-0 w-[15px] h-2 bg-amber-300 rounded-[2px]"></div>
            </div>
          </div>

        </div>

        {/* ฝุ่นที่กำลังถูกกวาด */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" style={{ animation: 'cleanDust 0.8s ease-in-out infinite' }}></div>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" style={{ animation: 'cleanDust 0.8s ease-in-out infinite 0.2s' }}></div>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" style={{ animation: 'cleanDust 0.8s ease-in-out infinite 0.4s' }}></div>
        </div>
      </div>

      {/* ข้อความ Error 404 */}
      <h1 className="text-7xl font-bold text-red-500 tracking-wider mb-2">404</h1>
      <h2 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        อุ๊ย! หาหน้าที่คุณต้องการไม่พบ
      </h2>
      <p className="text-slate-400 text-sm md:text-base mb-8 max-w-md">
        หน้านี้อาจจะถูกลบ ย้าย หรือไม่มีอยู่ตั้งแต่แรก เจ้าหุ่นยนต์กำลังกวาดล้างทำความสะอาดให้อยู่พอดีเลย!
      </p>

      {/* ปุ่มกลับหน้าแรก */}
      <Link
        to="/"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-normal px-8 py-3 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/30"
      >
        กลับสู่หน้าแรก
      </Link>
      
    </div>
  );
}