import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('sends guests to the login page', async () => {
    render(<App />)
    expect(await screen.findByRole('button', { name: /登\s*录/ })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/login')
  })
})
