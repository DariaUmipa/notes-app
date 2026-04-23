import { render, screen, waitFor } from '@testing-library/react'
import StatisticsPage from './StatisticsPage'
import API from '../services/api'

jest.mock('../services/api', () => ({
  get: jest.fn(),
}))

describe('StatisticsPage', () => {
  const mockStats = {
    total_notes: 5,
    important_notes: 2,
    colors: {
      'Белый': 1,
      'Жёлтый': 2,
      'Зелёный': 1,
      'Синий': 1
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('отображает статистику', async () => {
    API.get.mockResolvedValueOnce({ data: mockStats })

    render(<StatisticsPage />)

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
      // Используем getAllByText, так как число 2 встречается дважды
      const twoElements = screen.getAllByText('2')
      expect(twoElements.length).toBeGreaterThan(0)
      expect(screen.getByText(/всего заметок/i)).toBeInTheDocument()
      expect(screen.getByText(/важных заметок/i)).toBeInTheDocument()
    })
  })

  it('отображает распределение по цветам', async () => {
    API.get.mockResolvedValueOnce({ data: mockStats })

    render(<StatisticsPage />)

    await waitFor(() => {
      expect(screen.getByText('Белый')).toBeInTheDocument()
      expect(screen.getByText('Жёлтый')).toBeInTheDocument()
      expect(screen.getByText('Зелёный')).toBeInTheDocument()
    })
  })

  it('отображает сообщение об ошибке при загрузке', async () => {
    API.get.mockRejectedValueOnce(new Error('Ошибка'))

    render(<StatisticsPage />)

    await waitFor(() => {
      expect(screen.getByText(/не удалось загрузить статистику/i)).toBeInTheDocument()
    })
  })
})