function VideoPlaceholder() {
  return (
    <div className="video-placeholder">
      <div style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          position: 'absolute',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '2px solid var(--accent-neon)',
          boxShadow: 'var(--accent-neon-glow)',
          opacity: '0.3'
        }}></div>
        <div style={{ 
          position: 'absolute',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-neon)',
          boxShadow: 'var(--accent-neon-glow)',
          opacity: '0.5'
        }}></div>
        <p style={{ 
          zIndex: '1',
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>VIDEO NOT LOADED</p>
      </div>
    </div>
  );
}

export default VideoPlaceholder;
