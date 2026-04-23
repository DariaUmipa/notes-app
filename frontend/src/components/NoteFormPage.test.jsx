import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NoteFormPage from './NoteFormPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
}))

describe('NoteFormPage (создание)', () => {
  const mockShowMessage = jest.fn()

  beforeEach(async () => {
    jest.clearAllMocks()
    API.get.mockResolvedValue({ data: [] }) // категории
    await act(async () => {
      render(
        <BrowserRouter>
          <NoteFormPage showMessage={mockShowMessage} />
        </BrowserRouter>
      )
    })
  })

  it('отображает форму создания заметки', () => {
    expect(screen.getByTestId('title-input')).toBeInTheDocument()
    expect(screen.getByTestId('content-input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /сохранить/i })).toBeInTheDocument()
  })

  it('успешно создаёт заметку', async () => {
    API.post.mockResolvedValueOnce({ status: 201 })

    fireEvent.change(screen.getByTestId('title-input'), { target: { value: 'Новая заметка' } })
    fireEvent.change(screen.getByTestId('content-input'), { target: { value: 'Содержание новой заметки' } })
    fireEvent.click(screen.getByRole('button', { name: /сохранить/i }))

    await waitFor(() => {
      expect(API.post).toHaveBeenCalled()
      expect(mockShowMessage).toHaveBeenCalledWith('Заметка успешно создана!', 'success')
    })
  })
})