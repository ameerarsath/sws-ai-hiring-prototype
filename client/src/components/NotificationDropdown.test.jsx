import { render, screen, fireEvent } from '@testing-library/react';
import NotificationDropdown from './NotificationDropdown';
import { NotificationContext } from '../context/NotificationContext';
import { vi } from 'vitest';

const mockNotifications = [
  { id: 1, message: 'Test message 1', is_read: 0, timestamp: new Date().toISOString() },
  { id: 2, message: 'Test message 2', is_read: 1, timestamp: new Date().toISOString() }
];

describe('NotificationDropdown', () => {
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  const renderWithContext = (isOpen = true) => {
    return render(
      <NotificationContext.Provider value={{
        notifications: mockNotifications,
        unreadCount: 1,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
        fetchNotifications: vi.fn()
      }}>
        <NotificationDropdown isOpen={isOpen} onClose={vi.fn()} />
      </NotificationContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    renderWithContext(false);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders notifications correctly', () => {
    renderWithContext(true);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('calls markAllAsRead when Mark all as read is clicked', () => {
    renderWithContext(true);
    const markAllBtn = screen.getByText('Mark all read');
    fireEvent.click(markAllBtn);
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('calls markAsRead when an unread notification is clicked', () => {
    renderWithContext(true);
    const unreadItem = screen.getByTitle('Mark as read');
    fireEvent.click(unreadItem);
    expect(mockMarkAsRead).toHaveBeenCalledWith(1);
  });
});
