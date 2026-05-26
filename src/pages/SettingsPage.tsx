import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/components/ui/Button';
import { PATHS } from '../app/router/routes';
import { LLM_OPTIONS } from '../features/chat/constants/llm';
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from '../features/settings/constants';
import SettingsSelect from '../features/settings/components/SettingsSelect';
import { useSettings } from '../features/settings/hooks/useSettings';
import type { LlmModel } from '../features/chat/types';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
        <Link
          to={PATHS.CHAT}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          대화로 돌아가기
        </Link>

        <Link to={PATHS.CHAT} className="text-xl font-black tracking-tight hover:opacity-80 transition">
          <span className="text-gradient-blue">A</span>IT
        </Link>

        <Button
          onClick={() => updateSettings({
            defaultLlmModel: LLM_OPTIONS[0].model,
            themeMode: 'system',
            language: 'ko',
          })}
          variant="ghost"
          size="sm"
        >
          초기화
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-black mb-8 text-white">환경 설정</h1>

        <div className="space-y-6">
          <section className="card p-5 rounded-2xl">
            <p className="section-label mb-4">대화 기본값</p>
            <SettingsSelect
              id="default-llm-model"
              label="새 대화 기본 모델"
              value={settings.defaultLlmModel}
              options={LLM_OPTIONS.map(option => ({
                value: option.model,
                label: option.label,
              }))}
              onChange={value => updateSettings({ defaultLlmModel: value as LlmModel })}
            />
          </section>

          <section className="card p-5 rounded-2xl">
            <p className="section-label mb-4">화면</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SettingsSelect
                id="theme-mode"
                label="테마"
                value={settings.themeMode}
                options={THEME_OPTIONS}
                onChange={themeMode => updateSettings({ themeMode })}
              />
              <SettingsSelect
                id="language"
                label="언어"
                value={settings.language}
                options={LANGUAGE_OPTIONS}
                onChange={language => updateSettings({ language })}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
