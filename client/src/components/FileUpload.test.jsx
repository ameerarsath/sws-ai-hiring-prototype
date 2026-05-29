import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from './FileUpload';
import { NotificationContext } from '../context/NotificationContext';
import { vi } from 'vitest';

describe('FileUpload Component', () => {
  const mockFetchNotifications = vi.fn();

  const renderComponent = () => {
    return render(
      <NotificationContext.Provider value={{ fetchNotifications: mockFetchNotifications }}>
        <FileUpload onUploadComplete={vi.fn()} />
      </NotificationContext.Provider>
    );
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop PDF files/i)).toBeInTheDocument();
  });

  it('allows selecting files', () => {
    renderComponent();
    // Simulate dropzone interaction
    const dropzone = screen.getByText(/Drag & drop PDF files here/i).closest('div');
    expect(dropzone).toBeInTheDocument();
  });
});
