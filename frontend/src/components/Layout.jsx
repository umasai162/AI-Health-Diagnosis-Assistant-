import Sidebar from './Sidebar';

const styles = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: {
    marginLeft: 240,
    flex: 1,
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    overflowY: 'auto',
  },
  content: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
};

export default function Layout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}
