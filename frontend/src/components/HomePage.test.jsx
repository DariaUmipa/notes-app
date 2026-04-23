import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('отображает приветствие для неавторизованного пользователя', () => {
    render(
      <BrowserRouter>
        <HomePage isAuthenticated={false} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/добро пожаловать/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /начать работу/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument()
  })

  it('отображает ссылку перехода к заметкам для авторизованного пользователя', () => {
    render(
      <BrowserRouter>
        <HomePage isAuthenticated={true} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/добро пожаловать/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /перейти к заметкам/i })).toBeInTheDocument()
  })

  it('отображает блок возможностей', () => {
    render(
      <BrowserRouter>
        <HomePage isAuthenticated={false} />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/возможности приложения/i)).toBeInTheDocument()
    expect(screen.getByText(/создание заметок/i)).toBeInTheDocument()
    expect(screen.getByText(/цветовая маркировка/i)).toBeInTheDocument()
    const importantElements = screen.getAllByText(/важные заметки/i)
    expect(importantElements.length).toBeGreaterThan(0)
    expect(screen.getByText(/поиск и фильтры/i)).toBeInTheDocument()
  })
})