import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}))

describe('RegisterPage', () => {
  const mockOnLogin = jest.fn()
  const mockShowMessage = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Мокаем все вызовы API по умолчанию
    API.get.mockResolvedValue({ data: { exists: false } })
    
    render(
      <BrowserRouter>
        <RegisterPage onLogin={mockOnLogin} showMessage={mockShowMessage} />
      </BrowserRouter>
    )
  })

  it('отображает форму регистрации', () => {
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
    expect(screen.getByTestId('password1-input')).toBeInTheDocument()
    expect(screen.getByTestId('password2-input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument()
  })

  it('показывает ошибку при коротком имени пользователя', async () => {
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'te' } })
    fireEvent.change(screen.getByTestId('password1-input'), { target: { value: 'Test123!' } })
    fireEvent.change(screen.getByTestId('password2-input'), { target: { value: 'Test123!' } })
    fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }))

    await waitFor(() => {
      expect(screen.getByText(/минимум 3 символа/i)).toBeInTheDocument()
    })
  })

  it('показывает ошибку при несовпадающих паролях', async () => {
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByTestId('password1-input'), { target: { value: 'Test123!' } })
    fireEvent.change(screen.getByTestId('password2-input'), { target: { value: 'Test456!' } })
    fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }))

    await waitFor(() => {
      expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument()
    })
  })

  it('успешно регистрирует пользователя', async () => {
    API.post.mockResolvedValueOnce({ data: { success: true } })

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByTestId('password1-input'), { target: { value: 'Test123!' } })
    fireEvent.change(screen.getByTestId('password2-input'), { target: { value: 'Test123!' } })
    fireEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
      expect(mockShowMessage).toHaveBeenCalledWith('Регистрация прошла успешно!', 'success')
    })
  })
})