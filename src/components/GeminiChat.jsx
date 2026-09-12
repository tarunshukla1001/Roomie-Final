import { useState, useRef, useEffect } from 'react';
import { askGemini } from '../services/api';
import roomieLogo from '/logo.jpeg';

export default function ModernChatWidget({ ready }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Welcome to Roomie. How can I help you find your perfect stay today?" }
  ]);
  const [input, setInput] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  // State specifically to disable transition animations while dragging
  const [isDragging, setIsDragging] = useState(false);

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const widgetRef = useRef(null);
  
  // High-Performance Drag Refs (Bypasses React State for zero lag)
  const isDraggingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const currentPos = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  
  // Timers to prevent opening/closing accidentally when double-tapping
  const toggleTimeoutRef = useRef(null);
  const doubleTapBlockerRef = useRef(false);

  const suggestions = ["Find a PG", "Pricing & Plans", "Locations"];

  // --- 1. Text Formatter for Gemini Markdown ---
  const formatMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={lineIndex} className="block min-h-[1.2em] mb-1 last:mb-0">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-black">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </span>
      );
    });
  };

  // Helper to sync dragging state and ref
  const setDraggingState = (val) => {
    isDraggingRef.current = val;
    setIsDragging(val);
  };

  // --- 2. Instant PointerCapture Dragging ---
  const handlePointerDown = (e) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Detect Double Click/Tap (Under 400ms)
    if (timeSinceLastClick < 400) {
      e.preventDefault();
      
      // Tell browser to lock all mouse/touch movements to this element
      e.currentTarget.setPointerCapture(e.pointerId);
      setDraggingState(true);
      hasDraggedRef.current = false;
      
      // Block standard clicks from registering for half a second
      doubleTapBlockerRef.current = true;
      setTimeout(() => { doubleTapBlockerRef.current = false; }, 500);

      startPos.current = {
        x: e.clientX - currentPos.current.x,
        y: e.clientY - currentPos.current.y
      };
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    hasDraggedRef.current = true;
    
    currentPos.current = {
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y
    };
    
    // Mutate DOM directly. This prevents lag/stutters associated with React re-renders.
    if (widgetRef.current) {
      widgetRef.current.style.transform = `translate(${currentPos.current.x}px, ${currentPos.current.y}px)`;
    }
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingState(false);
      
      // Wait a fraction of a second before allowing standard clicks again
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    }
  };

  const handleLauncherClick = (e) => {
    e.preventDefault();
    // Do not toggle if the user just dragged, or if they are in the middle of a double-tap
    if (hasDraggedRef.current || doubleTapBlockerRef.current) return;

    if (toggleTimeoutRef.current) clearTimeout(toggleTimeoutRef.current);

    // Wait 250ms before opening to ensure it wasn't the first click of a double-click
    toggleTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current && !doubleTapBlockerRef.current) {
        setIsOpen(prev => !prev);
      }
    }, 250);
  };

  // --- 3. Chat & Scroll Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const userMessage = typeof text === 'string' ? text : input;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    if (typeof text !== 'string') setInput('');
    setIsTyping(true);

    try {
      const aiReply = await askGemini(userMessage);
      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (error) {
      const errMsg = error.message || "Sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { sender: 'ai', text: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!ready) return null;

  return (
    <div 
      ref={widgetRef}
      className={`fixed bottom-6 right-6 z-50 font-sans perspective-1000 ${
        isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'
      }`}
      style={{ 
        transform: `translate(${currentPos.current.x}px, ${currentPos.current.y}px)` 
      }}
    >
      
      {/* Chat Window Popup */}
      <div 
        className={`absolute bottom-20 right-0 w-[360px] sm:w-[400px] origin-bottom-right transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-90'
        }`}
      >
        <div 
          className="w-full bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100/50 overflow-hidden flex flex-col"
          style={{ height: '650px', maxHeight: '85vh' }}
        >
          {/* Header - Double Tap to Drag */}
          <div 
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Double-click and hold to drag"
            style={{ touchAction: 'none' }} // Prevents mobile from scrolling the background
            className={`bg-transparent px-6 pt-6 pb-4 flex items-center justify-between z-10 relative select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div className="flex items-center space-x-4 pointer-events-none">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center p-2.5">
                  <img src={roomieLogo} alt="Roomie AI" className="w-full h-full object-contain" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Roomie AI</h3>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Chat Body - Scrolling fixed via onWheel stopPropagation */}
          <div 
            ref={chatContainerRef}
            onWheel={(e) => e.stopPropagation()} 
            style={{ overscrollBehavior: 'none' }}
            className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-5 relative scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                {msg.sender === 'ai' && idx !== 0 && (
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1.5 mr-2 self-end shadow-sm">
                    <img src={roomieLogo} alt="AI" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className={`px-5 py-3.5 text-[14px] leading-relaxed max-w-[85%] break-words ${
                  msg.sender === 'user' 
                    ? 'bg-black text-white rounded-2xl rounded-br-sm shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm'
                }`}>
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}

            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2 pt-2 animate-fade-in-up">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start items-center space-x-2 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                  <img src={roomieLogo} alt="AI" className="w-full h-full object-contain opacity-50" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-10">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 text-sm text-gray-900 rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none"
              >
                <svg className="w-4 h-4 translate-x-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Launcher Button - Double Tap to Drag */}
      <button
        onClick={handleLauncherClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Double-click and hold to drag"
        style={{
          touchAction: 'none',
          transform: `translateZ(${isHovered ? 20 : 0}px) scale(${isHovered ? 1.1 : 1}) rotateX(${isHovered ? -5 : 0}deg)`,
          boxShadow: isHovered 
            ? '0 25px 60px -10px rgba(0,0,0,0.4), 0 0 0 4px rgba(255,255,255,0.1), inset 0 -4px 20px rgba(0,0,0,0.2)' 
            : '0 10px 40px rgba(0,0,0,0.3)',
        }}
        className={`relative w-16 h-16 bg-black text-white rounded-full flex items-center justify-center focus:outline-none transform-gpu ${
          isDragging ? 'cursor-grabbing transition-none' : 'cursor-pointer transition-all duration-500'
        }`}
      >
        <div 
          className="absolute inset-0 rounded-full border border-white/20 transition-all duration-500"
          style={{
            transform: `scale(${isHovered ? 1.25 : 1}) translateZ(-5px)`,
            opacity: isHovered ? 1 : 0,
            boxShadow: isHovered ? '0 0 30px rgba(255,255,255,0.2)' : 'none',
          }}
        ></div>
        
        {isHovered && (
          <>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '1s' }} />
            <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '1.3s', animationDelay: '0.2s' }} />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }} />
          </>
        )}
        
        {isOpen ? (
          <svg className="w-6 h-6 transform rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-inner transition-all duration-300 pointer-events-none"
            style={{
              transform: `translateZ(10px) scale(${isHovered ? 1.05 : 1})`,
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1), 0 -4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <img src={roomieLogo} alt="Launch" className="w-full h-full object-contain transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)' }} />
          </div>
        )}
      </button>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .transform-gpu {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}} />
    </div>
  );
}