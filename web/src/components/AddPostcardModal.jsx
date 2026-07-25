import { useEffect, useMemo, useState } from 'react';
import { POSTCARD_CHARACTERS } from '../data/postcardCharacters';
import { submitPostcard } from '../lib/api';

const SUCCESS_LINE =
  'Your postcard is sealed and on its way to the hills. Our curators will stamp it soon — once approved, it will appear on this wall for fellow travellers to find.';

const STEPS = [
  { id: 1, label: 'Note', hint: 'Who & what to say' },
  { id: 2, label: 'Moments', hint: 'Photos from the stay' },
  { id: 3, label: 'Stamp', hint: 'Your face on the card' },
];

const MOBILE_MQ = '(max-width: 768px)';

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
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const characters = useMemo(() => POSTCARD_CHARACTERS[gender] || [], [gender]);
  const selectedChar = characters.find((c) => c.id === characterId) || characters[0];

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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
    setStep(1);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep = (n) => {
    if (n === 1) {
      if (!name.trim() || name.trim().length < 2) return 'Please add your name.';
      if (!text.trim() || text.trim().length < 20) {
        return 'Write a little more — a postcard should carry a real moment.';
      }
    }
    if (n === 2 && !mediaFiles.length) {
      return 'Add at least one photo or video from your stay.';
    }
    if (n === 3) {
      if (avatarMode === 'photo' && !avatarFile) {
        return 'Upload a photo of yourself, or switch to a character stamp.';
      }
      if (avatarMode === 'character' && !selectedChar) {
        return 'Pick a character stamp for your postcard.';
      }
    }
    return '';
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Desktop submits from any view; mobile should be on step 3
    for (let n = 1; n <= 3; n += 1) {
      const msg = validateStep(n);
      if (msg) {
        setError(msg);
        setStep(n);
        return;
      }
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
    setError('');
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
      <div className={`pc-modal pc-modal--step-${step}`}>
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

            <nav className="pc-steps" aria-label="Postcard steps">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`pc-step${step === s.id ? ' is-on' : ''}${step > s.id ? ' is-done' : ''}`}
                  onClick={() => {
                    if (s.id < step) {
                      setError('');
                      setStep(s.id);
                    }
                  }}
                  aria-current={step === s.id ? 'step' : undefined}
                >
                  <span className="pc-step-num">{s.id}</span>
                  <span className="pc-step-copy">
                    <strong>{s.label}</strong>
                    <em>{s.hint}</em>
                  </span>
                </button>
              ))}
            </nav>

            <form className="pc-modal-form" onSubmit={onSubmit}>
              <div className="pc-step-panel" data-step="1">
                <div className="pc-name-row">
                  <label className="pc-field">
                    <span>Your name *</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya" required />
                  </label>
                  <label className="pc-field">
                    <span>From (city)</span>
                    <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Delhi" />
                  </label>
                </div>

                <p className="pc-font-hint">
                  Every story gets its own postcard paper and handwriting — stamped uniquely when you send.
                </p>

                <label className="pc-field pc-field--full">
                  <span>Your note *</span>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    placeholder="What will you remember from the mountains?"
                    required
                  />
                </label>
              </div>

              <div className="pc-step-panel" data-step="2">
                <label className="pc-field pc-field--full pc-dropzone">
                  <span className="pc-dropzone-title">Photos / videos from your stay *</span>
                  <span className="pc-dropzone-card">
                    <span className="pc-dropzone-icon" aria-hidden="true">📷</span>
                    <strong>{mediaFiles.length ? 'Add more moments' : 'Tap to add your moments'}</strong>
                    <em>Photos or short videos · you can pick several</em>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                    />
                  </span>
                  {mediaFiles.length ? (
                    <ul className="pc-file-chips">
                      {mediaFiles.map((f) => (
                        <li key={`${f.name}-${f.size}`}>{f.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </label>
              </div>

              <div className="pc-step-panel" data-step="3">
                <div
                  className="pc-field pc-field--full pc-avatar-block"
                  role="group"
                  aria-labelledby="pc-avatar-heading"
                >
                  <p id="pc-avatar-heading" className="pc-avatar-heading">
                    Your face on the postcard *
                  </p>
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
                    <label className="pc-field pc-dropzone pc-dropzone--face">
                      <span className="pc-dropzone-card">
                        <span className="pc-dropzone-icon" aria-hidden="true">🙂</span>
                        <strong>{avatarFile ? avatarFile.name : 'Tap to upload your face photo'}</strong>
                        <em>A clear portrait works best</em>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        />
                      </span>
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
                </div>
              </div>

              {error ? <p className="pc-form-error">{error}</p> : null}

              <div className="pc-modal-actions">
                {isMobile && step > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={goBack}>
                    Back
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={handleClose}>
                    Cancel
                  </button>
                )}
                {isMobile && step < 3 ? (
                  <button type="button" className="btn btn-amber" onClick={goNext}>
                    Continue
                  </button>
                ) : (
                  <button type="submit" className="btn btn-amber" disabled={busy}>
                    {busy ? 'Sending…' : 'Send postcard'}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
