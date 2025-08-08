import { render, screen } from '@testing-library/react';
import App from './App';

test('renders snake game header', () => {
  render(<App />);
  const headerElement = screen.getByText(/snake game/i);
  expect(headerElement).toBeInTheDocument();
});
