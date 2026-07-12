import { Outlet } from 'react-router-dom';
import { ChatbotButton } from './ChatbotButton';

/**
 * Wraps all tourist portal pages.
 * Renders the page (via <Outlet />) plus the floating ChatbotButton.
 */
export default function TouristLayout() {
  return (
    <>
      <Outlet />
      <ChatbotButton />
    </>
  );
}
