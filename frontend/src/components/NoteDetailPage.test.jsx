import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NoteDetailPage from './NoteDetailPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}))

describe('NoteDetailPage', () => {
  const mockNote = {
    id: 1,
    title: 'Тестовая заметка',
    content: 'Содержание заметки',
    color: 'yellow',
    is_important: true,
    created_at: '2026-04-20T10:00:00Z',
    updated_at: '2026-04-20T10:00:00Z',
    category_name: 'Работа'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('загружает и отображает детали заметки', async () => {
    API.get.mockResolvedValueOnce({ data: mockNote })

    render(
      <BrowserRouter>
        <NoteDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Тестовая заметка/)).toBeInTheDocument()
      expect(screen.getByText('Содержание заметки')).toBeInTheDocument()
      expect(screen.getByText('Работа')).toBeInTheDocument()
    })
  })

  it('отображает сообщение об ошибке при загрузке', async () => {
    API.get.mockRejectedValueOnce(new Error('Ошибка'))

    render(
      <BrowserRouter>
        <NoteDetailPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить заметку/i)).toBeInTheDocument()
    })
  })
})