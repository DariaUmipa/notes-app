import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotesListPage from './NotesListPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
}))

describe('NotesListPage', () => {
  const mockShowMessage = jest.fn()
  const mockNotes = [
    { 
      id: 1, 
      title: 'Заметка 1', 
      content: 'Содержание заметки 1', 
      color: 'white', 
      is_important: false, 
      created_at: '2026-04-20T10:00:00Z',
      category_name: 'Работа'
    },
    { 
      id: 2, 
      title: 'Заметка 2', 
      content: 'Содержание заметки 2', 
      color: 'yellow', 
      is_important: true, 
      created_at: '2026-04-19T10:00:00Z',
      category_name: 'Личное'
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('загружает и отображает список заметок', async () => {
    // Мокаем для этого теста
    API.get
      .mockResolvedValueOnce({ data: mockNotes })  
      .mockResolvedValueOnce({ data: [] })         
      .mockResolvedValueOnce({ data: [] })         

    render(
      <BrowserRouter>
        <NotesListPage showMessage={mockShowMessage} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Заметка 1')).toBeInTheDocument()
      expect(screen.getByText(/Заметка 2/)).toBeInTheDocument()
    })
  })

  it('отображает сообщение, когда заметок нет', async () => {
    
    API.get
      .mockResolvedValueOnce({ data: [] })  
      .mockResolvedValueOnce({ data: [] })  
      .mockResolvedValueOnce({ data: [] })  

    render(
      <BrowserRouter>
        <NotesListPage showMessage={mockShowMessage} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/у вас пока нет заметок/i)).toBeInTheDocument()
    })
  })
})