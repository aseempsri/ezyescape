import { useState } from 'react';
import WalletBadge from './WalletBadge';
import WalletModal from './WalletModal';

export default function WalletNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <WalletBadge onClick={() => setOpen(true)} />
      <WalletModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
