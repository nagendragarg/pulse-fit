import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Loader2, Clock, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../components/Toast.tsx';
import { Message, ContactItem } from '../../types/index.ts';

export const UserMessagingPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadContacts = async () => {
    try {
      const data = await api.get<ContactItem[]>('/messages/contacts');
      setContacts(data);
      if (data.length > 0 && !activeContactId) {
        setActiveContactId(data[0].contact.id);
      }
    } catch (err: any) {
      console.error('Failed to load contacts:', err);
    }
  };

  const loadConversation = async (contactId: string) => {
    try {
      const res = await api.get<{ contact: any; messages: Message[] }>(`/messages/${contactId}`);
      setMessages(res.messages);
    } catch (err: any) {
      error(err.message || 'Failed to load conversation', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (activeContactId) {
      loadConversation(activeContactId);
    }
  }, [activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeContactId) return;

    setIsSending(true);
    try {
      const newMsg = await api.post<Message>('/messages', {
        receiverId: activeContactId,
        content: inputContent.trim(),
      });

      setMessages((prev) => [...prev, newMsg]);
      setInputContent('');
      loadContacts();
    } catch (err: any) {
      error(err.message || 'Failed to send message', 'Error');
    } finally {
      setIsSending(false);
    }
  };

  const activeContact = contacts.find((c) => c.contact.id === activeContactId)?.contact;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col sm:flex-row rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden">
      {/* Left Contacts List */}
      <div
        className={`w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-zinc-850 bg-zinc-950/80 flex flex-col ${
          mobileShowChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-zinc-850">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> Coaches & Staff
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {contacts.map((c) => {
            const isSelected = c.contact.id === activeContactId;
            return (
              <button
                key={c.contact.id}
                onClick={() => {
                  setActiveContactId(c.contact.id);
                  setMobileShowChat(true);
                }}
                className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                  isSelected ? 'bg-zinc-900' : 'hover:bg-zinc-900/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0 flex items-center justify-center font-bold text-white text-xs">
                  {c.contact.avatarUrl ? (
                    <img src={c.contact.avatarUrl} alt={c.contact.name} className="w-full h-full object-cover" />
                  ) : (
                    c.contact.name.charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{c.contact.name}</h4>
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400 capitalize">{c.contact.role.toLowerCase()}</div>
                  <p className="text-xs text-zinc-500 truncate mt-1">
                    {c.latestMessage ? c.latestMessage.content : 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Thread */}
      <div
        className={`flex-1 flex flex-col bg-black ${
          !mobileShowChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Thread Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-950/60">
          {activeContact ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileShowChat(false)}
                className="sm:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Back to contacts list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {activeContact.avatarUrl ? (
                  <img src={activeContact.avatarUrl} alt={activeContact.name} className="w-full h-full object-cover" />
                ) : (
                  activeContact.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{activeContact.name}</h3>
                <span className="text-[10px] text-emerald-400 font-medium">Direct Line • Dedicated Coach</span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">Select a contact</span>
          )}
        </div>

        {/* Message Bubble Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.length > 0 ? (
            messages.map((m) => {
              const isMine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-500 text-black font-medium rounded-br-none shadow-md shadow-emerald-500/10'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No messages yet in this conversation. Say hello!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-850 bg-zinc-950 flex items-center gap-2">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Type your message to coach..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isSending || !inputContent.trim()}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black transition-all font-bold disabled:opacity-40"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
