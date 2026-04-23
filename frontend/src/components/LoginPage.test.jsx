import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  post: jest.fn(),
}))

describe('LoginPage', () => {
  const mockOnLogin = jest.fn()
  const mockShowMessage = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    render(
      <BrowserRouter>
        <LoginPage onLogin={mockOnLogin} showMessage={mockShowMessage} />
      </BrowserRouter>
    )
  })

  it('отображает форму входа', () => {
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument()
  })

  it('показывает ошибку при неверных данных', async () => {
    API.post.mockRejectedValueOnce({ response: { status: 400 } })

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'wronguser' } })
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(screen.getByText(/неверное имя пользователя или пароль/i)).toBeInTheDocument()
    })
  })

  it('вызывает onLogin при успешном входе', async () => {
    API.post.mockResolvedValueOnce({ data: { success: true } })

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Test123!' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
      expect(mockShowMessage).toHaveBeenCalledWith('Вы успешно вошли в систему!', 'success')
    })
  })
})