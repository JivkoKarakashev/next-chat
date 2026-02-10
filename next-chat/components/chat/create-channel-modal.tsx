'use client';

import { useState } from 'react';

interface ModalProps {
  onClose: () => void,
  onSubmit: (channelName: string) => void
}

const CreateChannelModal = ({ onClose, onSubmit }: ModalProps): React.ReactElement => {
  const [name, setName] = useState('');

  const submit = () => {
    const channel = name.trim().toLowerCase();
    if (!channel) {
      return;
    }

    onSubmit(channel);
    setName('');
    onClose();
  };

  return (
    <>
      <dialog id="my_modal_5" className="modal modal-open sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create channel</h3>
          <input
            autoFocus
            value={name}
            placeholder='--Channel name HERE--'
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <div className="modal-action">
            {/* if there is a button in form, it will close the modal */}
            <button onClick={onClose} className="btn btn-neutral btn-dash">Cancel</button>
            <button onClick={submit} className="btn btn-soft btn-success">Create</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default CreateChannelModal;