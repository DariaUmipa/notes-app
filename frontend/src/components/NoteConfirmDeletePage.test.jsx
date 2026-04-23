import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NoteConfirmDeletePage from './NoteConfirmDeletePage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}))

describe('NoteConfirmDeletePage', () => {
  const mockShowMessage = jest.fn()
  const mockNote = {
    id: 1,
    title: 'Заметка для удаления',
    content: 'Содержание'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('отображает страницу подтверждения удаления', async () => {
    API.get.mockResolvedValueOnce({ data: mockNote })

    render(
      <BrowserRouter>
        <NoteConfirmDeletePage showMessage={mockShowMessage} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/удаление заметки/i)).toBeInTheDocument()
      expect(screen.getByText(/Заметка для удаления/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /да, удалить/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /отмена/i })).toBeInTheDocument()
    })
  })

  it('удаляет заметку при подтверждении', async () => {
    API.get.mockResolvedValueOnce({ data: mockNote })
    API.delete.mockResolvedValueOnce({ data: { success: true } })

    render(
      <BrowserRouter>
        <NoteConfirmDeletePage showMessage={mockShowMessage} />
      </BrowserRouter>
    )

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /да, удалить/i }))
    })

    await waitFor(() => {
      expect(API.delete).toHaveBeenCalledWith('notes/1/delete/')
      expect(mockShowMessage).toHaveBeenCalledWith('Заметка успешно удалена!', 'success')
    })
  })
})