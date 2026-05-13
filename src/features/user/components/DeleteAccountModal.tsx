import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === '계정 삭제';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">계정을 삭제하시겠습니까?</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          모든 대화 기록과 분기 데이터가 삭제됩니다. 계속하려면 아래에
          <span className="text-white font-bold"> 계정 삭제</span>를 입력하세요.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="계정 삭제"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="ghost" fullWidth>
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canDelete}
            variant="danger"
            fullWidth
            className="bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-700"
          >
            계정 삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
