import { useMemo, useState } from 'react';
import { POSTCARD_CHARACTERS } from '../data/postcardCharacters';
import { submitPostcard } from '../lib/api';

const SUCCESS_LINE =
  'Your postcard is sealed and on its way to the hills. Our curators will stamp it soon — once approved, it will appear on this wall for fellow travellers to find.';

export default function AddPostcardModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [avatarMode, setAvatarMode] = useState('character');
  const [avatarFile, setAvatarFile] = useState(null);
  const [gender, setGender] = useState('female');
  const [characterId, setCharacterId] = useState(POSTCARD_CHARACTERS.female[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const characters = useMemo(() => POSTCARD_CHARACTERS[gender] || [], [gender]);
  const selectedChar = characters.find((c) => c.id === characterId) || characters[0];

  if (!open) return null;

  const reset = () => {
    setName('');
    setFrom('');
    setText('');
    setMediaFiles([]);
    setAvatarMode('character');
    setAvatarFile(null);
    setGender('female');
    setCharacterId(POSTCARD_CHARACTERS.female[0].id);
    setBusy(false);
    setError('');
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || name.trim().length < 2) {
      setError('Please add your name.');
      return;
    }
    if (!text.trim() || text.trim().length < 20) {
      setError('Write a little more — a postcard should carry a real moment.');
      return;
    }
    if (!mediaFiles.length) {
      setError('Add at least one photo or video from your stay.');
      return;
    }
    if (avatarMode === 'photo' && !avatarFile) {
      setError('Upload a photo of yourself, or switch to a character stamp.');
      return;
    }
    if (avatarMode === 'character' && !selectedChar) {
      setError('Pick a character stamp for your postcard.');
      return;
    }

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('from', from.trim());
    fd.append('text', text.trim());
    fd.append('avatarMode', avatarMode);
    mediaFiles.forEach((f) => fd.append('media', f));
    if (avatarMode === 'photo') {
      fd.append('avatar', avatarFile);
    } else {
      fd.append('gender', gender);
      fd.append('characterId', selectedChar.id);
      fd.append('characterEmoji', selectedChar.emoji);
    }

    setBusy(true);
    try {
      await submitPostcard(fd);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pc-modal-root" role="dialog" aria-modal="true" aria-label="Add a postcard">
      <button type="button" className="pc-modal-backdrop" aria-label="Close" onClick={handleClose} />
      <div className="pc-modal">
        {done ? (
          <div className="pc-modal-success">
            <span className="pc-modal-success-stamp" aria-hidden="true">✉</span>
            <h3>Postcard received</h3>
            <p>{SUCCESS_LINE}</p>
            <button type="button" className="btn btn-amber" onClick={handleClose}>
              Back to the wall
            </button>
          </div>
        ) : (
          <>
            <header className="pc-modal-head">
              <div>
                <p className="pc-modal-eyebrow">Send a postcard</p>
                <h3>Share a moment from your stay</h3>
              </div>
              <button type="button" className="pc-modal-close" onClick={handleClose} aria-label="Close">
                ×
              </button>
            </header>

            <form className="pc-modal-form" onSubmit={onSubmit}>
              <label className="pc-field">
                <span>Your name *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya" required />
              </label>
              <label className="pc-field">
                <span>From (city)</span>
                <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Delhi" />
              </label>

              <p className="pc-font-hint">
                Every story gets its own postcard paper and handwriting — stamped uniquely when you send.
              </p>

              <label className="pc-field pc-field--full">
                <span>Your note *</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  placeholder="What will you remember from the mountains?"
                  required
                />
              </label>

              <label className="pc-field pc-field--full">
                <span>Photos / videos from your stay *</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                />
                {mediaFiles.length ? (
                  <small>{mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected</small>
                ) : null}
              </label>

              <fieldset className="pc-field pc-field--full pc-avatar-block">
                <legend>Your face on the postcard *</legend>
                <div className="pc-avatar-modes">
                  <button
                    type="button"
                    className={`pc-mode-btn${avatarMode === 'photo' ? ' is-on' : ''}`}
                    onClick={() => setAvatarMode('photo')}
                  >
                    Upload photo
                  </button>
                  <button
                    type="button"
                    className={`pc-mode-btn${avatarMode === 'character' ? ' is-on' : ''}`}
                    onClick={() => setAvatarMode('character')}
                  >
                    Choose character
                  </button>
                </div>

                {avatarMode === 'photo' ? (
                  <label className="pc-field">
                    <span>Face photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <>
                    <div className="pc-gender">
                      <button
                        type="button"
                        className={`pc-mode-btn${gender === 'female' ? ' is-on' : ''}`}
                        onClick={() => {
                          setGender('female');
                          setCharacterId(POSTCARD_CHARACTERS.female[0].id);
                        }}
                      >
                        Female
                      </button>
                      <button
                        type="button"
                        className={`pc-mode-btn${gender === 'male' ? ' is-on' : ''}`}
                        onClick={() => {
                          setGender('male');
                          setCharacterId(POSTCARD_CHARACTERS.male[0].id);
                        }}
                      >
                        Male
                      </button>
                    </div>
                    <div className="pc-char-grid">
                      {characters.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`pc-char${characterId === c.id ? ' is-on' : ''}`}
                          onClick={() => setCharacterId(c.id)}
                        >
                          <span className="pc-char-emoji">{c.emoji}</span>
                          <span className="pc-char-label">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </fieldset>

              {error ? <p className="pc-form-error">{error}</p> : null}

              <div className="pc-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber" disabled={busy}>
                  {busy ? 'Sending…' : 'Send postcard'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
