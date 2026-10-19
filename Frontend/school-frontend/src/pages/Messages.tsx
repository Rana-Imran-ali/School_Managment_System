import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { Message } from '../types';
import { initialMessages, initialUsers, getStoredData, saveStoredData } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../api/messageService';

export const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() =>
    getStoredData('messages_list', initialMessages)
  );

  const [activeContactId, setActiveContactId] = useState<number>(2); // Dr. Sarah Jenkins
  const [replyText, setReplyText] = useState('');

  const currentUserId = Number(currentUser.id) || 1;
  const otherUsers = initialUsers.filter((u) => u.id !== currentUserId);
  const activeContact = initialUsers.find((u) => u.id === activeContactId) || otherUsers[0];

  // Fetch live conversation thread from backend
  React.useEffect(() => {
    let isMounted = true;
    messageService
      .getConversation(activeContactId)
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          const mapped: Message[] = items.map((m: any) => ({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            body: m.message,
            is_read: m.is_read,
            created_at: m.created_at || 'Just now',
          }));
          setMessages((prev) => {
            const others = prev.filter(
              (p) =>
                !(
                  (p.sender_id === currentUserId && p.receiver_id === activeContactId) ||
                  (p.sender_id === activeContactId && p.receiver_id === currentUserId)
                )
            );
            return [...others, ...mapped];
          });
        }
      })
      .catch((err) => {
        console.warn('Backend message thread fetch error, using local data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeContactId, currentUserId]);

  // Conversation between currentUser and activeContact
  const thread = messages.filter(
    (m) =>
      (m.sender_id === currentUserId && m.receiver_id === activeContact.id) ||
      (m.sender_id === activeContact.id && m.receiver_id === currentUserId)
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await messageService.sendMessage({
        receiver_id: Number(activeContact.id),
        message: replyText.trim(),
      });
    } catch (err) {
      console.warn('Backend message dispatch error, storing locally:', err);
    }

    const newMessage: Message = {
      id: Date.now(),
      sender_id: currentUserId,
      receiver_id: activeContact.id,
      body: replyText.trim(),
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    saveStoredData('messages_list', updated);
    setReplyText('');
  };

  return (
    <div id="messages-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Communications & Direct Inquiries</h1>
          <p className="page-subtitle">
            Secure direct messaging channel between school administrators, faculty instructors, and parents.
          </p>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          height: '620px',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left Contacts Sidebar */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>DIRECT CONVERSATIONS</div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search staff or parents..."
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {otherUsers.map((user) => {
              const isSelected = user.id === activeContact.id;
              return (
                <div
                  key={user.id}
                  onClick={() => setActiveContactId(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt=""
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Active Contact Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              background: 'var(--bg-glass-strong)',
            }}
          >
            <img
              src={activeContact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt=""
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{activeContact.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeContact.role.toUpperCase()} • {activeContact.email}
              </div>
            </div>
          </div>

          {/* Messages Thread */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {thread.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
                No prior correspondence with {activeContact.name}. Send a note below!
              </div>
            ) : (
              thread.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1.15rem',
                        borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMine ? 'var(--primary-gradient)' : 'var(--bg-card-hover)',
                        color: isMine ? '#ffffff' : 'var(--text-main)',
                        border: isMine ? 'none' : '1px solid var(--border-subtle)',
                        fontSize: '0.88rem',
                        lineHeight: '1.5',
                        boxShadow: isMine ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
                      }}
                    >
                      {msg.body}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                      {msg.created_at}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.75rem',
              background: 'var(--bg-card)',
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder={`Write a confidential message to ${activeContact.name}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" id="btn-send-message">
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
