// Tiny ephemeral notification. Controlled by App.jsx.
// Stays mounted; toggles a "show" class so the CSS transition runs.

export default function Toast({ message }) {
  return <div className={'toast' + (message ? ' show' : '')}>{message}</div>;
}
